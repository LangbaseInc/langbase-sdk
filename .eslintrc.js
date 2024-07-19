module.exports = {
	root: true,
	extends: ['@langbase/eslint-config/library.js'],
	settings: {
		next: {
			rootDir: ['apps/*/'],
		},
	},
};
