const fs = require('fs');
const path = require('path');
const parseConfig = require('./parseConfig');

module.exports = function loadConfig(context, bustCache = true) {
    let configPath;
    const configJsPath = path.resolve(context, '.docit.js');
    const configYmlPath = path.resolve(context, '.docit.yml');
    const configTomlPath = path.resolve(context, '.docit.toml');

    if (bustCache) {
        delete require.cache[configPath];
    }

    // resolve siteConfig
    let siteConfig = {};
    if (fs.existsSync(configYmlPath)) {
        siteConfig = parseConfig(configYmlPath);
        configPath = configYmlPath;
    } else if (fs.existsSync(configTomlPath)) {
        siteConfig = parseConfig(configTomlPath);
        configPath = configTomlPath;
    } else if (fs.existsSync(configJsPath)) {
        siteConfig = require(configJsPath);
        configPath = configJsPath;
    }
    return {data: siteConfig, config: configPath};
};
