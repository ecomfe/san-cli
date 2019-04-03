/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({browserslist, modernMode, modernBuild, command, loaderOptions: {babel = {}}}) => {
    const plugins = (babel && babel.plugins) || [];
    let targets = browserslist;
    // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
    const isModernBundle = modernMode && modernBuild;
    if (isModernBundle) {
        // 这个是 modern 打包
        targets = {esmodules: true};
    }

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
                        useBuiltIns: 'usage',
                        targets,
                        modules: false
                    }
                ]
            ],
            plugins: [
                require.resolve('@babel/plugin-syntax-dynamic-import'),
                require.resolve('@babel/plugin-syntax-import-meta'),
                require.resolve('@babel/plugin-proposal-class-properties'),
                require.resolve('@babel/plugin-transform-new-target'),
                require.resolve('@babel/plugin-transform-modules-commonjs'),
                ...plugins
            ]
        }
    };
};
