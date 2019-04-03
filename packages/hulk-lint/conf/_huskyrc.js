/**
 * @file husky conf
 */

module.exports = {
    'hooks': {
        'pre-commit': 'lint-staged',
        'commit-msg': 'commitlint'
    }
};
