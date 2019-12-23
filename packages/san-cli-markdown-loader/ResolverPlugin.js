/**
 * @file webpack resolve plugin 处理 @docit 路径
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const URL = require('url');
const id = 'DocitPlugin';
module.exports = class DocitPlugin {
    constructor(options = {prefixer: '@docit'}) {
        this.source = 'rawModule';
        this.target = 'file';
        this.options = options;
    }

    apply(resolver) {
        const {
            prefixer,
            context,
            sidebar = '_sidebar.md',
            navbar = '_navbar.md',
            configfile = '.docit.js'
        } = this.options;
        const target = resolver.ensureHook(this.target);

        resolver.getHook(this.source).tapAsync(id, (request, resolveContext, callback) => {
            const innerRequest = request.request || request.path;
            if (innerRequest && innerRequest.startsWith(prefixer + '/')) {
                const remainingRequest = innerRequest.substr(prefixer.length + 1);
                let newRequestStr;
                // @docit/CodeBox -> /CodeBox

                // 1. 获取 query，
                // 2. 赋值 query 为新的 request
                // 3. 触发 doResolve
                switch (remainingRequest) {
                    // 全局数据
                    case 'Sidebar':
                        // 查找文件的路径
                        const sidebarPath = path.resolve(context, sidebar);
                        if (fs.existsSync(sidebarPath)) {
                            // 存在sidebar文件
                            newRequestStr = sidebarPath;
                        } else {
                            throw new Error(`[markdown-loader] resolverPlugin: ${sidebar} not found`);
                        }
                    case 'Navbar':
                        // 查找文件的路径
                        const navbarPath = path.resolve(context, navbar);
                        if (fs.existsSync(navbarPath)) {
                            // 存在navbar文件
                            newRequestStr = navbarPath;
                        } else {
                            throw new Error(`[markdown-loader] resolverPlugin: ${navbar} not found`);
                        }
                        break;
                    case 'SiteData': {
                        // 这里直接用临时生成的 markdown 吧
                        // 页面数据
                        // 查找文件的路径
                        const configpath = path.isAbsolute(configfile) ? configfile : path.resolve(context, configfile);
                        // 这里不需要判断直接按照传入的情况来
                        // 方便 configfile 添加loader
                        newRequestStr = configpath;
                        break;
                    }
                }

                //

                const obj = {
                    ...request,
                    request: newRequestStr
                };
                return resolver.doResolve(
                    target,
                    obj,
                    `${id}:${prefixer}:${innerRequest}->${newRequestStr}`,
                    resolveContext,
                    (err, result) => {
                        if (err) {
                            return callback(err);
                        }
                        if (result) {
                            return callback(null, result);
                        }
                        return callback();
                    }
                );
            } else {
                return callback();
            }
        });
    }
};
