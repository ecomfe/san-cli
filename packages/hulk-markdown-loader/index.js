/**
 * @file markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');
const compiler = require('./utils/compiler');
const defaultTemplate = path.join(__dirname, './template.san');
const loaderUtils = require('loader-utils');
const genTemplate = require('./utils/genTemplate');

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
// eslint-disable-next-line
module.exports = function(content) {
    this.cacheable && this.cacheable();
    const {ignore, template} = loaderUtils.getOptions(this) || {};

    const {resourcePath} = this;
    if (Object.prototype.toString.call(ignore).slice(8, -1) === 'RegExp') {
        // 配置忽略
        if (ignore.test(resourcePath)) {
            return content;
        }
    }
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
    codeHtml = codeHtml
        .replace(/{{/g, '{<span></span>{')
        .replace(/}}/g, '}<span></span>}')
        .replace(/\${/g, '$<span></span>{')
        .replace(/`/g, '\\`');

    const requireReg = /<![-]{2,}require\((['"])(.+?)\1\)[-]{2,}>/;
    const requirejs = content.match(requireReg);
    let dyImport;
    if (requirejs && requirejs[2]) {
        // 说明使用了`<!--require()-->`语法引入
        const importFilePath = path.resolve(resourcePath, requirejs[2]);
        dyImport = `import codePreview from "${importFilePath}";`;
    } else {
        const pickLoader = require.resolve('./utils/pickFence.js');
        const fakemd = require.resolve('./utils/_fakemd') + '?mdurl=' + resourcePath + '&_t=' + Date.now();

        dyImport =
            `import codePreview from "${require.resolve('@baidu/hulk-san-loader')}!` +
            `${pickLoader}?url=${resourcePath}!${fakemd}";`;
    }

    let id = 'components-demo-' + Date.now();
    let templateContent = '';
    if (template && fs.existsSync(path.resolve(template))) {
        templateContent = fs.readFileSync(path.resolve(template), 'utf8');
    } else {
        templateContent = fs.readFileSync(defaultTemplate, 'utf8');
    }

    return genTemplate(templateContent, {
        id,
        'text-container-placeholder': textHtml,
        'code-container-placeholder': codeHtml,
        dyImport
    });
};
