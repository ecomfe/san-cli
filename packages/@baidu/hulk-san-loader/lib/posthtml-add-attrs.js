/**
 * @file add moduleId for every Component element
 * @author zhangsiyuan(zhangsiyuan@baidu.com)
 */



module.exports = function pluginName(webpackContext, options = {}) {
    const genModuleId = options && options.genModuleId;
    return function (tree) {
        const scopedStyles = tree.messages.filter(({tag, attrs}) => tag === 'style' && attrs && attrs.scoped === '');

        if (scopedStyles.length > 1) {
            throw new Error(` 
                🍩 san-webpack-loader only supports one scoped style, detected:  ${scopedStyles.length}
            `);
        }
        if (scopedStyles.length === 1) {

            const sanModuleId = genModuleId();
            // share options between the main loader of style loaders
            Object.defineProperty(webpackContext._compilation, 'sanModuleId', {
                value: sanModuleId,
                enumerable: false,
                configurable: true
            });

            // 借用一下tree的walk方法遍历template
            tree.walk.call(tree.messages.find(({tag}) => tag === 'template'), node => {
                if (node && node.tag && node.tag !== 'template') {
                    node.attrs = Object.assign(node.attrs ? node.attrs : {}, {
                        [`${sanModuleId}`]: true
                    });
                }
                return node;
            });
        }
    };
};


