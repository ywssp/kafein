import { env } from '$env/dynamic/private';
import prisma from '$lib/prisma';
import { createAuditLog } from './audit';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { Gender, ProductCategories } from '../../generated/prisma/browser';

const BACKUP_ENCRYPTION_ALGORITHM = 'aes-256-gcm' as const;
const BACKUP_IV_LENGTH = 12;

type BackupProduct = {
	id: number;
	name: string;
	description: string | null;
	category: ProductCategories;
	price: number;
	quantity: number;
	vat_exemptable: boolean;
	created_at: string | Date;
	modified_at?: string | Date;
	archived: boolean;
	minimum_stock: number;
};

type BackupProductBatch = {
	id: number;
	product_id: number;
	quantity: number;
	expiry_date: string | Date | null;
	date_received: string | Date;
};

type BackupPatient = {
	id: number;
	full_name: string;
	doctor_assigned: string;
	birthdate: string | Date;
	age: number;
	occupation: string | null;
	contact_number: string;
	email: string;
	address: string;
	created_at: string | Date;
	modified_at?: string | Date;
	archived: boolean;
	gender: Gender;
	notes: string;
};

type BackupAppointment = {
	id: number;
	date: string | Date;
	notes: string | null;
	created_at: string | Date;
	modified_at?: string | Date;
	archived: boolean;
	doctor_assigned: string;
	name: string;
};

type BackupTransactionItem = {
	id: number;
	transaction_id: number;
	product_id: number;
	quantity: number;
	price: number;
};

type BackupPayment = {
	id: number;
	amount: number;
	date_paid: string | Date;
	transaction_id: number;
};

type BackupTransaction = {
	id: number;
	creator_id: number | null;
	customer_name: string;
	total_amount: number;
	amount_paid: number;
	balance: number;
	payment_method: string;
	discount_amount: number | null;
	discount_type: string;
	timestamp: string | Date;
	modified_at?: string | Date;
	status: string;
	archived: boolean;
	is_vat_exempt: boolean;
	has_stock: boolean;
	has_customized: boolean;
	custom_notes: string | null;
	custom_price: number;
	custom_vat_exemptable: boolean;
	transactionItems?: BackupTransactionItem[];
	payments?: BackupPayment[]; // Synced naming strategy to align with Prisma's direct native mapping
};

type BackupData = {
	patients?: BackupPatient[];
	appointments?: BackupAppointment[];
	products?: BackupProduct[];
	productBatches?: BackupProductBatch[]; // Integrated batch parameters
	transactions?: BackupTransaction[];
};

type EncryptedBackupData = {
	algorithm: typeof BACKUP_ENCRYPTION_ALGORITHM;
	iv: string;
	tag: string;
	ciphertext: string;
};

type BackupPayload = {
	version: 2;
	description: string;
	timestamp: string;
	data: EncryptedBackupData;
};

type BackupPayloadLike = {
	description?: string;
	timestamp?: string;
	data?: EncryptedBackupData | BackupData;
};

function normalizeDate(value: string | Date) {
	const date = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(date.getTime())) {
		throw new Error('Invalid date value in backup file.');
	}

	return date;
}

function readArray<T>(value: T[] | undefined, fieldName: string): T[] {
	if (value === undefined) {
		return [] as T[];
	}

	if (!Array.isArray(value)) {
		throw new Error(`Invalid backup file format: ${fieldName} must be an array.`);
	}

	return value;
}

function getEncryptionKey() {
	if (!env.BACKUP_ENCRYPTION_KEY) {
		throw new Error('BACKUP_ENCRYPTION_KEY is not configured.');
	}

	return createHash('sha256').update(env.BACKUP_ENCRYPTION_KEY).digest();
}

