/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file style.js
 * @author clark-t
 */

const qs = require('querystring');
const {getContent} = require('../utils/codegen');

const DEFAULT_STYLE_ATTR = {
    lang: 'css'
};

/**
 * 根据 san 文件代码块生成对应 style 部分的 import 代码
 *
 * @param {Object} descriptor san 文件代码块描述对象
 * @param {Object} options 参数
 * @return {string} import 代码
 */
function generateStyleImport(descriptor, options) {
    if (!descriptor.style || !descriptor.style.length) {
        return 'var injectStyles = [];\n';
    }

    let injectStyles = [];
    let styles = descriptor.style;
    let code = '';

    for (let i = 0; i < styles.length; i++) {
        let style = styles[i];
        let isCSSModule = style.attribs.module !== undefined;
        let resourcePath;
        let resourceQuery;

        if (style.attribs.src) {
            resourcePath = style.attribs.src;
            resourceQuery = {...style.attribs};
            delete resourceQuery.src;
        }
        else {
            resourcePath = options.resourcePath;
            resourceQuery = Object.assign(
                {},
                DEFAULT_STYLE_ATTR,
                options.query,
                style.attribs,
                {
                    san: '',
                    type: 'style',
                    index: i
                }
            );
        }
        resourcePath = resourcePath.replace(/\\/g, '/');
        let resource = `${resourcePath}?${qs.stringify(resourceQuery)}`;
        if (isCSSModule) {
            code += options.esModule
                ? `import style${i} from '${resource}';\n` : `var style${i} = require('${resource}');\n`;
            injectStyles.push(`style${i}`);
        }
        else {
            code += options.esModule ? `import '${resource}';\n` : `require('${resource}');\n`;
        }
    }
    code += `var injectStyles = [${injectStyles.join(', ')}];\n`;

    return code;
}

/**
 * 根据参数获取 san 文件中的 style 代码块
 *
 * @param {Object} descriptor san 文件代码块描述对象
 * @param {string} source san 文件源码
 * @param {boolean} needMap 是否需要生成 sourcemap
 * @param {string} resourcePath san 文件的文件路径
 * @param {Array} ast san 文件的 HTML AST
 * @param {Object} query resourceQuery 解析后得到的对象
 * @return {Object} {code, map}
 */
function getStyleCode(
    descriptor,
    {
        source,
        needMap,
        resourcePath,
        ast,
        query
    }
) {
    let style = descriptor.style[query.index];
    return getContent(source, style, {
        needMap,
        resourcePath,
        ast
    });
}


module.exports = {
    generateStyleImport,
    getStyleCode
};
