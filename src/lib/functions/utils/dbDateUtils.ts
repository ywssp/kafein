
export function resolveDateRange(fromDate?: Date, toDate?: Date) {
	const startDate = fromDate ?? new Date(0);
	const endDate = toDate ?? new Date();

	return startDate <= endDate ? { startDate, endDate } : { startDate: endDate, endDate: startDate };
}

export function getDateWhere(fromDate?: Date, toDate?: Date, archived = false) {
	const { startDate, endDate } = resolveDateRange(fromDate, toDate);

	return {
		created_at: {
			gte: startDate,
			lte: endDate
		},
		archived: archived
	};
}
