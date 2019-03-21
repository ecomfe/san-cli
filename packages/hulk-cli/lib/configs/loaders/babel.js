/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({browserslist, modernMode, modernBuild, modernBowsers, command, loaderOptions: {babel = {}}}) => {
    const babelPlugins = (babel && babel.plugins) || [];
    // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
    const isLegacyBundle = modernMode && !modernBuild;
    return {
        name: 'babel-loader',
        loader: require.resolve('babel-loader'),
        options: {
            cacheDirectory: command !== 'serve',
            presets: [
                [
                    require.resolve('@babel/preset-env'),
                    {
                        debug: false,
                        targets: browserslist,
                        modules: false
                    }
                ]
            ],
            plugins: [
                require.resolve('@babel/plugin-syntax-dynamic-import'),
                require.resolve('@babel/plugin-syntax-import-meta'),
                require.resolve('@babel/plugin-proposal-class-properties'),
                require.resolve('@babel/plugin-transform-new-target'),
                ...babelPlugins
            ]
        }
    };
};
