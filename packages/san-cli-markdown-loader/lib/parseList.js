/**
 * @file 解析 list
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = function doParse(mdTree) {
    let jsonTree = [];
    let lines = mdTree.trim().split('\n');
    let regex = /^(\s*)-\s\[(.*)\]\s*(\((.*)\))?/;
    lines.forEach((line, i) => {
        let matchs = line.match(regex);
        console.log(matchs)
        if (matchs) {
            let level = matchs[1].length / 2;
            let title = matchs[2];
            let link = matchs[4];
            let node = new Node(title, link);

            if (level === 0) {
                jsonTree.push(node);
            } else {
                let p = getParentNode(level, jsonTree);
                p.childNodes.push(node);
            }
        }
    });
    return jsonTree;
};

function getParentNode(level, jsonTree) {
    let i = 0;
    let node = jsonTree[jsonTree.length - 1];
    while (i < level - 1) {
        let childNodes = node.childNodes;
        node = childNodes[childNodes.length - 1];
        i++;
    }

    if (!node.childNodes) {
        node.childNodes = [];
    }
    return node;
}

function Node(title, link) {
    this.title = title;
    this.link = link || '';
}
