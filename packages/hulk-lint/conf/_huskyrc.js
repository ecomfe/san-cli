/**
 * @file husky conf
 */

module.exports = {
    'hooks': {
        'pre-commit': 'npx lint-staged',
        'commit-msg': 'npx commitlint -E HUSKY_GIT_PARAMS'
    }
};
