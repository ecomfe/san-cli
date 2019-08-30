/**
 * @file upload plugin
 * @author jinzhan <jinzhan@baidu.com>
 */

const upload = require('@baidu/upload-file');
const {success, error, info} = require('@baidu/hulk-utils/logger');

/*
* Hulk.config.js中配置deployMap字段
*
* 配置示例:
*
* ...
*
* deployMap: {
*    sandbox: {
*        receiver: 'http://fe.fis.searchbox.otp.baidu.com/fis/receiver',
*        templatePath: '/home/work/nginx_static/html/test/template',
*        staticPath: '//home/work/nginx_static/html/test/static',
*        staticDomain: 'http://test.baidu.com:8888'
*    }
* }
*
* build命令：hulk build --config hulk.config.js -r sandbox
* ...
*
* **/

const PLUGIN_NAME = 'HulkUploadPlugin';

class Upload {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        const options = this.options;
        compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
            Object.keys(compilation.assets).forEach(filename => {
                const to = /\.tpl$/.test(filename) ? options.templatePath : options.staticPath;
                upload({
                    receiver: options.receiver,
                    to,
                    content: this.getContent(filename, compilation),
                    filePath: filename
                });
            });
            callback();
        });
    }

    getContent(filename, compilation) {
        const isContainCdn = /\.(css|js|tpl)$/.test(filename);
        const source = compilation.assets[filename].source();
        if (isContainCdn) {
            const reg = new RegExp(this.options.baseUrl, 'g');
            return source.toString().replace(reg, this.options.staticDomain);
        }
        return source;
    }
}

module.exports = {
    id: 'upload',
    apply: (api, {_args: args, deployMap, baseUrl}) => {
        const remote = args.remote;

        if (!deployMap[remote]) {
            error(`deployMap.${remote} is NOT exist`);
            return;
        }

        api.chainWebpack(config => {
            config.plugin(PLUGIN_NAME).use(new Upload({
                ...deployMap[remote],
                baseUrl
            }));
        });
    }
};
