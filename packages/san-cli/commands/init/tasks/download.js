/**
 * @file 检查目录和离线包状态
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const rxjs = require('rxjs');
const fs = require('fs-extra');
const {getLocalTplPath} = require('../../../lib/utils');
const dRepo = require('../../../lib/downloadRepo');

module.exports = (template, dest, options) => {
    return (ctx, task) => {
        return new rxjs.Observable(observer => {
            if (ctx.localTemplatePath) {
                // 使用本地路径
                task.skip('本次使用本地路径');
                observer.complete();
                return;
            }
            // 临时存放地址，存放在~/.hulk-templates 下面
            let tmp = getLocalTplPath(template);
            if (options.useCache && fs.exists(tmp)) {
                ctx.localTemplatePath = tmp;
                // 优先使用缓存
                task.skip('发现本地缓存，优先使用本地缓存模板');
                observer.complete();
            } else {
                // 否则拉取远程仓库的模板
                observer.next('拉取模板ing...');
                dRepo
                    .downloadRepo(template, tmp)
                    .then(() => {
                        ctx.localTemplatePath = tmp;
                        observer.complete();
                    })
                    .catch(err => {
                        observer.error('拉取代码失败，请检查路径和代码权限是否正确');
                    });
            }
        });
    };
};
