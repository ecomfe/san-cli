/**
 * @file posthtml-san-selector
 * @author zhangsiyuan(zhangsiyuan@baidu.com)
 */
const render = require('posthtml-render');
module.exports = function pluginName() {
    return function (tree) {
        // template.length 必须为1
        const template = tree.filter(obj => obj.tag === 'template');
        const style = tree.filter(obj => obj.tag === 'style');
        // script.length <= 1
        let script = tree.filter(obj => obj.tag === 'script');

        if (template.length !== 1) {
            throw new Error(`
                🍩 san-webpack-loader only supports one template, detected:  ${template.length}
            `);

        }

        if (script.length === 0) {
            script.push(
                {
                    tag: 'script',
                    content: [
                        '\nexport default {};\n'
                    ]
                });
        }
        else if (script.length > 1) {
            throw new Error(`
                🍩 san-webpack-loader only supports one script, detected:  ${script.length}
            `);
        }
        else if (style.length > 1) {
            throw new Error(` 
                🍩 san-webpack-loader only supports 1 style, detected:  ${style.length}
            `);
        }

        // 传递给下一个插件
        tree.messages.push({
            template,
            script: {
                content: render(script[0].content)
            },
            style:
                style[0]
                    ? {
                        content: render(style[0].content),
                        attrs: style[0].attrs
                    }
                    : {}
        });
    };
};



