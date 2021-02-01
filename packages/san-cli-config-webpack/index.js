const WebpackChain = require('webpack-chain');
const lMerge = require('lodash.merge');

const {devServerOptions} = require('./defaultOptions');
const Config = require('./Config');

const configInstance = new Config(new WebpackChain());

exports.createChainConfig = () => new Config();

exports.getChainConfig = function getChainConfig(mode, projectOptions) {
    const chainWebpackConfig = configInstance.getChainConfig();
    ['base', mode].forEach(name => require(`./configs/${name}`)(chainWebpackConfig, projectOptions));
    return chainWebpackConfig;
};
exports.resetRule = (name, test, loaders) => {
    // configInstance.createRule(name, test, loaders);
};
exports.createDevServerConfig = (devServerConfig = {}) => {
    return lMerge(devServerOptions, devServerConfig);
};

exports.script = () => {};
