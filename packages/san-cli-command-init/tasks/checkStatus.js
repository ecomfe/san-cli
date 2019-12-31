/**
 * @file 检查目录和离线包状态
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const rxjs = require('rxjs');
const path = require('path');
const fs = require('fs-extra');
const {chalk} = require('@baidu/san-cli-utils/ttyLogger');
const {isLocalPath, getLocalTplPath} = require('@baidu/san-cli-utils/path');
const prompt = require('../utils/prompt');

module.exports = (template, dest, options) => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            observer.next('Start checking target directory status');
            // 处理目标目录存在的情况，显示 loading 啊~
            if (fs.existsSync(dest)) {
                // 如果强制带--force，那就删了这个目录，流程终止
                if (options.force) {
                    observer.next('--force delete target directory');
                    return fs.remove(dest);
                    // 如果是当前目录下建
                } else if (options._inPlace) {
                    observer.next(); // 添加这一句下面才能显示 prompt
                    // 来一个疑问句，问是否确定在当前目录创建？
                    // eslint-disable-next-line
                    const {ok} = await prompt([
                        {
                            name: 'ok',
                            type: 'confirm',
                            message: 'Are you sure to create a project in the current directory?'
                        }
                    ]);
                    // 如果不愿意，那么此流程停止
                    if (!ok) {
                        return;
                    }
                } else {
                    observer.next();
                    // 取一个相对目录
                    const shortDest = path.relative(process.cwd(), dest);
                    // 处理对于已经存在的目录
                    const {action} = await prompt([
                        {
                            name: 'action',
                            type: 'list',
                            // eslint-disable-next-line
                            message: `The directory ${chalk.cyan(
                                shortDest
                            )} already exists. Please select an operation：`,
                            choices: [
                                {name: 'overwrite', value: 'overwrite'},
                                {name: 'merge', value: 'merge'},
                                {name: 'cancel', value: false}
                            ]
                        }
                    ]);
                    // 选了取消
                    if (!action) {
                        return observer.error(`Cancel overwrite ${shortDest} directory`);
                        // 选了覆盖
                    } else if (action === 'overwrite') {
                        observer.next(`Overwrite selected, first delete ${shortDest}...`);
                        await fs.remove(dest);
                    }
                }
            }

            observer.next('Check the status of the offline template');
            const isOffline = options.offline;
            if (isOffline || isLocalPath(template)) {
                // 使用离线地址
                // 直接复制，不下载 icode 代码
                const templatePath = getLocalTplPath(template);
                if (fs.existsSync(templatePath)) {
                    // 添加 本地template 路径
                    ctx.localTemplatePath = templatePath;
                } else {
                    // 直接使用本地的路径进行复制
                    const localAbsolutePath = path.resolve(template);
                    if (fs.existsSync(localAbsolutePath)) {
                        // 使用本地路径直接复制
                        ctx.localTemplatePath = localAbsolutePath;
                        return observer.complete();
                    }

                    return observer.error('Offline scaffolding template path does not exist');
                }
            }
            observer.complete();
        });
    };
};
