module.exports = {
    id: 'san-cli-command-component',
    apply: (api, options, argv) => {
        api.registerCommand('component [component]', {
            builder: {},
            description: '',
            handler(argv) {}
        });

        api.chainWebpack(webpackConfig => {});
    }
};
