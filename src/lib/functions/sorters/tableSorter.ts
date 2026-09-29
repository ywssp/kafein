import type { TableRow, TableCell } from '$lib/components/tables/ScrollableTable.svelte';

function getCellData(cell: TableCell): string {
	if (!cell) return '';

	// Extracts text from HTML
	if (typeof cell === 'object') {
		return cell.html
			.replace(/<[^>]*>/g, '')
			.toLowerCase()
			.trim();
	}
	return cell.toString().toLowerCase().trim();
}

function shouldPrecede(
	a: TableRow,
	b: TableRow,
	colIndex: number,
	direction: 'asc' | 'desc'
): boolean {
	const aData = Array.isArray(a) ? a : a.data;
	const bData = Array.isArray(b) ? b : b.data;

	const aVal = getCellData(aData[colIndex]);
	const bVal = getCellData(bData[colIndex]);

	const cleanA = aVal.replace(/[^\d.-]/g, '');
	const cleanB = bVal.replace(/[^\d.-]/g, '');

	const aNum = parseFloat(cleanA);
	const bNum = parseFloat(cleanB);

	if (!isNaN(aNum) && !isNaN(bNum)) {
		return direction === 'asc' ? aNum <= bNum : aNum >= bNum;
	}

	return direction === 'asc' ? aVal <= bVal : aVal >= bVal;
}

function partition(
	arr: TableRow[],
	colIndex: number,
	direction: 'asc' | 'desc',
	left: number,
	right: number
): number {
	const pivot = arr[right];
	let i = left - 1;

	for (let j = left; j < right; j++) {
		if (shouldPrecede(arr[j], pivot, colIndex, direction)) {
			i++;
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
	}

	const temp = arr[i + 1];
	arr[i + 1] = arr[right];
	arr[right] = temp;

	return i + 1;
}

function quickSortHelper(
	arr: TableRow[],
	colIndex: number,
	direction: 'asc' | 'desc',
	left: number,
	right: number
): void {
	if (left < right) {
		const pivotIndex = partition(arr, colIndex, direction, left, right);

		quickSortHelper(arr, colIndex, direction, left, pivotIndex - 1);
		quickSortHelper(arr, colIndex, direction, pivotIndex + 1, right);
	}
}

export function quickSort(
	arr: TableRow[],
	colIndex: number,
	direction: 'asc' | 'desc'
): TableRow[] {
	const sortedArray = [...arr];

	if (sortedArray.length <= 1) return sortedArray;

	quickSortHelper(sortedArray, colIndex, direction, 0, sortedArray.length - 1);
	return sortedArray;
}
