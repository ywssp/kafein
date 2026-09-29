export function formatCashToPesos(amount: number) {
	return '₱'.concat(amount.toFixed(2));
}
