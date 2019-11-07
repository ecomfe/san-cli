/**
 * @file 检查目录和离线包状态
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const rxjs = require('rxjs');
const path = require('path');
const fs = require('fs-extra');
const {chalk} = require('../../../lib/ttyLogger');
const {isLocalPath, getLocalTplPath, prompt} = require('../../../lib/utils');

module.exports = (template, dest, options) => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            observer.next('开始检测目标目录状态');
            // 处理目标目录存在的情况，显示 loading 啊~
            if (fs.existsSync(dest)) {
                // 如果强制带--force，那就删了这个目录，流程终止
                if (options.force) {
                    observer.next('--force 删除目录');
                    return fs.remove(dest);
                    // 如果是当前目录下建
                } else if (options._inPlace) {
                    // 来一个疑问句，问是否确定在当前目录创建？
                    // eslint-disable-next-line
                    const {ok} = await prompt([
                        {
                            name: 'ok',
                            type: 'confirm',
                            message: '在当前目录创建项目？'
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
                    // eslint-disable-next-line
                    const {action} = await prompt([
                        {
                            name: 'action',
                            type: 'list',
                            message: `目录 ${chalk.cyan(shortDest)} 已经存在。请选择操作：`,
                            choices: [
                                {name: '覆盖', value: 'overwrite'},
                                {name: '合并', value: 'merge'},
                                {name: '取消', value: false}
                            ]
                        }
                    ]);
                    // 选了取消
                    if (!action) {
                        return observer.error(`取消覆盖 ${shortDest} 文件夹`);
                        // 选了覆盖
                    } else if (action === 'overwrite') {
                        observer.next(`选择覆盖，首先删除 ${shortDest}...`);
                        await fs.remove(dest);
                    }
                }
            }

            observer.next('检测离线模板状态');
            const isOffline = options.offline;
            if (isOffline || isLocalPath(template)) {
                // 使用离线地址
                // 直接复制，不下载 icode 代码
                const templatePath = getLocalTplPath(template);
                if (fs.existsSync(templatePath)) {
                    // 添加 本地template 路径
                    ctx.localTemplatePath = templatePath;
                } else {
                    return observer.error('离线脚手架模板路径不存在');
                }
            }
            observer.complete();
        });
    };
};
