module.exports = {
    id: 'san-cli-plugin-modern-mode',
    apply: (api, options, argv) => {
        // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
        api.chainWebpack(webpackConfig => {
            const isLegacyBundle = argv.modernMode && !argv.modernBuild;
            const isProd = api.isProd();
            webpackConfig.output.filename(
                (isLegacyBundle ? '[name]-legacy' : '[name]') + `${isProd ? '.[hash:8]' : ''}.js`
            );
        });
    }
};
