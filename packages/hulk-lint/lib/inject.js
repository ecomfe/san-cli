/**
 * @file inject lint conf into package.json
 */

const huskyConf = require('../conf/_huskyrc');
const lintStagedConf = require('../conf/_lintstagedrc');
const commitLintConf = require('../conf/_commitlintrc');

const confArr = [huskyConf, lintStagedConf, commitLintConf];

module.exports = conf => {
    ['husky', 'lint-staged', 'commitlint'].forEach((key, ind) => {
        if (!conf[key]) {
            conf[key] = confArr[ind];
        }
    });

    return conf;
};
