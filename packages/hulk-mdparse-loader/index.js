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
const getText = require('./utils/getText').getText;
const Ejs = require('ejs');

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
    // eslint-disable-next-line
    const {ignore, template, context = process.cwd(), textTag = 'text', i18n = 'cn', exportType = 'component'} =
        loaderUtils.getOptions(this) || {};

    const {resourcePath} = this;

    if (Object.prototype.toString.call(ignore).slice(8, -1) === 'RegExp') {
        // 配置忽略
        if (ignore.test(resourcePath)) {
            return content;
        }
    }

    const m = content.match(/```html\s+(.+?)\s+```/s);
    let code;
    if (m && m[1]) {
        // 一个 md 只能有一个 html
        code = m[1];
    }

    const text = getText(content, textTag, i18n);

    const contentObj = {
        code,
        text,
        content
    };
    // 获取 template 内容
    let templateContent = '';
    if (template && path.join(context, template)) {
        templateContent = fs.readFileSync(path.join(context, template), 'utf8');
    } else {
        templateContent = fs.readFileSync(defaultTemplate, 'utf8');
    }
    if (exportType === 'object') {
        const genObjectCode = genObject.bind(this);
        return genObjectCode(templateContent, contentObj);
    } else {
        const genComponentCode = genComponent.bind(this);
        return genComponentCode(templateContent, contentObj);
    }
};
function genObject(template, data) {
    const {resourcePath} = this;
    data.requirePath = getComponentImportFromCode(resourcePath, data.content);
    return Ejs.render(template, data);
}

function genComponent(template, {text, code, content}) {
    const {resourcePath} = this;
    // getsource
    let codeHtml = code ? compiler('```html\n' + code + '\n```') : code;
    if (!codeHtml) {
        // 说明是纯 markdown
        return getMarkdownDefaultSanCode(compiler(content));
    }

    const textHtml = text ? compiler(text) : text;
    // 解决文档中的语法被解析的问题
    codeHtml = codeHtml
        .replace(/{{/g, '{<span></span>{')
        .replace(/}}/g, '}<span></span>}')
        .replace(/\${/g, '$<span></span>{')
        .replace(/`/g, '\\`');

    const requirePath = getComponentImportFromCode(resourcePath, content);

    let id = 'components-demo-' + Date.now();
    return genTemplate(template, {
        id,
        'text-container-placeholder': textHtml,
        'code-container-placeholder': codeHtml,
        dyImport: `import codePreview from '${requirePath}'`
    });
}

function getComponentImportFromCode(resourcePath, content) {
    const requireReg = /<![-]{2,}require\((['"])(.+?)\1\)[-]{2,}>/;
    const requirejs = content.match(requireReg);
    let dyImport;
    if (requirejs && requirejs[2]) {
        // 说明使用了`<!--require()-->`语法引入
        const importFilePath = path.resolve(resourcePath, requirejs[2]);
        dyImport = importFilePath;
    } else {
        const pickLoader = require.resolve('./utils/pickFence.js');
        const fakemd = `${require.resolve('./utils/_fakemd')}?mdurl=${resourcePath}&_t=${Date.now()}`;

        dyImport = `${require.resolve('@baidu/hulk-san-loader')}!${pickLoader}?url=${resourcePath}!${fakemd}";`;
    }
    return dyImport;
}
