module.exports = {
    id: 'san-cli-command-component',
    apply: (api, options, argv) => {
        api.registerCommand('component [component]', {
            builder: {},
            description: '',
            handler(argv) {
                const webpackConfig = api.resolveWebpackConfig();
                console.log(webpackConfig);
            }
        });

        api.chainWebpack(webpackConfig => {});
    }
};
