import prisma from '$lib/prisma';
import { createAuditLog } from './audit';
import { ArchivableModels } from '../../generated/prisma/browser';
import type { AppointmentCreateInput, AppointmentUpdateInput } from '../../generated/prisma/models';
import { prefixID } from '$lib/functions/formatters/prefixID';
import { canRunAutoArchive, markAutoArchiveCheck } from './archiveCheck';

// 🟢 FIX: Added status: true so the calendar can actually see if it's completed
const listFields = {
    id: true,
    name: true,
    date: true,
    notes: true,
    status: true, 
    created_at: true,
    doctor_assigned: true
};

export async function getAppointmentList(options: { doctorId?: number; inArchive?: boolean } = {}) {
    const  { doctorId } = options;
    let  {  inArchive } = options;
    if (inArchive === undefined) inArchive = false;

    const where: any = { archived: inArchive };
    if (doctorId && doctorId !== -1) {
        where.doctor_assigned = doctorId;
    }

    const appointments = await prisma.appointment.findMany({
        select: listFields,
        where: {
            archived: inArchive,
            doctor_assigned: { equals: doctorId }
        },
        orderBy: {
            id: 'asc'
        }
    });

    return appointments;
}

export async function searchAppointmentsByPatient(options: {
    doctorId?: number;
    patientName: string;
    inArchive?: boolean;
}) {
    let {  inArchive } = options;
    const { doctorId, patientName,} = options;
    if (inArchive === undefined) inArchive = false;

    const appointments = await prisma.appointment.findMany({
        where: {
            name: { contains: patientName, mode: 'insensitive' },
            archived: inArchive,
            doctor_assigned: { equals: doctorId }
        },
        select: listFields,
        orderBy: {
            id: 'asc'
        }
    });

    if (!appointments) throw new Error('Appointment not found');

    return appointments;
}

export async function checkDateConflict(date: Date, doctorId?: number) {
    const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
            date: date,
            archived: false,
            doctor_assigned: doctorId
        }
    });

    return conflictingAppointment?.id;
}

export async function getAppointment(id: number) {
    const appointment = await prisma.appointment.findUnique({
        where: {
            id: id
        },
        include: {
            archiver: { select: { username: true, first_name: true, last_name: true } },
            doctor: { select: { first_name: true, last_name: true } }
        }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    return appointment;
}

export async function createAppointment(
    data: AppointmentCreateInput,
    doctorId?: number,
    userId?: number
) {
    const created = await prisma.appointment.create({
        data: {
            name: data.name,
            date: new Date(data.date),
            notes: data.notes ?? null,
            doctor_assigned: doctorId
        }
    });

    if (userId) {
        await createAuditLog(`Created appointment ${prefixID(created.id, 'Appointments')}`, userId);
    }

    return created;
}

export async function updateAppointment(
    id: number,
    data: AppointmentUpdateInput | any, // Expanded type safely for partial updates
    doctorId?: number,
    userId?: number
) {
    const { doctor, archiver, ...rest } = data;
  
    const updated = await prisma.appointment.update({
        where: { id },
        data: {
            ...rest,
            ...(doctorId !== undefined && { doctor_assigned: doctorId })
        }
    });

    if (userId) {
        await createAuditLog(`Updated appointment ${prefixID(id, 'Appointments')}`, userId);
    }

    return updated;
}

// 🟢 NEW: Dedicated function to complete appointments securely
export async function completeAppointment(id: number, userId?: number) {
    const updated = await prisma.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' }
    });

    if (userId) {
        await createAuditLog(`Marked appointment ${prefixID(id, 'Appointments')} as completed`, userId);
    }

    return updated;
}

export async function getPatientMedicalHistory(patientName: string) {
    return await prisma.appointment.findMany({
        where: {
            name: patientName,
            // Only fetch appointments that actually have medical notes saved
            medical_notes: { not: undefined }
        },
        orderBy: {
            date: 'desc' // Newest appointments at the top
        },
        select: {
            id: true,
            date: true,
            doctor_assigned: true,
            medical_notes: true
        }
    });
}

export async function archiveAppointment(id: number, userId?: number, reason?: string) {
    await prisma.appointment.update({
        where: { id },
        data: { archived: true, archived_by: userId, archive_reason: reason }
    });

    if (userId) await createAuditLog(`Archived appointment ${prefixID(id, 'Appointments')}`, userId);
}

export async function unarchiveAppointment(id: number, userId?: number) {
    await prisma.appointment.update({
        where: { id },
        data: { archived: false }
    });

    if (userId)
        await createAuditLog(`Unarchived appointment ${prefixID(id, 'Appointments')}`, userId);
}

export async function appointmentAutoArchive() {
    if (!(await canRunAutoArchive(ArchivableModels.APPOINTMENT))) {
        return { amountArchived: 0 };
    }

    // Get the date 1 year ago
    const archiveCutoffDate = new Date();
    archiveCutoffDate.setFullYear(archiveCutoffDate.getFullYear() - 1);

    // Mark all appointments modified more than 1 year ago as archived
    const result = await prisma.appointment.updateMany({
        where: {
            archived: false,
            modified_at: { lt: archiveCutoffDate }
        },
        data: {
            archived: true,
            archive_reason: 'Auto-archived due to inactivity'
        }
    });

    await markAutoArchiveCheck(ArchivableModels.APPOINTMENT);

    return { amountArchived: result.count };
}