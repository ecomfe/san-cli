/**
 * @file san markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const path = require('path');
const Service = require('@baidu/hulk-serve/Service');
const chalk = require('chalk');
const {findExisting} = require('@baidu/hulk-utils');

module.exports = (e, args) => {
    const {context, entry} = resolveEntry(e);
    new Service(context, {
        projectOptions: {
            compiler: true
        },
        plugins: [require('./component')(context, entry)]
    }).run('component', args);
};

function resolveEntry(entry) {
    const context = process.cwd();

    entry = entry || findExisting(context, ['main.js', 'index.js', 'App.san', 'app.san']);

    if (!entry) {
        console.log(chalk.red(`Failed to locate entry file in ${chalk.yellow(context)}.`));
        console.log(chalk.red('Valid entry file should be one of: main.js, index.js, App.san or app.san.'));
        process.exit(1);
    }
    if (!fs.existsSync(path.resolve(context, entry))) {
        console.log(chalk.red(`Entry file ${chalk.yellow(entry)} does not exist.`));
        process.exit(1);
    }

    return {
        context,
        entry
    };
}
