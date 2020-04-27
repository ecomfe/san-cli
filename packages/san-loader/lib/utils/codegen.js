/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file codegen.js
 * @author clark-t
 */

const path = require('path');
const MagicString = require('magic-string');
const {traverse, getContentRange} = require('./helper');

/**
 * 字符串操作工具，能够生成操作后的字符串以及对应的 sourcemap
 *
 * @param {string} code 代码
 * @param {Array} ast 代码对应的 ast
 * @return {MagicString} MagicString 对象
 */
function stringManager(code, ast) {
    let s = new MagicString(code);
    // 给字符串标记上 sourcemap 点位
    traverse(ast, node => {
        if (node && node.type !== 'comment') {
            s.addSourcemapLocation(node.startIndex);
            if (node.children && node.children[0] && node.children[0].startIndex != null) {
                s.addSourcemapLocation(node.children[0].startIndex - 1);
            }
        }
    });

    return s;
}

/**
 * 将内容块从文档中截取出来
 *
 * @param {string} source 源文件
 * @param {Object} node 要截取的内容块所在节点
 * @param {boolean=} needMap 是否需要生成 sourcemap，默认为 false
 * @param {Object=} ast 源文件对应的 HTML AST
 * @param {string=} resourcePath 源文件的文件路径
 * @param {string=} prefix 截取后的代码块前缀，默认为空
 * @param {string=} suffix 截取后的代码块后缀，默认为空
 * @return {Object} 内容 {code, map}
 */
function getContent(
    source,
    node,
    {
        needMap = false,
        ast,
        resourcePath,
        prefix = '',
        suffix = ''
    }
) {
    let {startIndex, endIndex} = getContentRange(node, source);
    if (!needMap) {
        return {
            code: prefix
                + source.slice(startIndex, endIndex + 1)
                + suffix
        };
    }

    let s = stringManager(source, ast);
    s.remove(0, startIndex);
    s.remove(endIndex + 1, source.length);

    if (prefix) {
        s.prepend(prefix);
    }

    if (suffix) {
        s.append(suffix);
    }

    let map = s.generateMap({
        file: path.basename(resourcePath),
        source: resourcePath,
        includeContent: true
    });

    return {
        code: s.toString(),
        map: JSON.parse(map.toString())
    };
}

module.exports = {
    getContent
};

