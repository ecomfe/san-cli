module.exports = {
    id: 'san-cli-plugin-modern-mode',
    apply: (api, projectOptions) => {
        api.registerCommandFlag(
            'build',
            {
                modernMode: {}
            },
            argv => {
                const isLegacyBundle = argv.modernMode && !argv.modernBuild;
                api.chainWebpack(webpackConfig => {
                    const isProd = api.isProd();
                    webpackConfig.output.filename(
                        (isLegacyBundle ? '[name]-legacy' : '[name]') + `${isProd ? '.[hash:8]' : ''}.js`
                    );
                    // 设置 babel 配置
                    // 修改打包 filename
                    // 打包两次
                    // 合并打包
                });
            }
        );
        // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
        api.chainWebpack(webpackConfig => {});
    }
};
