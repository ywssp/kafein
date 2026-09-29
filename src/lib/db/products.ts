import prisma from '$lib/prisma';
import { createAuditLog } from './audit';
import { prefixID } from '$lib/functions/formatters/prefixID';
import { ArchivableModels, type Product } from '../../generated/prisma/browser';
import type { ProductCreateInput } from '../../generated/prisma/models';
import { canRunAutoArchive, markAutoArchiveCheck } from './archiveCheck';

const listFields = {
	id: true,
	name: true,
	price: true,
	quantity: true,
	created_at: true,
	category: true,
	minimum_stock: true,
	vat_exemptable: true
};

export async function getProductList(inArchive = false, lowStockOnly = false) {
    // 1. Fetch products from the database once
    const products = await prisma.product.findMany({
        where: { archived: inArchive },
        select: listFields, 
        orderBy: {
            id: 'asc'
        }
    });

    // 2. If the user is just browsing normally, return the full list
    if (!lowStockOnly) {
        return products;
    }

    // 3. If they clicked the Dashboard "Low Stock" link, filter them dynamically
    return products.filter((p) => {
        const currentQty = Number(p.quantity ?? 0);
        
        // This line makes the red "Unexpected any" error go away
        const productData = p as Record<string, unknown>;
        const minStock = Number(productData.minimum_stock ?? 0);
        
        return currentQty <= minStock;
    });
}


export async function searchProducts(query: string, inArchive = false) {
	const products = await prisma.product.findMany({
		select: listFields,
		where: {
			name: { contains: query, mode: 'insensitive' },
			archived: inArchive,
			orderBy: {
				id: 'asc'
			}
		}
	});

	return products;
}

export async function getProduct(id: number) {
	const product = await prisma.product.findUnique({
		where: {
			id: id
		},
		include: {
			batches: {
				where: { quantity: { gt: 0 } },
				orderBy: [{ expiry_date: 'asc' }, { date_received: 'asc' }]
			},
			archiver: { select: { username: true, first_name: true, last_name: true } }
		}
	});

	if (!product) {
		throw new Error('Product not found');
	}

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const salesData = await prisma.transactionItem.aggregate({
		where: {
			product_id: id,
			transaction: {
				is: {
					timestamp: { gte: thirtyDaysAgo },
					status: 'CLAIMED'
				}
			}
		},
		_sum: {
			quantity: true
		}
	});
	const unitsSoldLast30Days = salesData._sum.quantity || 0;

	const dailyAverage = unitsSoldLast30Days / 30;
	const floor = product.minimum_stock ?? 0;
	const dynamicMinStock = Math.max(floor, Math.ceil(floor + dailyAverage * 14));

	return {
		...product,
		dynamicMinStock,
		unitsSoldLast30Days
	};
}

export async function updateProduct(
	id: number,
	data: Partial<ProductCreateInput>,
	userId?: number
) {
	const updated = await prisma.product.update({
		where: { id },
		data: {
			name: data.name,
			description: data.description,
			price: data.price,
			quantity: data.quantity,
			category: data.category,
			minimum_stock: data.minimum_stock,
			vat_exemptable: data.vat_exemptable
		}
	});

	if (userId) await createAuditLog(`Updated product ${prefixID(id, 'Products')}`, userId);

	return updated;
}

//forda detail function
export async function getActiveProducts() {
	return await prisma.product.findMany({
		where: { archived: false },
		select: {
			id: true,
			name: true,
			price: true,
			minimum_stock: true,
			vat_exemptable: true,
			quantity: true
		}
	});
}

//forda create function
// Ensure your function definition looks exactly like this:
export async function createProduct(
	data: ProductCreateInput,
	initialExpiryDate: Date | null | undefined, // Add this parameter
	userId?: number
) {
	const created = await prisma.product.create({
		data: {
			name: data.name,
			description: data.description,
			price: data.price,
			quantity: data.quantity,
			category: data.category,
			minimum_stock: data.minimum_stock,
			vat_exemptable: data.vat_exemptable,
			...(data.quantity > 0 && {
				batches: {
					create: {
						quantity: data.quantity,
						expiry_date: initialExpiryDate
					}
				}
			})
		}
	});

	if (userId) await createAuditLog(`Created product ${prefixID(created.id, 'Products')}`, userId);

	return created;
}

export async function archiveProduct(id: number, userId?: number, reason?: string) {
	await prisma.product.update({
		where: { id },
		data: { archived: true, archived_by: userId, archive_reason: reason }
	});

	if (userId) await createAuditLog(`Archived product ${prefixID(id, 'Products')}`, userId);
}

export async function unarchiveProduct(id: number, userId?: number) {
	await prisma.product.update({
		where: { id },
		data: { archived: false }
	});

	if (userId) await createAuditLog(`Unarchived product ${prefixID(id, 'Products')}`, userId);
}

export async function productAutoArchive() {
	if (!(await canRunAutoArchive(ArchivableModels.PRODUCT))) {
		return { amountArchived: 0 };
	}

	// Get the date 4 years ago
	const archiveCutoffDate = new Date();
	archiveCutoffDate.setFullYear(archiveCutoffDate.getFullYear() - 4);

	// Mark all products modified more than 4 years ago and with 0 quantity as archived
	const result = await prisma.product.updateMany({
		where: {
			archived: false,
			modified_at: { lt: archiveCutoffDate },
			quantity: 0
		},
		data: {
			archived: true,
			archive_reason: 'Auto-archived due to inactivity and zero stock',
		}
	});

	await markAutoArchiveCheck(ArchivableModels.PRODUCT);

	return { amountArchived: result.count };
}

// Reporting Functions

export type CategoryInventoryStat = {
	category: string;
	count: number;
};

export async function getProductsPerCategory(): Promise<CategoryInventoryStat[]> {
	const rows = await prisma.product.groupBy({
		by: ['category'],
		where: { archived: false },
		_count: {
			_all: true
		}
	});

	return rows.map((row) => ({
		category: String(row.category),
		count: row._count._all
	}));
}

export async function getInventorySummary() {
	const [totalProducts, lowStock, categories] = await Promise.all([
		prisma.product.count({ where: { archived: false } }),
		getProductList(false, true),
		getProductsPerCategory()
	]);

	return {
		totalProducts,
		lowStock,
		lowStockCount: lowStock.length,
		categories
	};
}

export async function restockProduct(
    productId: number, 
    addedQuantity: number, 
    expiryDate?: Date | null, 
    userId?: number
) {
    return await prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: { quantity: { increment: addedQuantity } }
        });
        if (expiryDate) {
            await tx.productBatch.create({
                data: {
                    product_id: productId,
                    quantity: addedQuantity,
                    expiry_date: expiryDate
                }
            });
        }
        if (userId) await createAuditLog(`Restocked product ${productId} by ${addedQuantity} units`, userId);
        
        return updatedProduct;
    });
}

export async function discardExpiredBatch(
    batchId: number, 
    productId: number, 
    userId?: number
) {
    return await prisma.$transaction(async (tx) => {
        const batch = await tx.productBatch.findUnique({ 
            where: { id: batchId } 
        });
        
        if (!batch || batch.quantity <= 0) return;
        await tx.productBatch.update({
            where: { id: batchId },
            data: { quantity: 0 }
        });
        await tx.product.update({
            where: { id: productId },
            data: { quantity: { decrement: batch.quantity } }
        });

        if (userId) await createAuditLog(`Discarded expired batch ${batchId} for product ${productId}`, userId);
    });
}

