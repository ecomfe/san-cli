/**
 * @file 根据 template content 生成 template 代码
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const posthtml = require('posthtml');
const render = require('posthtml-render');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');
const babelGen = require('@babel/generator').default;

module.exports = function genTemplate(tpl, data) {
    let html = render(
        posthtml([
            tree => {
                tree.match({tag: 'script'}, node => {
                    let code = node.content;
                    if (Array.isArray(code)) {
                        code = code.join('\n');
                    }
                    let ast = babel.parse(code);
                    traverse(ast, {
                        enter(path) {
                            if (path.node.type !== 'ExportDefaultDeclaration') {
                                return;
                            }
                            let properties;
                            if (path.node.declaration.type === 'ObjectExpression') {
                                properties = path.node.declaration.properties;
                            } else if (path.node.declaration.type === 'CallExpression') {
                                properties = path.node.declaration.arguments[0].properties;
                            }

                            let componentsIdx = -1;
                            const hasCodePreview = properties.find((p, i) => {
                                if (p.type === 'ObjectProperty' && p.key.name === 'components') {
                                    componentsIdx = i;
                                    return p.value.properties.find(p => {
                                        /* eslint-disable*/
                                        if (
                                            p.type === 'ObjectProperty' &&
                                            p.key.value === 'code-preview' &&
                                            p.value.type === 'Identifier' &&
                                            p.value.name === 'codePreview'
                                        ) {
                                            return true;
                                        }
                                        /* eslint-enable*/
                                        return false;
                                    });
                                }
                                return false;
                            });

                            if (!hasCodePreview) {
                                const cAst = babel.parse(`
                                    export default {
                                        components:{
                                            'code-preview': codePreview
                                        }
                                    }
                                `).program.body[0].declaration.properties[0];

                                if (componentsIdx === -1) {
                                    // 给定义个 Components
                                    properties.push(cAst);
                                } else {
                                    // console.log(properties[componentsIdx], cAst.value.properties[0]);
                                    // 给 Components 添加properties
                                    properties[componentsIdx].value.properties.push(cAst.value.properties[0]);
                                }
                            }
                        }
                    });
                    code = babelGen(ast).code;
                    node.content = ['', data.dyImport, code, ''].join('\n');
                    return node;
                });
                return tree;
            }
        ]).process(tpl, {
            sync: true
        }).tree
    );
    for (let i in data) {
        if (!data[i]) {
            data[i] = '';
        }
        // <%=id=%>
        html = html.split(new RegExp(`<%=\\s*${i}\\s*=%>`, 'g')).join(data[i]);
    }
    return html;
};
