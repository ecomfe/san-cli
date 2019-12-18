/**
 * @file 检查目录和离线包状态
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const rxjs = require('rxjs');
const fs = require('fs-extra');
const {getLocalTplPath} = require('@baidu/san-cli-utils/path');
const downloadRepo = require('../utils/downloadRepo');

module.exports = (template, dest, options) => {
    return (ctx, task) => {
        return new rxjs.Observable(observer => {
            if (ctx.localTemplatePath) {
                // 使用本地路径
                task.skip('Use local path');
                observer.complete();
                return;
            }
            // 临时存放地址，存放在~/.san/templates 下面
            let tmp = getLocalTplPath(template);
            if (options.useCache && fs.exists(tmp)) {
                ctx.localTemplatePath = tmp;
                // 优先使用缓存
                task.skip('Discover local cache and use it');
                observer.complete();
            } else {
                // 否则拉取远程仓库的模板
                observer.next('Pulling template from the remote repository...');
                downloadRepo(template, tmp, options)
                    .then(() => {
                        ctx.localTemplatePath = tmp;
                        observer.complete();
                    })
                    .catch(err => {
                        observer.error('Failed to pull, please check the path and code permissions are correct');
                    });
            }
        });
    };
};
