import prisma from '$lib/prisma';
import { createAuditLog } from './audit';
import { prefixID } from '$lib/functions/formatters/prefixID';
import { ArchivableModels, type Patient } from '../../generated/prisma/browser';
import type {
	PatientCreateInput,
	PatientPrescriptionCreateInput
} from '../../generated/prisma/models';
import { getDateWhere, resolveDateRange } from '../functions/utils/dbDateUtils';
import { canRunAutoArchive, markAutoArchiveCheck } from './archiveCheck';

export type PatientGenderStat = {
	gender: string;
	count: number;
};

export type PatientAgeStats = {
	label: string;
	count: number;
};

export type PatientDailyStat = {
	date: Date;
	count: number;
};

const patientAgeBuckets = ['0-17', '18-35', '36-50', '51-65', '66+'] as const;

const listFields = {
	id: true,
	full_name: true,
	doctor_assigned: true,
	contact_number: true,
	created_at: true,
	notes: true
};

// List Functions
export async function getPatientList(inArchive = false) {
	const patients = await prisma.patient.findMany({
		select: listFields,
		where: {
			archived: inArchive
		},
		orderBy: {
			id: 'asc'
		}
	});

	return patients;
}

export async function searchPatients(query: string, inArchive = false) {
	const patients = await prisma.patient.findMany({
		where: {
			OR: [
				{ full_name: { contains: query, mode: 'insensitive' } },
				{ contact_number: { contains: query, mode: 'insensitive' } },
				{ doctor_assigned: { contains: query, mode: 'insensitive' } }
			],
			archived: inArchive
		},
		select: listFields,
		orderBy: {
			id: 'asc'
		}
	});

	return patients;
}

// Fetch Functions
export async function getPatient(id: number) {
	const patient = await prisma.patient.findUnique({
		where: {
			id: id
		},
		include: {
			archiver: { select: { username: true, first_name: true, last_name: true } },
			prescriptions: {
				orderBy: { created_at: 'desc' }
			}
		}
	});

	if (!patient) {
		throw new Error('Patient not found');
	}

	return patient;
}

// Create Functions
export async function createPatient(data: PatientCreateInput, userId?: number) {
	const created = await prisma.patient.create({
		data: {
			full_name: data.full_name,
			age: data.age,
			occupation: data.occupation,
			email: data.email,
			contact_number: data.contact_number,
			address: data.address,
			birthdate: data.birthdate,
			gender: data.gender,
			doctor_assigned: data.doctor_assigned,
			notes: data.notes
		}
	});

	if (userId) await createAuditLog(`Created patient ${prefixID(created.id, 'Patients')}`, userId);

	return created;
}

export async function addMedicalHistory(patientName: string, newNotes: string) {
	const patient = await prisma.patient.findFirst({
		where: { full_name: patientName },
		select: { id: true, notes: true }
	});

	if (!patient) throw new Error('Patient not found');
	const updatedNotes = (patient.notes || '') + '\n' + newNotes;

	return await prisma.patient.update({
		where: { id: patient.id },
		data: {
			notes: updatedNotes
		}
	});
}

export async function createPrescription(
	patientId: number,
	data: PatientPrescriptionCreateInput,
	userId?: number
) {
	const created = await prisma.patientPrescription.create({
		data: {
			...data,
			patient: { connect: { id: patientId } }
		}
	});

	if (userId)
		await createAuditLog(
			`Added prescription to patient ${prefixID(patientId, 'Patients')}`,
			userId
		);

	return created;
}

export async function updatePatient(
	id: number,
	data: Parameters<typeof prisma.patient.update>[0]['data'],
	userId?: number
) {
	const updated = await prisma.patient.update({
		where: { id },
		data
	});

	if (userId) await createAuditLog(`Updated patient ${prefixID(id, 'Patients')}`, userId);

	return updated;
}

// Update Functions
export async function archivePatient(id: number, userId?: number, reason?: string) {
	await prisma.patient.update({
		where: { id },
		data: { archived: true, archived_by: userId, archive_reason: reason }
	});

	if (userId) await createAuditLog(`Archived patient ${prefixID(id, 'Patients')}`, userId);
}

