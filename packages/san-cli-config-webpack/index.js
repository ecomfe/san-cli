const path = require('path');
const lMerge = require('lodash.merge');
const Config = require('webpack-chain');

const {devServerOptions} = require('./defaultOptions');

// exports.getRuleByName = name => {
//     return chainConfig.module.rule(name);
// };
// // 根据namne删除rule
// exports.removeRule = name => {
//     const map = chainConfig.module.rule(name);
//     if (map) {
//         for (let [name] of map) {
//             map.delete(name);
//         }
//     }
// };

// exports.removePlugin = name => {
//     chainConfig.plugins.delete(name);
// };
// exports.addPlugin = (name, plugin, pluginOptions) => {
//     chainConfig.plugin(name).use(plugin, pluginOptions);
// };
// exports.getChainConfig = () => chainConfig;

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
exports.createChainConfig = function getChainConfig(webpackConfig = new Config(), mode, projectOptions) {
    ['base', 'style', mode].forEach(name =>
        require(`./configs/${name}`)(webpackConfig, normalizeProjectOptions(projectOptions))
    );

    return webpackConfig;
};

exports.createDevServerConfig = (devServerConfig = {}) => {
    return lMerge(devServerOptions, devServerConfig);
};
exports.createHTMLPlugin = pages => {};
exports.createCopyPlugin = copyOptions => {};
