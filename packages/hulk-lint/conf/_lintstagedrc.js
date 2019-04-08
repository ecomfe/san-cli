/**
 * @file lint-staged conf
 */

module.exports = {
    'linters': {
        '*.san': [
            'fecs check --type=es,js,san,css,less,html --reporter=baidu --rule',
            'npm bin hulk-lint'
        ],
        '*.js': [
            'fecs check --type=es,js --reporter=baidu --rule',
            'npm bin hulk-lint'
        ],
        '*.{html,htm}': [
            'fecs check --reporter=baidu --rule'
        ],
        '*.css': [
            'fecs format',
            'git add'
        ],
        '*.less': [
            'stylelint --fix --syntax=less',
            'git add'
        ]
    },
    'ignore': [
        '**/dist/**',
        '**/docs/**',
        '**/output/**',
        '**/third-party/**',
        '**/third_party/**',
        '**/node_modules/**',
        '**/third/**',
        '**/*.min.*'
    ]
};
