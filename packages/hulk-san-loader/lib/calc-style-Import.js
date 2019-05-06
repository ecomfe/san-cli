/**
 * @file import style module
 * @author zhangsiyuan(zhangsiyuan@baidu.com)
 */
const path = require('path');
const {resolve, join} = path.posix;
const loaderUtils = require('loader-utils');

const {findExisting} = require('@baidu/hulk-utils');

module.exports = function calceStyleImport({webpackContext, sanStyle, resourcePath}, {sourceMap, minimize}) {
    // 路径需要对windows环境区分处理，用path.posix处理，不然windows无法正常编译
    // linux系统确不能用，会导致绝对路径的开头斜杠失效
    if (/^win/.test(require('os').platform())) {
        resourcePath = join(...resourcePath.split(path.sep));
    }
    if (typeof sourceMap === 'boolean') {
        sourceMap = JSON.stringify(sourceMap);
    }
    const loaders = [];
    const styleLoader = require.resolve(minimize ? 'mini-css-extract-plugin/dist/loader.js' : 'style-loader');
    const cssLoader = `${require.resolve('css-loader')}?{sourceMap:${sourceMap},importLoaders:1}`;
    loaders.push(styleLoader, cssLoader);

    const hasPostCSSConfig = !!findExisting(process.cwd(), [
        '.postcssrc',
        '.postcssrc.js',
        'postcss.config.js',
        '.postcssrc.yaml',
        '.postcssrc.json'
    ]);

    if (hasPostCSSConfig) {
        const postcssLoader = `${require.resolve('postcss-loader')}?sourceMap=${sourceMap}`;
        loaders.push(postcssLoader);
    }

    const options = loaderUtils.getOptions(webpackContext) || {};
    const stylusOptions = options.stylus;

    const cssLoaderMap = {
        stylus: `${require.resolve('stylus-loader')}?${stylusOptions ? JSON.stringify(stylusOptions) : ''}`,
        less: require.resolve('less-loader'),
        scss: `${require.resolve('sass-loader')}?{sourceMap:${sourceMap}}`,
        sass: `${require.resolve('sass-loader')}?{sourceMap:${sourceMap}}`
    };

    const cssProcessorLoader = (sanStyle.attrs && cssLoaderMap[sanStyle.attrs.lang]) || '';
    if (cssProcessorLoader !== '') {
        loaders.push(cssProcessorLoader);
    }
    // 拼接生成内联loader处理san样式
    const genStyleString = (...args) => {
        /* eslint-disable quotes */
        const startString = "import '!";
        /* eslint-enable quotes */
        const endString = require.resolve('./selector.js') + `?type=style!${resourcePath}';\n`;
        return [startString, ...args, endString].join('!');
    };
    return genStyleString(...loaders);
};
