/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file script.js
 * @author clark-t
 */

const qs = require('querystring');
const {getContent} = require('../utils/codegen');

const DEFAULT_SCRIPT_ATTR = {
    lang: 'js'
};

/**
 * 根据 san 文件代码块生成对应 script 部分的 import 代码
 *
 * @param {Object} descriptor san 文件代码块描述对象
 * @param {Object} options 参数
 * @return {string} import 代码
 */
function generateScriptImport(descriptor, options) {
    if (!descriptor.script || !descriptor.script.length) {
        return 'var script = {};';
    }
    let script = descriptor.script[0];
    let resource;

    if (script.attribs.src) {
        resource = script.attribs.src;
    }
    else {
        let resourcePath = options.resourcePath.replace(/\\/g, '/');
        let query = Object.assign(
            {},
            DEFAULT_SCRIPT_ATTR,
            options.query,
            script.attribs,
            {
                san: '',
                type: 'script'
            }
        );
        resource = `${resourcePath}?${qs.stringify(query)}`;

    }
    return `
        ${options.esModule ? `import script from '${resource}';` : `var script = require('${resource}').default;`}
        ${options.esModule ? `export * from '${resource}';` : `module.exports = require('${resource}');`}
    `;
}

/**
 * 根据参数获取 san 文件中的 script 代码块
 *
 * @param {Object} descriptor san 文件代码块描述对象
 * @param {string} source san 文件源码
 * @param {boolean} needMap 是否需要生成 sourcemap
 * @param {string} resourcePath san 文件的文件路径
 * @param {Array} ast san 文件的 HTML AST
 * @return {Object} {code, map}
 */
function getScriptCode(descriptor, {source, needMap, resourcePath, ast}) {
    let script = descriptor.script[0];
    return getContent(source, script, {
        needMap,
        resourcePath,
        ast,
        suffix: '\n /* san-hmr disable */'
    });
}

module.exports = {
    generateScriptImport,
    getScriptCode
};
