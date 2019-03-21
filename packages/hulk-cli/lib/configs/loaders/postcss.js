/**
 * @file postcss-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({mode, context, sourceMap, browserslist, loaderOptions: {postcss = {}}}) => {
    const postcssPlugins = postcss.plugins || [];
    const plugins = [
        require('autoprefixer')({
            browsers: browserslist
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
