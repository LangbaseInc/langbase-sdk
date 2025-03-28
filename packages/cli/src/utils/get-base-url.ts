export function getBaseUrl(isDev: boolean) {
	return isDev ? 'http://localhost:8787' : 'https://api.langbase.com';
}
