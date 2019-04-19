/**
 * @file move
 * @author zhangsiyuan(zhangsiyuan@baidu.com)
 */

const render = require('posthtml-render');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');
const t = require('@babel/types');
const assign = require('object-assign');
const htmlMinifier = require('html-minifier');

module.exports = function (__sanParts__, config) {
    const wrappedTemplateQuote = str => `\`${str}\``;
    let sanTemplateString = render(__sanParts__.template[0].content, {});

    // 压缩，来自 Html-loader
    if (typeof config.minimize === 'boolean' ? config.minimize : this.minimize) {
        const minimizeOptions = assign({}, config);
        // 默认配置
        [
            'caseSensitive',
            'removeComments',
            'removeCommentsFromCDATA',
            'removeCDATASectionsFromCDATA',
            'collapseWhitespace',
            'conservativeCollapse',
            // 'removeAttributeQuotes',
            'useShortDoctype',
            'keepClosingSlash'
        ].forEach(name => {
            if (typeof minimizeOptions[name] === 'undefined') {
                minimizeOptions[name] = true;
            }

        });
        sanTemplateString = htmlMinifier.minify(sanTemplateString, minimizeOptions);
    }

    // 将template转成objectProperty类型的模板字符串，move进入script中
    const templateLiteralAst = babel.parse(wrappedTemplateQuote(sanTemplateString))
        .program
        .body[0]
        .expression;
    const objectPropertyAst = t.objectProperty(
        t.identifier('template'),
        t.templateLiteral(templateLiteralAst.quasis, templateLiteralAst.expressions)
    );

    // script标签解析成ast以供后续插入
    const sanScriptAst = babel.parse(
        __sanParts__.script.content
        // 注释掉  因为babel内部做了升级scoped babelrc
        // {
        //     extends: './.babelrc'
        // }
    );
    traverse(sanScriptAst, {
        enter(path) {
            if (path.node.type !== 'ExportDefaultDeclaration') {
                return;
            }

            if (path.node.declaration.type === 'ObjectExpression') {
                path.node.declaration.properties.push(objectPropertyAst);
            } else if (path.node.declaration.type === 'CallExpression') {
                path.node.declaration.arguments[0].properties.push(objectPropertyAst);
            }
        }
    });

    return sanScriptAst;
};
