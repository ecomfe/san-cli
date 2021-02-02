const path = require('path');
const fs = require('fs');
const lMerge = require('lodash.merge');
const Config = require('webpack-chain');

const {normalizeProjectOptions} = require('./utils');
const {devServerOptions} = require('./defaultOptions');
exports.createChainConfig = function getChainConfig(webpackConfig = new Config(), mode, projectOptions) {
    ['base', 'pages', 'style', mode].forEach(name =>
        require(`./configs/${name}`)(webpackConfig, normalizeProjectOptions(projectOptions))
    );
    return webpackConfig;
};

exports.createDevServerConfig = (devServerConfig = {}) => {
    return lMerge(devServerOptions, devServerConfig);
};
