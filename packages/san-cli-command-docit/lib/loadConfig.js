const fs = require('fs');
const path = require('path');
const parseConfig = require('./parseConfig');



module.exports = function loadConfig(context, bustCache = true) {
    const configPath = path.resolve(context, '.docit.js');
    const configYmlPath = path.resolve(context, '.docit.yml');
    const configTomlPath = path.resolve(context, '.docit.toml');

    if (bustCache) {
        delete require.cache[configPath];
    }

    // resolve siteConfig
    let siteConfig = {};
    if (fs.existsSync(configYmlPath)) {
        siteConfig = parseConfig(configYmlPath);
    } else if (fs.existsSync(configTomlPath)) {
        siteConfig = parseConfig(configTomlPath);
    } else if (fs.existsSync(configPath)) {
        siteConfig = require(configPath);
    }

    return siteConfig;
};
