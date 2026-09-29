import prisma from '$lib/prisma';

export async function getAuditLogs() {
	const auditLogs = await prisma.auditLog.findMany({
		include: {
			user: {
				select: { username: true, first_name: true, last_name: true }
			}
		},
		orderBy: {
			id: 'desc'
		}
	});

	return auditLogs;
}

export async function searchLogs(query: string) {
	const auditLogs = await prisma.auditLog.findMany({
		where: {
			OR: [{ content: { contains: query, mode: 'insensitive' } }]
		},
		orderBy: {
			id: 'desc'
		}
	});

	return auditLogs;
}

export async function getAuditLog(id: number) {
	const auditLog = await prisma.auditLog.findUnique({
		where: { id },
		include: {
			user: { select: { username: true, first_name: true, last_name: true } }
		}
	});

	if (!auditLog) {
		throw new Error('Audit log not found');
	}

	return auditLog;
}

export async function createAuditLog(action: string, userId: number) {
	return await prisma.auditLog.create({
		data: {
			content: action,
			user_id: userId,
			timestamp: new Date()
		}
	});
}
