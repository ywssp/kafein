import prisma from '$lib/prisma';
import { createAuditLog } from './audit';
import { prefixID } from '$lib/functions/formatters/prefixID';
import type { UserCreateInput, UserUpdateInput } from '../../generated/prisma/models';
import type { UserRoles } from '../../generated/prisma/enums';

const listFields = {
	id: true,
	last_name: true,
	first_name: true,
	contact_number: true,
	role: true,
	created_at: true
};

export async function getUserList(inArchive = false) {
	const users = await prisma.user.findMany({
		select: listFields,
		where: {
			archived: inArchive
		},
		orderBy: {
			id: 'asc'
		}
	});

	return users;
}

export async function getUsersInRole(role: UserRoles, inArchive = false) {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			last_name: true,
			first_name: true,
			username: true,
		},
		where: {
			archived: inArchive,
			role: role
		},
		orderBy: {
			id: 'asc'
		}
	});

	return users;
}

export async function searchUsers(query: string, inArchive = false) {
	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ last_name: { contains: query, mode: 'insensitive' } },
				{ first_name: { contains: query, mode: 'insensitive' } }
			],
			archived: inArchive
		},
		select: listFields,
		orderBy: {
			id: 'asc'
		}
	});

	return users;
}

export async function verifyUniqueFields(username: string, email: string) {
	const usernameCount = await prisma.user.count({
		where: { username: username }
	});

	const emailCount = await prisma.user.count({
		where: { email: email }
	});

	return { usernameUsed: usernameCount > 0, emailUsed: emailCount > 0 };
}

export async function getUser(id: number) {
	const user = await prisma.user.findUnique({
		where: {
			id: id
		},
		select: {
			id: true,
			first_name: true,
			last_name: true,
			username: true,
			contact_number: true,
			email: true,
			role: true,
			archived: true,
			created_at: true,
			modified_at: true,
			archive_reason: true,
			archiver: { select: { username: true, first_name: true, last_name: true } }
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	return user;
}

export async function createUser(data: UserCreateInput, userId?: number) {
	const created = await prisma.user.create({ data });

	if (userId) await createAuditLog(`Created user ${prefixID(created.id, 'Users')}`, userId);

	return created;
}

export async function updateUser(id: number, data: UserUpdateInput, userId?: number) {
	const updated = await prisma.user.update({
		where: { id },
		data
	});

	if (userId) await createAuditLog(`Updated user ${prefixID(id, 'Users')}`, userId);

	return updated;
}

export async function archiveUser(id: number, userId?: number, reason?: string) {
	await prisma.user.update({
		where: { id },
		data: { archived: true, archived_by: userId, archive_reason: reason }
	});

	if (userId) await createAuditLog(`Archived user ${prefixID(id, 'Users')}`, userId);
}

export async function unarchiveUser(id: number, userId?: number) {
	await prisma.user.update({
		where: { id },
		data: { archived: false }
	});

	if (userId) await createAuditLog(`Unarchived user ${prefixID(id, 'Users')}`, userId);
}
