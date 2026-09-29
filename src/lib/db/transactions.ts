import prisma from '$lib/prisma';
import { createAuditLog } from './audit';
import { prefixID } from '$lib/functions/formatters/prefixID';
import { ArchivableModels, Prisma } from '../../generated/prisma/browser';
import type { TransactionCreateInput } from '../../generated/prisma/models';
import { resolveDateRange } from '../functions/utils/dbDateUtils';
import { canRunAutoArchive, markAutoArchiveCheck } from './archiveCheck';

export type TransactionDailyStat = {
    date: Date;
    count: number;
};

export type TransactionCategoryStat = {
    category: string;
    quantity: number;
    total: number;
};

const listFields = {
    id: true,
    total_amount: true,
    customer_name: true,
    timestamp: true,
    status: true,
    balance: true
};

export async function getTransactionList(
    inArchive: boolean = false, 
    statusFilter: string | null = null, 
    dateFilter: string | null = null
) {
    const queryConditions: Prisma.TransactionWhereInput = { archived: inArchive };
    if (statusFilter) {
        queryConditions.status = statusFilter;
    }

    if (dateFilter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        queryConditions.timestamp = { gte: startOfToday };
    }

    return await prisma.transaction.findMany({
        where: queryConditions,
        orderBy: { timestamp: 'desc' }
    });
}

export async function searchTransactions(query: string, inArchive = false) {
    const queryNumber = parseInt(query);

    const transactions = await prisma.transaction.findMany({
        where: {
            archived: inArchive,
            OR: [
                ...(isNaN(queryNumber) ? [] : [{ id: queryNumber }]),
                {
                    customer_name: { contains: query, mode: 'insensitive' }
                },
                {
                    transactionItems: {
                        some: {
                            product: { name: { contains: query, mode: 'insensitive' } }
                        }
                    }
                }
            ]
        },
        select: listFields,
        orderBy: {
            id: 'asc'
        }
    });

    return transactions;
}

export async function getTransaction(id: number) {
    const transaction = await prisma.transaction.findUnique({
        where: {
            id: id
        },
        include: {
            transactionItems: {
                include: {
                    product: true
                }
            },
            payments: {
                orderBy: { date_paid: 'desc' }
            },
            creator: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true
                }
            },
            archiver: { select: { username: true, first_name: true, last_name: true } }
        }
    });

    if (!transaction) {
        throw new Error('Transaction not found');
    }

    return transaction;
}

export type CartItem = {
    id: number;
    quantity: number;
    price: number;
    discount?: number;
    discountType?: string;
};

