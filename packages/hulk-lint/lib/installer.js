/**
 * @file 安装lint工具
 * @author luzhe <luzhe01@baidu.com>
 */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const {spawn} = require('child_process');

const inject = require('./inject');

/*eslint no-console: "off"*/
module.exports = (dir = '') => {
    // read the content of package.json
    let packageJson = path.resolve(dir, 'package.json');
    if (!fs.existsSync(packageJson)) {
        console.log(chalk.red('No package.json found! Please make sure the path is correct!'));
        return false;
    }
    let packageConf = require(packageJson);

    // inject config into package.json
    packageConf = inject(packageConf);
    fs.writeFile(packageJson, JSON.stringify(packageConf, '', '\t'), err => {
        err ? console.log(err) : console.log('Writing package.json finished.');
    });

    // spawn a child process to install git hooks
    const husky = spawn('node', [path.resolve(dir, 'node_modules/husky/husky.js'), 'install']);

    husky.stderr.on('data', data => {
        console.log(`${data}`);
    });
    husky.on('close', code => {
        if (code === 0) {
            console.log('Git hooks installed.');
        }
        else {
            console.log(chalk.red('Failed to install git hooks.'));
        }

    });
};
