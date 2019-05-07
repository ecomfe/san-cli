/**
 * @file Hulk-lint eslint tool
 * @author luzhe <luzhe01@baidu.com>
 */

const CLIEngine = require('eslint').CLIEngine;
const eslintConf = require('../conf/_hulkeslint.js');
const chalk = require('@baidu/hulk-utils/chalk');

/**
 * format numbers
 * @param {number} num A number to be formatted
 * @return {string} Formatted string
 */
function num2Str(num) {
    const constLength = 4;
    let str = `${num}`;

    if (str.length > constLength) {
        return str;
    }

    return '    '.slice(0, constLength - str.length) + str;
}

/* eslint no-console: "off" */

module.exports = dirs => {

    console.log('eslinting...');
    let cli = new CLIEngine(eslintConf);

    let eslintRes = cli.executeOnFiles(dirs);

    if (eslintRes.warningCount === 0 && eslintRes.errorCount === 0) {
        console.log(chalk.green('Congratulations! No es error!'));
    }
    else {
        eslintRes.results.forEach(item => {
            if (item.messages.length === 0) {
                return false;
            }
            console.log(`\r\nEslint ${chalk.green('INFO')} ${item.filePath}`);
            item.messages.forEach(msg => {
                let severityText = msg.severity === 1 ? chalk.bold.yellow('Warning') : chalk.red('Error');
                console.log(`Eslint ${severityText} -> Line ${num2Str(msg.line)},`
                + ` Col ${num2Str(msg.column)}, Msg: ${msg.message}`);
            });
        });
    }

    console.log('eslint done');

    return eslintRes;
};
