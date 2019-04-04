/**
 * @file lint-staged conf
 */

module.exports = {
    'linters': {
        '*.san': [
            'fecs check --type=es,js,san,css,less,html --reporter=baidu --rule'
        ],
        '*.js': [
            'fecs check --type=es,js --reporter=baidu --rule'
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
        '**/*.min.js'
    ]
};
