/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file parse.js
 * @author clark-t
 */

const {parseDOM} = require('htmlparser2');

const ELEMENT_TYPES = [
    'tag',
    'script',
    'style'
];

/**
 * 将源文件中有效的标签块内容进行解析分类
 *
 * @param {string} source san 文件代码文本
 * @param {Array.<string>} tagNames 标签块列表
 * @return {Object} descriptor and ast
 */
module.exports = function (source, tagNames) {
    let ast = parseDOM(source, {
        recognizeSelfClosing: true,
        withStartIndices: true,
        withEndIndices: true
    });

    let descriptor = {};
    for (let node of ast) {
        if (
            ELEMENT_TYPES.indexOf(node.type) > -1
            && tagNames.indexOf(node.name) > -1
        ) {
            if (!descriptor[node.name]) {
                descriptor[node.name] = [];
            }
            descriptor[node.name].push(node);
        }
    }
    return {descriptor, ast};
};

