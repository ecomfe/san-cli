/**
 * @file Hulk-lint stylelint tool
 * @author luzhe <luzhe01@baidu.com>
 */

const stylelint = require('stylelint');
const stylelintConf = require('../config/_stylelintrc.js');
const chalk = require('chalk');
const path = require('path');

module.exports = async dir => {
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
                let severityText = msg.severity === 'error'
                    ? chalk.bold.bgRed('Error')
                    : chalk.bold.black.bgYellow('Warning');

                console.log(`Line: ${msg.line}, ${severityText}: ${msg.text}`);
            });
        });
    }
    else {
        console.log('Congratulations! No style error!');
    }

    console.log('stylelint done');
};