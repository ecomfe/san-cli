/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file inspect run
 * @author ksky521
 */

module.exports = function apply(argv, api) {

    const {toString} = require('webpack-chain');

    const get = (target, path) => {
        const fields = path.split('.');
        let obj = target;
        const l = fields.length;
        for (let i = 0; i < l - 1; i++) {
            const key = fields[i];
            if (!obj[key]) {
                return undefined;
            }
            obj = obj[key];
        }
        return obj[fields[l - 1]];
    };

    const config = api.getWebpackConfig();
    let res;
    let hasUnnamedRule;
    const {extendSchema} = require('san-cli-service/options');
    if (argv.servicePlugins) {
        const splugin = api.service.plugins.map(p => {
            return {
                pluginId: p[0].id,
                optionKeys: Object.keys(extendSchema(p[0].schema)),
                location: p[0].path,
                pluginOptions: JSON.stringify(p[1])
            };
        });
        // eslint-disable-next-line no-console
        console.log(splugin);
        return;
    }

    if (argv.rule) {
        res = config.module.rules.find(r => r.__ruleNames[0] === argv.rule);
    }
    else if (argv.plugin) {
        res = config.plugins.find(p => p.__pluginName === argv.plugin);
    }
    else if (argv.rules) {
        res = config.module.rules.map(r => {
            const name = r.__ruleNames ? r.__ruleNames[0] : 'Nameless Rule (*)';

            hasUnnamedRule = hasUnnamedRule || !r.__ruleNames;

            return name;
        });
    }
    else if (argv.plugins) {
        res = config.plugins.map(p => p.__pluginName || p.constructor.name);
    }
    else if (argv.paths && argv.paths.length > 1) {
        res = {};
        argv.paths.forEach(path => {
            res[path] = get(config, path);
        });
    }
    else if (argv.paths && argv.paths.length === 1) {
        res = get(config, argv.paths[0]);
    }
    else {
        res = config;
    }

    const output = toString(res);
    // eslint-disable-next-line no-console
    console.log(output);
};
