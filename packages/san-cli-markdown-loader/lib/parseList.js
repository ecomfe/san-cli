/**
 * @file 从 md 中解析出来 H
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = (content, md) => {
    const tokens = md.parse(content, {});

    return res;
};

function getListTree(tokens) {
    const res = [];
    const root = {
        tag: 'sidebar',
        children: []
    };
    tokens.forEach((t, i) => {
        if (t.type === 'bullet_list_open') {
        } else if (t.type === 'bullet_list_close') {
        }
    });
}
