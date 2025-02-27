export function getWorkerTemplaleCode(src: string) {
	const code = `import api from '${src}';

export default {
	fetch(request, env) {
		return api(request, env);
	}
}`;

	return code;
}
