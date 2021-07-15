const lMerge = require('lodash.merge');
const Config = require('webpack-chain');
const {devServerOptions} = require('./defaultOptions');

const getChainMap = (config, methods) => {
    const m = methods.split('.');
    let root = config[m[0]];
    let subMethod;
    while ((subMethod = m.pop())) {
        if (root[subMethod]) {
            root = root[subMethod];
        }
    }
    return root;
};

[
    ['Plugin', 'plugins'],
    ['Rule', 'module.rules'],
    ['Alias', 'resolve.alias'],
    ['Minimizer', 'optimization.minimizers']
].forEach(([key, methods]) => {
    /**
     * @example
     * const {delAlias} = require('./');
     * delAlias('@').setAlias('@', '...')
     */
    exports[`del${key}`] = (config, name) => {
        getChainMap(config, methods).delete(name);
        return exports;
    };
    exports[`get${key}`] = (config, name) => {
        getChainMap(config, methods).get(name);
        return exports;
    };
    exports[`set${key}`] = (config, name, value) => {
        getChainMap(config, methods).set(name, value);
        return exports;
    };
});

exports.createChainConfig = (mode, projectOptions, webpackConfig = new Config()) => {
    ['base', 'pages', 'style', mode].forEach(name =>
        require(`./configs/${name}`)(webpackConfig, projectOptions)
    );
    return webpackConfig;
};

exports.createDevServerConfig = (devServerConfig = {}) => {
    return lMerge(devServerOptions, devServerConfig);
};
