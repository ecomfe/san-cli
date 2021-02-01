const path = require('path');
const WebpackChain = require('webpack-chain');
const lMerge = require('lodash.merge');

const {devServerOptions} = require('./defaultOptions');
const Config = require('./Config');

const configInstance = new Config(new WebpackChain());

const normalizeProjectOptions = projectOptions => {
    return {
        ...projectOptions,
        isLegacyBundle() {
            return process.env.SAN_CLI_LEGACY_BUIL;
        },
        isProduction() {
            return process.env.NODE_ENV === 'production';
        },
        resolveLocal(...args) {
            return path.join(__dirname, '../', ...args);
        },
        resolve(p) {
            if (p) {
                return path.resolve(projectOptions.context, p);
            }
            return projectOptions.context;
        }
    };
};
exports.createChainConfig = function getChainConfig(mode, projectOptions) {
    ['base', mode].forEach(name =>
        require(`./configs/${name}`)(configInstance, normalizeProjectOptions(projectOptions))
    );
    const chainWebpackConfig = configInstance.getConfig();

    return chainWebpackConfig;
};
exports.resetRule = (name, test, loaders) => {
    // configInstance.createRule(name, test, loaders);
};

exports.createDevServerConfig = (devServerConfig = {}) => {
    return lMerge(devServerOptions, devServerConfig);
};
exports.createHTMLPlugin = pages => {};
exports.createCopyPlugin = copyOptions => {};