function encryptBackupData(data: BackupData): EncryptedBackupData {
	const iv = randomBytes(BACKUP_IV_LENGTH);
	const cipher = createCipheriv(BACKUP_ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
	const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return {
		algorithm: BACKUP_ENCRYPTION_ALGORITHM,
		iv: iv.toString('base64'),
		tag: tag.toString('base64'),
		ciphertext: ciphertext.toString('base64')
	};
}

function decryptBackupData(data: EncryptedBackupData): BackupData {
	if (data.algorithm !== BACKUP_ENCRYPTION_ALGORITHM) {
		throw new Error('Unsupported backup encryption algorithm.');
	}

	const decipher = createDecipheriv(
		BACKUP_ENCRYPTION_ALGORITHM,
		getEncryptionKey(),
		Buffer.from(data.iv, 'base64')
	);

	decipher.setAuthTag(Buffer.from(data.tag, 'base64'));

	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(data.ciphertext, 'base64')),
		decipher.final()
	]).toString('utf8');

	return JSON.parse(decrypted) as BackupData;
}

function isEncryptedBackupData(value: BackupPayloadLike['data']): value is EncryptedBackupData {
	return Boolean(
		value &&
		typeof value === 'object' &&
		'algorithm' in value &&
		'iv' in value &&
		'tag' in value &&
		'ciphertext' in value
	);
}

function isPlainBackupData(value: BackupPayloadLike['data']): value is BackupData {
	return Boolean(value && typeof value === 'object' && !('ciphertext' in value));
}

async function resetSequences(client: { $executeRawUnsafe: (query: string) => Promise<unknown> }) {
	const models = [
		'Patient',
		'Appointment',
		'Product',
		'ProductBatch',
		'Transaction',
		'TransactionItem',
		'Payment'
	];
	for (const modelName of models) {
		await client.$executeRawUnsafe(
			`SELECT setval(pg_get_serial_sequence('"${modelName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${modelName}"), 1), (SELECT COUNT(*) > 0 FROM "${modelName}"))`
		);
	}
}

async function collectFullSystemBackup(): Promise<BackupData> {
	return prisma.$transaction(async (tx) => {
		const [patients, appointments, products, productBatches, transactions] = await Promise.all([
			tx.patient.findMany(),
			tx.appointment.findMany(),
			tx.product.findMany(),
			tx.productBatch.findMany(), // Collected product batch context dependencies
			tx.transaction.findMany({ include: { transactionItems: true, payments: true } })
		]);

		return {
			patients,
			appointments,
			products,
			productBatches,
			transactions
		};
	});
}

export async function getFullSystemBackup(description: string): Promise<BackupPayload> {
	const backupData = await collectFullSystemBackup();
	return {
		version: 2,
		description,
		timestamp: new Date().toISOString(),
		data: encryptBackupData(backupData)
	};
}

