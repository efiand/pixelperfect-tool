/** @returns {boolean} */
export function isDevEnvironment() {
	return Boolean(import.meta.dev);
}
