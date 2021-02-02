const path = require('path');
const fs = require('fs');
const lMerge = require('lodash.merge');
const Config = require('webpack-chain');

const {normalizeProjectOptions} = require('./utils');
const {devServerOptions} = require('./defaultOptions');
exports.createChainConfig = function getChainConfig(mode, projectOptions, webpackConfig = new Config()) {
    ['base', 'pages', 'style', mode].forEach(name =>
        require(`./configs/${name}`)(webpackConfig, projectOptions ? normalizeProjectOptions(projectOptions) : {})
    );
    return webpackConfig;
};

exports.createDevServerConfig = (devServerConfig = {}) => {
    return lMerge(devServerOptions, devServerConfig);
};
