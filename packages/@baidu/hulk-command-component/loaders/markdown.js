/**
 * @file markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');
const compiler = require('./utils/compiler');
const template = fs.readFileSync(path.join(__dirname, './markdown.html'), 'utf8');
const loaderUtils = require('loader-utils');
function genTemplate(tpl, data) {
    for (let i in data) {
        if (!data[i]) {
            data[i] = '';
        }
        tpl = tpl.split('${' + i + '}').join(data[i]);
    }
    return tpl;
}
function getMarkdownDefaultSanCode(content, cls) {
    cls = cls || ['markdown'];
    if (!Array.isArray(cls)) {
        cls = cls.split(/\s+/);
    }

    if (!~cls.indexOf('markdown')) {
        cls.push('markdown');
    }

    return `
    <template><section class="${cls.join(' ')}">${content}</section></template>
    <script>export default{}</script>
`;
}
module.exports = function(content) {
    this.cacheable && this.cacheable();
    const {resourcePath} = this;
    // getsource
    const m = content.match(/```html\s+(.*)\s+```/s);
    let code;
    if (m && m[1]) {
        code = m[1];
    }
    if (!code) {
        return getMarkdownDefaultSanCode(compiler(content));
    }
    let codeHtml = code ? compiler('```html\n' + code + '\n```') : code;

    if (!codeHtml) {
        // 说明是纯 markdown
        return getMarkdownDefaultSanCode(compiler(content));
    }

    let textMd;
    const textReg = /<(text)>\s*(.+)\s*<\/\1>/s;
    const text = content.match(textReg);
    if (text && text[1]) {
        textMd = text[2];
    }

    const textHtml = textMd ? compiler(textMd) : textMd;

    // 解决文档中的语法被解析的问题
    codeHtml = codeHtml.replace(/{{/g, '{<span></span>{').replace(/}}/g, '}<span></span>}');

    const requireReg = /<![-]{2,}require\((['"])(.+?)\1\)[-]{2,}>/;
    const requirejs = content.match(requireReg);
    let dyImport;
    if (requirejs && requirejs[2]) {
        // 说明使用了`<!--require()-->`语法引入
        const importFilePath = path.resolve(resourcePath, requirejs[2]);
        dyImport = `import uiPreview from "${importFilePath}";`;
    } else {
        const pickLoader = require.resolve('./utils/pickFence.js');
        const fakemd = require.resolve('./utils/_fakemd') + '?mdurl=' + resourcePath + '&_t=' + Date.now();

        dyImport =
            `import uiPreview from "${require.resolve('./san-webpack-loader')}!` +
            `${pickLoader}?url=${resourcePath}!${fakemd}";`;
    }

    let id = 'components-demo-' + Date.now();
    return genTemplate(template, {id, textHtml, codeHtml, dyImport});
};
