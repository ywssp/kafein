export function formatDate(date: Date) {
  return date.toLocaleDateString('en-PH', {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  })
}

export function formatDateTime(date: Date) {
	return date.toLocaleDateString('en-PH', {
		month: '2-digit',
		day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
}

