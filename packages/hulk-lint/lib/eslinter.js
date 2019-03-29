/**
 *  Hulk-lint eslint tool
 */

const CLIEngine = require('eslint').CLIEngine;
const eslintConf = require('../config/_eslintrc.js');
const chalk = require('chalk');

module.exports = (dir) => {
    console.log('eslinting...');
    let cli = new CLIEngine(eslintConf);

    let eslintRes = cli.executeOnFiles([dir]);

    eslintRes.results.forEach(item => {
        if (item.messages.length === 0) {
            return false;
        }
        console.log('=============================');
        console.log(chalk.green(`in File: ${item.filePath}`));
        item.messages.forEach(msg => {
            let severityText = msg.severity === 1 ? chalk.bold.black.bgYellow('Warning') : chalk.bold.bgRed('Error');
            console.log(`Line: ${msg.line}, ${severityText}: ${msg.message}`);
        });
    });

    console.log('eslint done');
}