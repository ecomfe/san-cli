/**
 * @file commit lint
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    rules: {
        'body-leading-blank': [1, 'always'],
        'footer-leading-blank': [1, 'always'],
        'header-max-length': [2, 'always', 72],
        'scope-case': [2, 'always', 'lower-case'],
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'type-enum': [
            2,
            'always',
            [
                'chore',
                'review',
                'ui',
                'lint',
                'compat',
                'refactor',
                'revert',
                'init',
                'feat',
                'docs',
                'perf',
                'style',
                'test',
                'merge',
                'quickfix',
                'release'
            ]
        ]
    }
};
