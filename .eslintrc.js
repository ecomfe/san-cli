module.exports = {
    extends: [
        '@ecomfe/eslint-config',
        'plugin:jest/recommended'
    ],
    rules: {
        'comma-dangle': 'off',
        'brace-style': 'off',
        'no-unused-vars': 'error',
        'no-console': 'error',
        'guard-for-in': 'error'
    }
};
