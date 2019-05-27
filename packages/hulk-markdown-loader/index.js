/**
 * @file markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');

const sanLoader = require('@baidu/hulk-san-loader').loader;

const compiler = require('./utils/compiler');
const defaultTemplate = path.join(__dirname, './template.san');
const loaderUtils = require('loader-utils');
const genTemplate = require('./utils/genTemplate');
const getText = require('./utils/getText').getText;

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

    const {resourcePath, resourceQuery} = this;
    const params = resourceQuery !== '' ? loaderUtils.parseQuery(resourceQuery) : {};
    // eslint-disable-next-line
    const {
        ignore,
        template,
        context = process.cwd(),
        textTag = 'text',
        i18n = 'cn',
        exportType = params.exportType ? 'component' : 'app'
    } = loaderUtils.getOptions(this) || {};

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
    // TODO 在这里正则匹配页面用到的 html 模板，然后替换这个默认的模板
    // 获取 template 内容
    let templateContent = '';
    if (template && path.join(context, template)) {
        templateContent = fs.readFileSync(path.join(context, template), 'utf8');
    } else {
        templateContent = fs.readFileSync(defaultTemplate, 'utf8');
    }

    switch (exportType) {
        case 'component':
            // 将 code 转成独立 san component 返回
            const getSingleComponent = genSingleComponent.bind(this);
            return getSingleComponent(templateContent, contentObj);
        case 'object':
            // 将md 拆分成对象返回
            const genObjectCode = genObject.bind(this);
            return genObjectCode(templateContent, contentObj);
        default:
            // 默认是 app
            const callback = this.async();
            // 按照 template，返回app整体的 san component
            const genComponentCode = genAppComponent.bind(this);
            const tCode = genComponentCode(templateContent, contentObj);
            let {rootContext = process.cwd(), resourcePath, resourceQuery, query} = this;

            sanLoader(
                tCode,
                {
                    sourceMap: false,
                    hotReload: true,
                    minimize: false,
                    query,
                    resourcePath,
                    resourceQuery,
                    rootContext
                },
                callback
            );
    }
};

function genSingleComponent(template, data) {
    const {resourcePath} = this;
    const requirePath = getComponentImportFromCode(resourcePath, data.content);
    return `
    import sanComponent from '${requirePath}';
    export default sanComponent;
    `;
}

function genObject(template, data) {
    const {resourcePath} = this;
    if (data.code) {
        const requirePath = getComponentImportFromCode(resourcePath, data.content);
        data.sanComponent = 'sanComponent';
        data.hasCode = true;
        return `
import sanComponent from '${requirePath}';
export default ${JSON.stringify(data).replace(/(['"])sanComponent\1/g, 'sanComponent')};
`;
    } else {
        data.hasCode = false;
        return `export default ${JSON.stringify(data)}`;
    }
}

function genAppComponent(template, {text, code, content}) {
    const {resourcePath} = this;
    // getsource
    if (!code) {
        // 说明是纯 markdown
        return getMarkdownDefaultSanCode(compiler(content));
    }

    const textHtml = text ? compiler(text) : text;
    // 解决文档中的语法被解析的问题
    let codeHtml = `<pre><code class="language-html">${code.replace(/</g, '&lt;')}</code></pre>`;

    const requirePath = getComponentImportFromCode(resourcePath, content);

    let id = 'components-demo-' + Date.now();
    const sanComponent = genTemplate(template, {
        id,
        text: textHtml,
        code: codeHtml,
        dyImport: `import codePreview from '${requirePath}'`
    });
    return sanComponent;
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

        dyImport = `${require.resolve('@baidu/hulk-san-loader')}!${pickLoader}?url=${resourcePath}!${fakemd}`;
    }
    return dyImport;
}
