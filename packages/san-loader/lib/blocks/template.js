/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file template.js
 * @author clark-t
 */

const qs = require('querystring');
const {getContent} = require('../utils/codegen');

const DEFAULT_TEMPLATE_ATTR = {
    lang: 'html'
};

/**
 * 根据 san 文件代码块生成对应 template 部分的 import 代码
 *
 * @param {Object} descriptor san 文件代码块描述对象
 * @param {Object} options 参数
 * @return {string} import 代码
 */
function generateTemplateImport(descriptor, options) {
    if (!descriptor.template || !descriptor.template.length) {
        return 'var template;';
    }

    let template = descriptor.template[0];
    let resource;

    if (template.attribs.src) {
        resource = template.attribs.src;
    }
    else {
        let resourcePath = options.resourcePath.replace(/\\/g, '/');
        let query = Object.assign(
            {},
            DEFAULT_TEMPLATE_ATTR,
            options.query,
            template.attribs,
            {
                san: '',
                type: 'template'
            }
        );
        resource = `${resourcePath}?${qs.stringify(query)}`;
    }
    return options.esModule ? `import template from '${resource}';` : `var template = require('${resource}');`;
}

/**
 * 根据参数获取 san 文件中的代码块
 *
 * @param {Object} descriptor san 文件代码块描述对象
 * @param {string} source san 文件源码
 * @param {boolean} needMap 是否需要生成 sourcemap
 * @param {string} resourcePath san 文件的文件路径
 * @param {Array} ast san 文件的 HTML AST
 * @return {Object} {code, map}
 */
function getTemplateCode(descriptor, {source, needMap, resourcePath, ast}) {
    let template = descriptor.template[0];
    return getContent(source, template, {
        needMap,
        resourcePath,
        ast
    });
}

module.exports = {
    generateTemplateImport,
    getTemplateCode
};
