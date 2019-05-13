/**
 * @file lint-staged conf
 */

module.exports = {
    'linters': {
        '*.san': [
            'node ./node_modules/fecs/bin/fecs check --type=es,js,san,css,less,html --reporter=baidu --rule'
        ],
        '*.js': [
            'node ./node_modules/hulk-lint/bin/hulk-lint'
        ],
        '*.{html,htm}': [
            'node ./node_modules/fecs/bin/fecs check --reporter=baidu --rule'
        ],
        '*.css': [
            'node ./node_modules/fecs/bin/fecs format',
            'git add'
        ],
        '*.less': [
            'node ./node_modules/stylelint/bin/sylelint.js --syntax=less',
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