export async function createTransaction(
    data: TransactionCreateInput & {
        custom_base_price?: number | null;
        custom_discount_value?: number | null;
        custom_discount_type?: string | null;
        checkup_base_price?: number | null;
        checkup_discount_value?: number | null;
        checkup_discount_type?: string | null;
    },
    cartItems: CartItem[],
    userId?: number
) {
    const newTransaction = await prisma.$transaction(async (tx) => {
        // 1. Create the Transaction, Cart Items, and Payment Ledger entry
        const created = await tx.transaction.create({
            data: {
                customer_name: data.customer_name,
                total_amount: data.total_amount,
                amount_paid: data.amount_paid,
                balance: data.balance,
                payment_method: data.payment_method,
                timestamp: data.timestamp,
                status: data.status,
                archived: data.archived,
                creator_id: userId,
                is_vat_exempt: data.is_vat_exempt,
                discount_amount: data.discount_amount,
                discount_type: data.discount_type,
                has_stock: data.has_stock,
                has_customized: data.has_customized,
                custom_notes: data.custom_notes,
                custom_price: data.custom_price,
                custom_vat_exemptable: data.custom_vat_exemptable,
                
                custom_base_price: data.custom_base_price,
                custom_discount_value: data.custom_discount_value,
                custom_discount_type: data.custom_discount_type,
                
                checkup_base_price: data.checkup_base_price,
                checkup_discount_value: data.checkup_discount_value,
                checkup_discount_type: data.checkup_discount_type,
                
                transactionItems: {
                    create: cartItems.map((item) => ({
                        product_id: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        // Ensure safe fallbacks so Prisma doesn't receive undefined
                        discount_value: item.discount || 0,
                        discount_type: item.discountType || 'flat'
                    }))
                },
                ...(data.amount_paid > 0 && {
                    payments: {
                        create: {
                            amount: data.amount_paid
                        }
                    }
                })
            }
        });

        for (const item of cartItems) {
            const batches = await tx.productBatch.findMany({
                where: {
                    product_id: item.id,
                    quantity: { gt: 0 }
                },
                orderBy: [{ expiry_date: 'asc' }, { date_received: 'asc' }]
            });

            let quantityToDeduct = item.quantity;
            for (const batch of batches) {
                if (quantityToDeduct <= 0) break;

                const deductFromThisBatch = Math.min(batch.quantity, quantityToDeduct);
                await tx.productBatch.update({
                    where: { id: batch.id },
                    data: { quantity: { decrement: deductFromThisBatch } }
                });

                quantityToDeduct -= deductFromThisBatch;
            }
            await tx.product.update({
                where: { id: item.id },
                data: { quantity: { decrement: item.quantity } }
            });
        }

        return created;
    });

    // 4. Log the action for security auditing
    if (userId) {
        await createAuditLog(
            `Created transaction ${prefixID(newTransaction.id, 'Transactions')}`,
            userId
        );
    }

    return newTransaction;
}

export async function settleTransactionBalance(id: number, userId?: number) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new Error('Transaction not found');

    const amountBeingSettled = transaction.balance ?? 0;

    await prisma.transaction.update({
        where: { id },
        data: {
            balance: 0,
            amount_paid: transaction.total_amount,
            payments: {
                create: {
                    amount: amountBeingSettled
                }
            }
        }
    });

    if (userId) {
        await createAuditLog(
            `Settled full balance for transaction ${prefixID(id, 'Transactions')}`,
            userId
        );
    }
}

export async function markTransactionClaimed(id: number, userId?: number) {
    await prisma.transaction.update({
        where: { id },
        data: {
            status: 'CLAIMED'
        }
    });

    if (userId) {
        await createAuditLog(`Marked transaction ${prefixID(id, 'Transactions')} as claimed`, userId);
    }
}

export async function addPartialPayment(id: number, paymentAmount: number, userId?: number) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction) throw new Error('Transaction not found');
    if (paymentAmount <= 0) throw new Error('Payment must be greater than 0');
    if (paymentAmount > (transaction.balance ?? 0))
        throw new Error('Payment exceeds remaining balance');

    const newAmountPaid = (transaction.amount_paid ?? 0) + paymentAmount;
    const newBalance = (transaction.balance ?? 0) - paymentAmount;
    const newStatus = newBalance <= 0 ? 'CLAIMED' : transaction.status;

    // We update the transaction AND create the payment history record at the same time
    await prisma.transaction.update({
        where: { id },
        data: {
            amount_paid: newAmountPaid,
            balance: newBalance,
            status: newStatus,
            payments: {
                create: {
                    amount: paymentAmount
                }
            }
        }
    });

    if (userId) {
        await createAuditLog(`Added partial payment of ₱${paymentAmount} to transaction ${id}`, userId);
    }
}

export async function archiveTransaction(id: number, userId?: number, reason?: string) {
    await prisma.transaction.update({
        where: { id },
        data: { archived: true, archived_by: userId, archive_reason: reason }
    });

    if (userId) await createAuditLog(`Archived transaction ${prefixID(id, 'Transactions')}`, userId);
}

