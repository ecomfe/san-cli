/**
 * @file lint 代码检查工具
 */

const path = require('path');
const importLazy = require('import-lazy')(require);
const chalk = importLazy('chalk');

const CLIEngine = importLazy('eslint').CLIEngine;
const stylelint = importLazy('stylelint');

const eslintConf = require('./_eslintrc.js');
const stylelintConf = require('./_stylelintrc.js');

module.exports = async (dir = process.cwd()) => {
    dir = path.resolve(dir);
    /* eslint */
    console.log('eslinting...');
    let cli = new CLIEngine(eslintConf);

    let eslintRes = cli.executeOnFiles([dir]);

    eslintRes.results.forEach(item => {
        console.log('=============================');
        console.log(chalk.green(`in File: ${item.filePath}`));
        item.messages.forEach(msg => {
            let severityText = msg.severity === 1 ? chalk.bold.black.bgYellow('Warning') : chalk.bold.bgRed('Error');
            console.log(`Line: ${msg.line}, ${severityText}: ${msg.message}`);
        });
    });
    console.log('eslint done');

    /* stylelint */
    console.log('stylelinting...');
    let stylelintRes = await stylelint.lint({
        config: stylelintConf,
        files: path.join(dir, '/*.css')
    });

    if (stylelintRes.errored) {
        stylelintRes.results.forEach(item => {
            if (!item.errored) {
                return false;
            }

            console.log('=============================');
            console.log(chalk.green(`in File: ${item.source}`));
            item.warnings.forEach(msg => {
                let severityText = msg.severity === 'error' ? chalk.bold.bgRed('Error') :chalk.bold.black.bgYellow('Warning');
                console.log(`Line: ${msg.line}, ${severityText}: ${msg.text}`);
            });
        });
    }
    console.log('stylelint done');

    /* commintlint */
    // TODO
}
