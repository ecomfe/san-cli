/**
 * @file 从 md 中解析出来 H
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// TODO 目前这个文件没有使用，如果使用的话，需要引入下面依赖
/**
"remark": "^11.0.2",
"mdast-util-to-hast": "^7.0.0",
"unist-util-visit": "^2.0.1",
"hast-util-to-html": "^6.1.0",
 */
const visit = require('unist-util-visit');
const remark = require('remark');
const toHast = require('mdast-util-to-hast');
const toHtml = require('hast-util-to-html');

module.exports = (content, {relativePath, context, activeClassName = 'active'}) => {
    const ast = remark.parse(content);

    // 1. 去除多余的 paragraph
    visit(ast, 'listItem', listItem => {
        if (listItem.children.length === 1 && listItem.children[0].type === 'paragraph') {
            listItem.children = listItem.children[0].children;
        }
        return listItem;
    });

    // 2. 去除 link 的 text 节点，直接上移节点
    visit(ast, 'link', (node, idx, parent) => {
        let url = node.url;
        if (url === relativePath || url === './' + relativePath || url === '/' + relativePath) {
            const data = parent.data || {};
            const attrs = data.hProperties || {};
            attrs.class = attrs.class ? attrs.class + '' + activeClassName : activeClassName;
            data.hProperties = attrs;
            parent.data = data;
        }

        node.url = url.replace(/\.md$/, '.html').replace(/README\.html$/, 'index.html');
        return node;
    });
    // console.log(JSON.stringify(ast))
    return toHtml(toHast(ast));
};
