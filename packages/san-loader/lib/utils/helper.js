/**
 * @file helper.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

/**
 * 获取 HTML 节点内容的起止范围
 *
 * @param {Object} node 节点
 * @return {Object} 起止范围
 */
function getContentRange(node) {
    let children = node.children;
    let startIndex = children[0].startIndex;
    let endIndex = children[children.length - 1].endIndex;
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

