/**
 * @file postcss-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({sourceMap, browserslist, loaderOptions: {postcss = {}}}) => {
    const postcssPlugins = postcss.plugins || [];
    const plugins = [
        require('autoprefixer')({
            browsers: browserslist,
            // 防止主动移除一些手写上去老的兼容写法，例如 -webkit-box-orient
            remove: false
        }),
        require('postcss-import')(),
        require('postcss-plugin-pr2rem')({
            // 设计图为1242px
            rootValue: 124.2,
            unitPrecision: 5,
            propWhiteList: [],
            propBlackList: [],
            selectorBlackList: [],
            ignoreIdentifier: '00',
            replace: true,
            mediaQuery: false,
            minPixelValue: 0
        })
    ];

    if (Array.isArray(postcssPlugins)) {
        postcssPlugins.forEach(([plugin, options]) => {
            if (typeof plugin === 'function') {
                plugins.push(plugin(options));
            } else {
                throw new Error('postcssPlugins valid: ' + plugin);
            }
        });
    }
    return {
        name: 'postcss-loader',

        loader: require.resolve('postcss-loader'),
        options: {
            sourceMap,
            plugins
        }
    };
};