export async function unarchivePatient(id: number, userId?: number) {
	await prisma.patient.update({
		where: { id },
		data: { archived: false }
	});

	if (userId) await createAuditLog(`Unarchived patient ${prefixID(id, 'Patients')}`, userId);
}

export async function patientAutoArchive() {
	if (!(await canRunAutoArchive(ArchivableModels.PATIENT))) {
		return { amountArchived: 0 };
	}

	// Get the date 4 years ago
	const archiveCutoffDate = new Date();
	archiveCutoffDate.setFullYear(archiveCutoffDate.getFullYear() - 4);

	// Mark all patients modified more than 4 years as archived
	const result = await prisma.patient.updateMany({
		where: {
			archived: false,
			modified_at: {
				lt: archiveCutoffDate
			}
		},
		data: {
			archived: true,
			archive_reason: 'Auto-archived due to inactivity'
		}
	});

	await markAutoArchiveCheck(ArchivableModels.PATIENT);

	return { amountArchived: result.count };
}

export async function getPatientCount(fromDate?: Date, toDate?: Date) {
	return await prisma.patient.count({
		where: getDateWhere(fromDate, toDate)
	});
}

// Report Functions
export async function getPatientGenderStats(
	fromDate?: Date,
	toDate?: Date
): Promise<PatientGenderStat[]> {
	const groupedPatients = await prisma.patient.groupBy({
		by: ['gender'],
		where: getDateWhere(fromDate, toDate),
		_count: {
			gender: true
		}
	});

	return groupedPatients.map((group) => ({
		gender: group.gender,
		count: group._count.gender
	}));
}

export async function getPatientAgeStats(
	fromDate?: Date,
	toDate?: Date
): Promise<PatientAgeStats[]> {
	const { startDate, endDate } = resolveDateRange(fromDate, toDate);

	const rows = await prisma.$queryRaw<Array<{ label: string; count: number }>>`
		SELECT bucket.label, COALESCE(COUNT(p.id), 0)::int AS count
		FROM (
			VALUES
				('0-17', 0, 17),
				('18-35', 18, 35),
				('36-50', 36, 50),
				('51-65', 51, 65),
				('66+', 66, NULL)
		) AS bucket(label, min_age, max_age)
		LEFT JOIN "Patient" p
			ON p.age >= bucket.min_age
			AND (bucket.max_age IS NULL OR p.age <= bucket.max_age)
			AND p.created_at >= ${startDate}
			AND p.created_at <= ${endDate}
		GROUP BY bucket.label, bucket.min_age
		ORDER BY bucket.min_age ASC
	`;

	const result = patientAgeBuckets.map((label) => ({
		label,
		count: rows.find((r) => r.label === label)?.count ?? 0
	}));

	return result;
}

export async function getPatientDailyStats(
	fromDate?: Date,
	toDate?: Date
): Promise<PatientDailyStat[]> {
	const { startDate, endDate } = resolveDateRange(fromDate, toDate);

	const rows = await prisma.$queryRaw<PatientDailyStat[]>`
		SELECT day::date AS date, COUNT(p.id)::int AS count
		FROM generate_series(
			date_trunc('day', ${startDate}::timestamp),
			date_trunc('day', ${endDate}::timestamp),
			interval '1 day'
		) AS day
		LEFT JOIN "Patient" p
			ON date_trunc('day', p.created_at) = day
			AND p.created_at >= ${startDate}
			AND p.created_at <= ${endDate}
		GROUP BY day
		ORDER BY day ASC
	`;

	const result = rows.map((r: any) => ({ date: new Date(r.date), count: r.count }));

	return result;
}

export async function getPatientSummary(fromDate?: Date, toDate?: Date) {
	const [total, gender, age, daily] = await Promise.all([
		getPatientCount(fromDate, toDate),
		getPatientGenderStats(fromDate, toDate),
		getPatientAgeStats(fromDate, toDate),
		getPatientDailyStats(fromDate, toDate)
	]);

	return {
		total,
		gender,
		age,
		daily
	};
}
