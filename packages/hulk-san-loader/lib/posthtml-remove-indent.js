/**
 * @file add moduleId for every Component element
 * @author zhangsiyuan(zhangsiyuan@baidu.com)
 */

module.exports = function pluginName() {
    return function (tree) {
        const sanTemplateAst = tree.messages[0].template;
        // 借用一下tree的walk方法遍历template
        process.env.NODE_ENV === 'production' && tree.walk.call(sanTemplateAst, node => {
            node && typeof node === 'string' && (node = node.replace(/\n\s*/g, ''));
            return node;
        });
    };
};


