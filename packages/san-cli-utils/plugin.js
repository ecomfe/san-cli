/**
 * @file plugin
 * The MIT License (MIT)
 * Copyright (c) 2017-present, Yuxi (Evan) You
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/vuejs/vue-cli/blob/dev/LICENSE
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-shared-utils/lib/pluginResolution.js
 */
const pluginRE = /^(@san\/|san-|@[\w-]+(\.)?[\w-]+\/san-)cli-plugin-/;
const scopeRE = /^@[\w-]+(\.)?[\w-]+\//;
const officialRE = /^@san\//;

// const officialPlugins = [
//     'babel',
//     'progress'
// ];

exports.isPlugin = id => pluginRE.test(id);

exports.isOfficialPlugin = id => exports.isPlugin(id) && officialRE.test(id);

exports.getPluginLink = id => {
    if (officialRE.test(id)) {
        return `https://github.com/vuejs/vue-cli/tree/dev/packages/san-cli-plugin-${
            exports.toShortPluginId(id)
        }`;
    }
    let pkg = {};
    try {
        pkg = require(`${id}/package.json`);
    }
    catch (e) {}
    return (
        pkg.homepage || (pkg.repository && pkg.repository.url)
            || `https://www.npmjs.com/package/${id.replace('/', '%2F')}`
    );
};

exports.matchesPluginId = (input, full) => {
    const short = full.replace(pluginRE, '');
    return (
        // input is full
        full === input
        // input is short without scope
        || short === input
        // input is short with scope
        || short === input.replace(scopeRE, '')
    );
};
