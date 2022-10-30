module.exports = {
	env: {
		browser: true,
		node: true,
		es6: true
	},
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	plugins: ['prettier'],
	rules: {
		'prettier/prettier': 'warn'
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
};