export async function unarchiveTransaction(id: number, userId?: number) {
    await prisma.transaction.update({
        where: { id },
        data: { archived: false }
    });

    if (userId)
        await createAuditLog(`Unarchived transaction ${prefixID(id, 'Transactions')}`, userId);
}

export async function transactionAutoArchive() {
    if (!(await canRunAutoArchive(ArchivableModels.TRANSACTION))) {
        return { amountArchived: 0 };
    }

    const archiveCutoffDate = new Date();
    archiveCutoffDate.setFullYear(archiveCutoffDate.getFullYear() - 4);

    const result = await prisma.transaction.updateMany({
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

    await markAutoArchiveCheck(ArchivableModels.TRANSACTION);

    return { amountArchived: result.count };
}

// Reporting functions
export async function getTransactionDailyStats(
    fromDate?: Date,
    toDate?: Date
): Promise<TransactionDailyStat[]> {
    const { startDate, endDate } = resolveDateRange(fromDate, toDate);

    const rows = await prisma.$queryRaw<any[]>`
    SELECT day::date AS date, COALESCE(COUNT(t.id), 0)::int AS count
    FROM generate_series(
      date_trunc('day', ${startDate}::timestamp), -- Added explicit database casting
      date_trunc('day', ${endDate}::timestamp),   -- Added explicit database casting
      interval '1 day'
    ) AS day
    LEFT JOIN "Transaction" t
      ON t.time >= day 
      AND t.time < day + interval '1 day'
      AND t.time >= ${startDate}::timestamp        -- Added explicit database casting
      AND t.time <= ${endDate}::timestamp          -- Added explicit database casting
    GROUP BY day
    ORDER BY day ASC
  `;

    return rows.map((r) => ({
        date: new Date(r.date),
        count: r.count
    }));
}

export async function getTransactionCategoryStats(
    fromDate?: Date,
    toDate?: Date
): Promise<TransactionCategoryStat[]> {
    const { startDate, endDate } = resolveDateRange(fromDate, toDate);

    // 1. Get Physical Items
    const items = await prisma.transactionItem.findMany({
        where: {
            transaction: { timestamp: { gte: startDate, lte: endDate } }
        },
        select: {
            quantity: true,
            price: true,
            product: { select: { category: true } }
        }
    });

    // 2. Get Custom/Service Items (The "Hijacked" Custom/Checkup data)
    const customOrders = await prisma.transaction.findMany({
        where: {
            timestamp: { gte: startDate, lte: endDate },
            has_customized: true
        },
        select: {
            custom_price: true
        }
    });

    const map = new Map<string, { category: string; quantity: number; total: number }>();
    for (const item of items) {
        const category = String(item.product.category || 'Uncategorized');
        const entry = map.get(category) ?? { category: category, quantity: 0, total: 0 };
        entry.quantity += item.quantity;
        entry.total += item.quantity * item.price;
        map.set(category, entry);
    }

    if (customOrders.length > 0) {
        const entry = map.get('Services') ?? { category: 'Services', quantity: 0, total: 0 };
        for (const order of customOrders) {
            entry.total += order.custom_price || 0;
        }
        entry.quantity += 1;
        map.set('Services', entry);
    }

    return Array.from(map.values());
}

export async function getTransactionSummary(fromDate?: Date, toDate?: Date) {
    const { startDate, endDate } = resolveDateRange(fromDate, toDate);

    const [total, unclaimed, unpaid, categories, daily] = await Promise.all([
        prisma.transaction.count({ where: { timestamp: { gte: startDate, lte: endDate } } }),
        prisma.transaction.count({
            where: { timestamp: { gte: startDate, lte: endDate }, status: 'UNCLAIMED' }
        }),
        prisma.transaction.count({
            where: { timestamp: { gte: startDate, lte: endDate }, balance: { gt: 0 } }
        }),
        getTransactionCategoryStats(fromDate, toDate),
        getTransactionDailyStats(startDate, endDate)
    ]);

    return { total, unclaimed, unpaid, categories, daily };
}