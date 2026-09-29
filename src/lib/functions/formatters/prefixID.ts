const categories = {
	Products: 'PR',
	Appointments: 'AP',
	Patients: 'P',
	Transactions: 'TR',
	Users: 'U',
	Logs: 'L'
} as const;

type CategoryKey = keyof typeof categories;

export function prefixID(id: number | string, prefix: CategoryKey, zeropad = 3) {
	const code = categories[prefix];
	const idStr = String(id);
  const padded = idStr.padStart(zeropad, '0');
  
	return `${code}${padded}`;
}
