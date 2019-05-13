/**
 * @file husky conf
 */

module.exports = {
    'hooks': {
        'pre-commit': 'node ./node_modules/lint-staged/index.js',
        'commit-msg': 'node ./node_modules/commitlint/node_modules/.bin/commitlint -E HUSKY_GIT_PARAMS'
    }
};
