module.exports = {
    id: 'san-cli-plugin-deploy',
    apply: (api, options, argv) => {
        if (argv.deploy) {
            api.chainWebpack(webpackConfig => {});
        }
    }
};
