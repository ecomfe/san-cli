/**
 * @file loader
 * @author zhangsiyuan(zhangsiyuan@baidu.com), wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');
const posthtml = require('posthtml');
const gen = require('@babel/generator').default;
const assign = require('object-assign');
const loaderUtils = require('loader-utils');

function getLoaderConfig(context) {
    const query = loaderUtils.getOptions(context) || {};
    const configKey = query.config || 'sanWebpackLoader';
    const config = context.options && context.options.hasOwnProperty(configKey) ? context.options[configKey] : {};

    delete query.config;
    /**
     * sourceMap: 是否使用 css sourcemap
     * hotReload 是否启动san-hot-reload
     * minimize： 是否压缩代码，压缩 css 和 html，css extract
     */
    return assign({sourceMap: false, hotReload: false, minimize: false}, query, config);
}

function getParam(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results || !results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function loader(content, config, callback) {
    let {rootContext, resourcePath, resourceQuery} = config;

    // 这里处理 hulk-markdown-loader 传入 fakeMD mdurl的情况，主要给 css selector使用
    const mdurl = getParam('mdurl', resourceQuery);
    if (mdurl && (fs.existsSync(mdurl) || fs.existsSync(path.join(rootContext, mdurl)))) {
        // resourcePath = mdurl;
        resourcePath = mdurl + '?filetype=md';
    }

    let output = '';
    const webpackContext = config;
    // 获取config

    const shortFilePath = path.relative(rootContext, resourcePath).replace(/^(\.\.[\\\/])+/, '');
    const __sanParts__ = posthtml([
        // separate script、template、style
        require('./posthtml-san-selector')(),
        // optimize size
        require('./posthtml-remove-indent')()
    ]).process(content, {
        // almost gave up
        // shit@ post html docs
        recognizeSelfClosing: true,
        sync: true
    }).tree.messages[0];
    // <style> exists
    const sanStyle = __sanParts__.style;
    if (sanStyle.content) {
        output += require('./calc-style-Import')(
            {
                webpackContext,
                sanStyle,
                resourcePath
            },
            config
        );
    }

    // operate the ast for move template into  script
    const sanScriptAst = require('./move-template-into-script')(__sanParts__, config);
    const scriptStr = gen(sanScriptAst).code;

    output += scriptStr;
    if (config.hotReload) {
        const hotId = shortFilePath;

        output += `
    if(module.hot){
        var hotApi = require('san-hot-reload-api')

        hotApi.install(require('san'), false)
        if(!hotApi.compatible){
            throw new Error('san-hot-reload-api is not compatible with the version of Vue you are using.')
        }
        module.hot.accept()
        var id = '${hotId}'
        var moduleDefault = module.exports ? module.exports.default : module.__proto__.exports.default
        if(!module.hot.data) {
            hotApi.createRecord(id, moduleDefault)
        }else{
            hotApi.reload(id, moduleDefault)
        }
    }
    `;
    }
    callback(null, output);
}

/* eslint-disable space-before-function-paren */
module.exports = function(content) {
    /* eslint-enable space-before-function-paren */
    const callback = this.async();
    const config = getLoaderConfig(this);
    let {rootContext = process.cwd(), resourcePath, resourceQuery, query} = this;
    config.resourcePath = resourcePath;
    config.resourceQuery = resourceQuery;
    config.rootContext = rootContext;
    config.query = query;
    loader(content, config, callback);
};

module.exports.loader = loader;
