/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file helper.js
 * @author clark-t
 */

/**
 * 获取 HTML 节点内容的起止范围
 *
 * @param {Object} node 节点
 * @param {string} source 源文件
 * @return {Object} 起止范围
 */
function getContentRange(node, source) {
    let {startIndex, endIndex} = node;

    const max = source.length;
    const min = -1;

    while (startIndex < max && source[startIndex] !== '>') {
        startIndex++;
    }
    while (endIndex > min && source[endIndex] !== '<') {
        endIndex--;
    }
    startIndex++;
    endIndex--;

    // 当 script 中存在 类似 var a = '<div></div>' 的字符串时，htmlparser2 对于 script 块的 children endIndex 会标定到 var a = ' 的这个位置来，明显是错的。

    // let children = node.children;
    // let startIndex = children[0].startIndex;
    // let endIndex = children[children.length - 1].endIndex;
    return {startIndex, endIndex};
}

/**
 * 深度遍历
 *
 * @param {Array} arr 根节点
 * @param {Function} callback 回调，参数为当前遍历到的节点对象，函数返回 false 时终止遍历
 */
function traverse(arr, callback) {
    let stack = arr.slice().reverse();
    while (stack.length) {
        let node = stack.pop();
        let result = callback(node);
        if (result === false) {
            break;
        }
        if (node.children && node.children.length) {
            for (let i = node.children.length - 1; i > -1; i--) {
                stack.push(node.children[i]);
            }
        }
    }

}

module.exports = {
    getContentRange,
    traverse
};