export async function restoreFullSystemBackup(
	payload: BackupPayloadLike,
	options: { userId: number }
) {
	if (
		!payload ||
		typeof payload !== 'object' ||
		!payload.data ||
		typeof payload.data !== 'object'
	) {
		throw new Error('Invalid backup file format.');
	}

	const backupData = isEncryptedBackupData(payload.data)
		? decryptBackupData(payload.data)
		: isPlainBackupData(payload.data)
			? payload.data
			: null;

	if (!backupData) {
		throw new Error('Invalid backup file format.');
	}

	const patients = readArray(backupData.patients, 'patients');
	const appointments = readArray(backupData.appointments, 'appointments');
	const products = readArray(backupData.products, 'products');
	const productBatches = readArray(backupData.productBatches, 'productBatches');
	const transactions = readArray(backupData.transactions, 'transactions');

	await prisma.$transaction(async (tx) => {
		// Top-to-Bottom Purge Layout to avoid Foreign Key Dependency Ordering Locks
		await tx.payment.deleteMany();
		await tx.transactionItem.deleteMany();
		await tx.transaction.deleteMany();
		await tx.productBatch.deleteMany();
		await tx.product.deleteMany();
		await tx.appointment.deleteMany();
		await tx.patient.deleteMany();
		await tx.archiveCheckDates.deleteMany();

		if (patients.length > 0) {
			await tx.patient.createMany({
				data: patients.map((p) => ({
					id: p.id,
					full_name: p.full_name,
					doctor_assigned: p.doctor_assigned,
					birthdate: normalizeDate(p.birthdate),
					age: p.age,
					occupation: p.occupation,
					contact_number: p.contact_number,
					email: p.email,
					address: p.address,
					created_at: normalizeDate(p.created_at),
					modified_at: p.modified_at ? normalizeDate(p.modified_at) : undefined,
					archived: p.archived,
					gender: p.gender,
					notes: p.notes
				}))
			});
		}

		if (appointments.length > 0) {
			await tx.appointment.createMany({
				data: appointments.map((a) => ({
					id: a.id,
					date: normalizeDate(a.date),
					notes: a.notes,
					created_at: normalizeDate(a.created_at),
					modified_at: a.modified_at ? normalizeDate(a.modified_at) : undefined,
					archived: a.archived,
					doctor_assigned: a.doctor_assigned,
					name: a.name
				}))
			});
		}

		if (products.length > 0) {
			await tx.product.createMany({
				data: products.map((p) => ({
					id: p.id,
					name: p.name,
					description: p.description,
					category: p.category,
					price: p.price,
					quantity: p.quantity,
					vat_exemptable: p.vat_exemptable,
					created_at: normalizeDate(p.created_at),
					modified_at: p.modified_at ? normalizeDate(p.modified_at) : undefined,
					archived: p.archived,
					minimum_stock: p.minimum_stock
				}))
			});
		}

		if (productBatches.length > 0) {
			await tx.productBatch.createMany({
				data: productBatches.map((b) => ({
					id: b.id,
					product_id: b.product_id,
					quantity: b.quantity,
					expiry_date: b.expiry_date ? normalizeDate(b.expiry_date) : null,
					date_received: normalizeDate(b.date_received)
				}))
			});
		}

		if (transactions.length > 0) {
			await tx.transaction.createMany({
				data: transactions.map((t) => ({
					id: t.id,
					creator_id: t.creator_id,
					customer_name: t.customer_name,
					total_amount: t.total_amount,
					amount_paid: t.amount_paid,
					balance: t.balance,
					payment_method: t.payment_method,
					discount_amount: t.discount_amount,
					discount_type: t.discount_type,
					timestamp: normalizeDate(t.timestamp),
					modified_at: t.modified_at ? normalizeDate(t.modified_at) : undefined,
					status: t.status,
					archived: t.archived,
					is_vat_exempt: t.is_vat_exempt,
					has_stock: t.has_stock,
					has_customized: t.has_customized,
					custom_notes: t.custom_notes,
					custom_price: t.custom_price,
					custom_vat_exemptable: t.custom_vat_exemptable
				}))
			});
		}

		// Resolving Relation Mapping from Transaction Inclusion Object Payload Maps
		const transactionItems = transactions.flatMap((t) => {
			const items = t.transactionItems ?? [];
			return items.map((item) => ({
				id: item.id,
				transaction_id: t.id,
				product_id: item.product_id,
				quantity: item.quantity,
				price: item.price
			}));
		});

		if (transactionItems.length > 0) {
			await tx.transactionItem.createMany({ data: transactionItems });
		}

		const payments = transactions.flatMap((t) => {
			const pElements = t.payments ?? []; // Corrected accessor array mapping target from transactionPayments
			return pElements.map((p) => ({
				id: p.id,
				transaction_id: t.id,
				amount: p.amount,
				date_paid: normalizeDate(p.date_paid)
			}));
		});

		if (payments.length > 0) {
			await tx.payment.createMany({ data: payments });
		}

		await resetSequences(tx);
	});

	await createAuditLog(
		`System backup restored${payload.description ? `: ${payload.description}` : ''}.`,
		options.userId
	);
}
