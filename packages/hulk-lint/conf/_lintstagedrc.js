/**
 * @file lint-staged conf
 */

module.exports = {
    'linters': {
        '*.san': [
            'npx fecs check --type=es,js,san,css,less,html --reporter=baidu --rule'
        ],
        '*.js': [
            'npx hulk-lint'
        ],
        '*.{html,htm}': [
            'npx fecs check --reporter=baidu --rule'
        ],
        '*.css': [
            'npx fecs format',
            'git add'
        ],
        '*.less': [
            'npx stylelint --syntax=less',
            'git add'
        ]
    },
    'ignore': [
        '**/dist/**',
        '**/docs/**',
        '**/output/**',
        '**/third-party/**',
        '**/node_modules/**',
        '**/third/**',
        '**/*.min.*'
    ]
};
