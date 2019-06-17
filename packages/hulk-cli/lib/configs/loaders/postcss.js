/**
 * @file postcss-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const cosmiconfig = require('cosmiconfig');
module.exports = ({context, sourceMap, browserslist, loaderOptions: {postcss = {}}}) => {
    context = context || process.cwd();
    let options = {sourceMap};

    const hasPostcssConfig = cosmiconfig('postcss', {
        searchPlaces: ['.postcssrc', '.postcssrc.js', 'postcss.config.js']
    }).searchSync(context);

    if (hasPostcssConfig && hasPostcssConfig.config) {
        options = Object.assign({sourceMap}, hasPostcssConfig.config);
    } else {
        // 判断是否真的存在 postcss 文件，如果存在则不使用 hulk.config 中的postcss，否则默认
        const postcssPlugins = postcss.plugins || [];
        const builtInPluginConfig = postcss.builtInPluginConfig || {};
        const plugins = [
            require('autoprefixer')(
                Object.assign(
                    {
                        overrideBrowserslist: browserslist,
                        // 防止主动移除一些手写上去老的兼容写法，例如 -webkit-box-orient
                        remove: false
                    },
                    builtInPluginConfig.autoprefixer || {}
                )
            ),
            require('postcss-import')(builtInPluginConfig['postcss-import'] || builtInPluginConfig['import']),
            require('postcss-plugin-pr2rem')(
                Object.assign(
                    {
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
                    },
                    /* eslint-disable operator-linebreak */
                    builtInPluginConfig['postcss-plugin-pr2rem'] ||
                        builtInPluginConfig['plugin-pr2rem'] ||
                        builtInPluginConfig['pr2rem']
                    /* eslint-enable operator-linebreak */
                )
            )
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
        options.plugins = plugins;
    }

    return {
        name: 'postcss-loader',
        loader: require.resolve('postcss-loader'),
        options
    };
};
