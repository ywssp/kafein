import { prefixID } from '$lib/functions/formatters/prefixID';
import { encryptPassword } from '$lib/functions/security/encryptPassword';
import { verifyPassword } from '$lib/functions/security/verifyPassword';
import prisma from '$lib/prisma';
import { createAuditLog } from './audit';

export async function getUserSession(username: string) {
	const user = await prisma.user.findUnique({
		where: {
			username: username
		},
		select: {
			session_token: true,
			session_token_expires_at: true,
			id: true
		}
	});

	return user;
}

export async function getUserSecurityQuestions(username: string) {
	const user = await prisma.user.findUnique({
		where: {
			username: username
		},
		select: {
			id: true,
			security_question: true,
			security_answer: true
		}
	});

	return user;
}

export async function updateUserSecurityQuestions(
	username: string,
	securityQuestion: string,
	securityAnswer: string
) {
	await prisma.user.update({
		where: {
			username: username
		},
		data: {
			security_question: securityQuestion,
			security_answer: securityAnswer
		}
	});
}

export async function verifyUserSession(sessionToken: string) {
	const user = await prisma.user.findUnique({
		where: {
			session_token: sessionToken
		},
		select: {
			session_token: true,
			session_token_expires_at: true,
			role: true,
			username: true,
			id: true
		}
	});

	return user;
}

export async function setUserSessionToken(id: number, sessionToken: string) {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 1);

	await prisma.user.update({
		where: {
			id: id
		},
		data: {
			session_token: sessionToken,
			session_token_expires_at: expiresAt
		}
	});
}

export async function verifyUserPassword(username: string, password: string) {
	const user = await prisma.user.findUnique({
		where: {
			username: username,
			archived: false
		},
		select: {
			id: true,
			password: true
		}
	});

	if (!user) {
		return {
			userId: null,
			success: false
		};
	}

	const success = await verifyPassword(password, user.password);

	if (!success) {
		return {
			userId: null,
			success: false
		};
	}

	return {
		userId: user.id,
		success: true
	};
}

export async function verifyUserSecurityQuestions(username: string, securityAnswer: string) {
	const user = await prisma.user.findUnique({
		where: {
			username: username
		},
		select: {
			id: true,
			security_answer: true
		}
	});

	if (!user || !user.security_answer) {
		return false;
	}

	return {
		userId: user.id,
		success: securityAnswer.trim().toLowerCase() === user.security_answer.trim().toLowerCase()
	};
}

export async function attemptPasswordReset(username: string, newPlainPassword: string) {
	const user = await prisma.user.findUnique({
		where: { username }
	});

	if (!user) {
		throw new Error('User not found');
	}

	const newPasswordHash = await encryptPassword(newPlainPassword);

	await prisma.user.update({
		where: { id: user.id },
		data: { password: newPasswordHash }
	});

	await createAuditLog(`Reset password for user ${prefixID(user.id, 'Users')}`, user.id);
}

export async function logout(sessionToken: string) {
	if (!sessionToken) {
		return;
	}

	await prisma.user.update({
		where: {
			session_token: sessionToken
		},
		data: {
			session_token: null,
			session_token_expires_at: null
		}
	});
}
