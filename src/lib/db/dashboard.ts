import prisma from '$lib/prisma';
import { canRoleAccess } from '$lib/functions/security/getUserAccessPermission'; // Adjust path
import type { UserRoles } from '../../generated/prisma/client'; // Adjust path

export async function getDashboardMetrics(role: UserRoles) {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	// Initialize all to 0
	const stats = {
		appointmentsToday: 0,
		totalPatients: 0,
		unclaimedOrders: 0,
		revenueToday: 0,
		lowStockItems: 0
	};

	try {
		const queries = [];

		// 1. Appointments Data
		if (canRoleAccess({ role, section: 'appointments' }) !== 'none') {
			queries.push(
				prisma.appointment
					.count({ where: { date: { gte: startOfToday }, archived: false } })
					.then((count) => (stats.appointmentsToday = count))
			);
		}

		// 2. Patients Data
		if (canRoleAccess({ role, section: 'patients' }) !== 'none') {
			queries.push(
				prisma.patient
					.count({ where: { archived: false } })
					.then((count) => (stats.totalPatients = count))
			);
		}

		// 3. Transactions Data (Revenue & Unclaimed)
		if (canRoleAccess({ role, section: 'transactions' }) !== 'none') {
			queries.push(
				prisma.transaction
					.count({ where: { status: 'UNCLAIMED', archived: false } })
					.then((count) => (stats.unclaimedOrders = count))
			);
			queries.push(
				prisma.transaction
					.aggregate({
						_sum: { total_amount: true },
						where: { timestamp: { gte: startOfToday }, archived: false }
					})
					.then((res) => (stats.revenueToday = res._sum.total_amount || 0))
			);
		}

		// 4. Inventory Data
		if (canRoleAccess({ role, section: 'appointment' }) !== 'none') {
			queries.push(
				prisma.product
					.count({ where: { quantity: { lte: 5 }, archived: false } })
					.then((count) => (stats.lowStockItems = count))
			);
		}

		// Run all authorized queries simultaneously for maximum speed
		await Promise.all(queries);

		return stats;
	} catch (error) {
		console.error('Failed to fetch dashboard metrics:', error);
		return stats;
	}
}
export async function getTodaysAppointments() {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const endOfToday = new Date();
	endOfToday.setHours(23, 59, 59, 999);

	return await prisma.appointment.findMany({
		where: {
			date: { gte: startOfToday, lte: endOfToday },
			archived: false
		},
		orderBy: { date: 'asc' }
	});
}

// 2. Fetch Category Data for Progress Bars
export async function getCategoryProductStats() {
	const categoryGroup = await prisma.product.groupBy({
		by: ['category'],
		_count: { category: true },
		where: { archived: false }
	});

	const totalProducts = categoryGroup.reduce((sum, item) => sum + (item._count?.category || 0), 0);

	return categoryGroup
		.filter((c) => c.category !== null)
		.map((c) => ({
			name: c.category || 'Uncategorized',
			count: c._count?.category || 0,
			percentage: totalProducts > 0 ? ((c._count?.category || 0) / totalProducts) * 100 : 0
		}))
		.sort((a, b) => b.count - a.count);
}
