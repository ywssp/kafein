export function mergeStrings(
	parts: Array<string | null | undefined>,
	fallback = 'Unknown',
	separator = ' '
): string {
	return (
		parts
			.map((p) => p?.trim())
			.filter(Boolean)
			.join(separator) || fallback
	);
}
