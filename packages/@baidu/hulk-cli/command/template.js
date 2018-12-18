/**
 * @file 初始化模板
 */
const path = require('path');
const fs = require('fs-extra');

const home = require('user-home');
const inquirer = require('inquirer');

const exists = fs.existsSync;
const rm = fs.removeSync;
// const debug = require('debug')('command:init');

const {chalk, error, logWithSpinner, stopSpinner, log, success, downloadRepo, clearConsole} = require('../lib/utils');

module.exports = async (argv, opts) => {
    const template = 'hulk-template-base';
    const appName = argv.appName;

    const inPlace = !appName || appName === '.';
    const name = inPlace ? path.relative('../', process.cwd()) : appName;
    const dest = path.resolve(appName || '.');

    if (exists(dest)) {
        if (opts.force) {
            await fs.remove(dest);
        } else {
            clearConsole();
            if (inPlace) {
                const {ok} = await inquirer.prompt([
                    {
                        name: 'ok',
                        type: 'confirm',
                        message: '在当前目录创建模板？'
                    }
                ]);
                if (!ok) {
                    return;
                }
            } else {
                const {action} = await inquirer.prompt([
                    {
                        name: 'action',
                        type: 'list',
                        message: `目录 ${chalk.cyan(dest)} 已经存在。请选择操作：`,
                        choices: [
                            {name: '覆盖', value: 'overwrite'},
                            {name: '合并', value: 'merge'},
                            {name: '取消', value: false}
                        ]
                    }
                ]);
                if (!action) {
                    return;
                } else if (action === 'overwrite') {
                    log(`删除 ${chalk.cyan(dest)}...`);
                    await fs.remove(dest);
                }
            }
        }
    }

    // 临时存放地址，存放在~/.hulk-templates 下面
    let tmp = path.join(home, '.hulk-templates', template);

    if (opts.cache && exists(tmp)) {
        // 优先使用缓存
        fs.copy(tmp, dest)
            .then(d => {
                success('初始化项目模板成功');
            })
            .catch(e => {
                error('初始化项目模板失败');
                log('错误信息如下：');
                log(e);
            });
    } else {
        clearConsole();
        logWithSpinner('🗃', '下载模板...');
        if (exists(tmp)) {
            rm(tmp);
        }

        downloadRepo(template, tmp, opts, err => {
            stopSpinner();
            if (!err) {
                clearConsole();
                fs.copy(tmp, dest)
                    .then(d => {
                        success('初始化项目模板成功');
                    })
                    .catch(e => {
                        error('初始化项目模板失败');
                        log('错误信息如下：');
                        log(e);
                    });
            } else {
                error('拉取代码失败，请检查路径和代码权限是否正确');
                if (!process.env.DEBUG) {
                    log(`使用「${chalk.bgYellow.black('DEBUG=*')}」 ，查看报错信息`);
                }
            }
        });
    }
};
