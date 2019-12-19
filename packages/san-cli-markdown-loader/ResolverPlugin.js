/**
 * @file webpack resolve plugin 处理 @docit 路径
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const path = require('path');
const id = 'DocitPlugin';
module.exports = class DocitPlugin {
    constructor(source, target, options = {prefixer: '@docit'}) {
        this.source = source || 'described-resolve';
        this.target = target || 'resolve';
        this.options = options;
    }

    apply(resolver) {
        const {prefixer, context, sidebar = '_sidebar.md', navbar = '_navbar.md'} = this.options;
        const target = resolver.ensureHook(this.target);
        resolver.getHook(this.source).tapAsync(id, (request, resolveContext, callback) => {
            const innerRequest = request.request || request.path;

            if (innerRequest && innerRequest.startsWith(prefixer + '/')) {
                const remainingRequest = innerRequest.substr(prefixer.length + 1);
                let newRequestStr;
                // @docit/CodeBox -> /CodeBox
                let filepath = request.context.issuer;
                if (!filepath) {
                    return callback();
                }
                // 1. 获取 query，
                // 2. 赋值 query 为新的 request
                // 3. 触发 doResolve
                switch (remainingRequest) {
                    // 全局数据
                    case 'Sidebar':
                        // 查找文件的路径
                        const sidebarPath = path.resolve(context, sidebar);
                        if (fs.existsSync(sidebarPath)) {
                            // 存在navbar文件
                            newRequestStr = sidebarPath;
                        }
                    case 'Navbar':
                        // 查找文件的路径
                        const navbarPath = path.resolve(context, navbar);
                        if (fs.existsSync(navbarPath)) {
                            // 存在navbar文件
                            newRequestStr = navbarPath;
                        }
                        break;
                    case 'SiteData':

                    // 页面数据
                    case 'PageData':
                    case 'Content':
                    case 'CodeBox':
                        newRequestStr = filepath;
                        break;
                    // 获取 sanbox 中 san 部分代码
                    case 'Text':
                    case 'HighlightCode':
                        break;
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
