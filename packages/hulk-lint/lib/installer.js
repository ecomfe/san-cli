/**
 * @file 安装lint工具
 * @author luzhe <luzhe01@baidu.com>
 */

const path = require('path');
const fs = require('fs');
const chalk = require('@baidu/hulk-utils/chalk');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fsAccess = util.promisify(require('fs').access);
const fsWrite = util.promisify(require('fs').writeFile);

const inject = require('./inject');

/* eslint no-console: "off" */
async function injectPkg(dir) {
    // read the content of package.json
    let pkg = path.resolve(dir, 'package.json');
    try {
        await fsAccess(pkg, fs.constants.F_OK | fs.constants.W_OK);
    }
    catch (e) {
        console.log(chalk.red('No package.json found! Please make sure the path is correct!'));
        return false;
    }
    let packageConf = require(pkg);

    // inject config into package.json
    packageConf = inject(packageConf);
    try {
        await fsWrite(pkg, JSON.stringify(packageConf, '', '    '));
    }
    catch (e) {
        console.log(e);
        return false;
    }
    console.log('Writing package.json finished.');
}

async function huskyReinstall(dir) {
    // uninstall git hooks
    const rm = await exec(`rm ${path.resolve(dir, '.git/hooks/*')}`);
    console.log(`${rm.stdout}`);
    console.log(`${rm.stderr}`);
    if (rm.e) {
        console.log(chalk.red('Failed to uninstall git hooks.\n'));
        return false;
    }

    // spawn a child process to reinstall git hooks
    const husky = await exec(`node ${path.resolve(dir, 'node_modules/husky/husky.js')} install`);
    console.log(`${husky.stdout}`);
    console.log(`${husky.stderr}`);
    if (husky.e) {
        console.log(chalk.red('Failed to install git hooks.\n'));
        return false;
    }
    console.log('Git hooks installed.\n');
}

module.exports = async (dir = '') => {
    await Promise.all([injectPkg(dir), huskyReinstall(dir)]);
};
