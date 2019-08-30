/**
 * @file upload plugin
 * @author jinzhan <jinzhan@baidu.com>
 */

const upload = require('@baidu/upload-file');
const fsrUpload = require('@baidu/upload-file/fsr');
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
 * 使用FIS安全部署服务
 * http://agroup.baidu.com/fis/md/article/196978?side=folder
 * **/

const PLUGIN_NAME = 'HulkUploadPlugin';

class Upload {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        const options = this.options;
        compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
            const targetFiles = Object.keys(compilation.assets).map(filename => {
                const to = /\.tpl$/.test(filename) ? options.templatePath : options.staticPath;
                return {
                    host: options.host,
                    receiver: options.receiver,
                    content: this.getContent(filename, compilation),
                    to,
                    subpath: filename
                };
            });
            // FIS安全部署服务：http://agroup.baidu.com/fis/md/article/196978?side=folder
            const uploadHandler = options.disableFsr ? upload : fsrUpload;
            uploadHandler(targetFiles, {
                host: options.host,
                retry: 2
            }, () => {
                console.log('\n');
                console.log('UPLOAD COMPLETED!');
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
