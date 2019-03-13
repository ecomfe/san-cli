/**
 * @file san markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const path = require('path');

module.exports = (e, args) => {
    const {context, entry} = resolveEntry(e);
    const Service = require('@baidu/hulk-serve/Service');

    new Service(context, {
        projectOptions: {
            compiler: true
        },
        plugins: [require('./component')(context, entry)]
    }).run('component', args);
};

function resolveEntry(entry) {
    const findExisting = require('@baidu/hulk-utils/find-existing').findExisting;
    const error = require('@baidu/hulk-utils/logger').error;
    const chalk = require('chalk');

    const context = process.cwd();

    entry = entry || findExisting(context, ['main.js', 'index.js', 'App.san', 'app.san']);

    if (!entry) {
        error(`Failed to locate entry file in ${chalk.yellow(context)}.`);
        error('Valid entry file should be one of: main.js, index.js, App.san or app.san.');
        process.exit(1);
    }
    if (!fs.existsSync(path.resolve(context, entry))) {
        error(`Entry file ${chalk.yellow(entry)} does not exist.`);
        process.exit(1);
    }

    return {
        context,
        entry
    };
}
