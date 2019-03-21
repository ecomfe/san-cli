/**
 * @file bable loader config
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({browserslist, command, loaderOptions: {babel = {}}}) => {
    const babelPlugins = (babel && babel.plugins) || [];
    return {
        name: 'babel-loader',
        loader: require.resolve('babel-loader'),
        options: {
            cacheDirectory: command !== 'devServer',
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
