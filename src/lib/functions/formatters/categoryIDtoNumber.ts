export function categoricalIDToNumber(id: string | number) {
	if (typeof id === 'number') {
		return id;
  }
  
	return Number(id.replaceAll(/[^\d]/g, ''));
}
