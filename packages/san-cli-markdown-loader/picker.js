/**
 * @file 提取 html 代码
 */
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const loaderUtils = require('loader-utils');
const posthtml = require('posthtml');
const render = require('posthtml-render');
const debug = require('debug')('san-cli-markdown-loader:picker');
const sanboxTextTag = 'sanbox:text-tag';
const sanboxHighlightCode = 'sanbox:highlight-code';
const sanboxSanComponent = 'sanbox:sancode';
const sanboxComponent = 'sanbox:san-component';
const sanboxJS = 'sanbox:js-component';
const {sanboxRegExp} = require('./const');
const compiler = require('./lib/compiler').getCompiler();
const defaultTemplate = path.join(__dirname, './template.san');

const cacheMap = new Map();

let defaultTemplateContent = '';

function getDefaultTplContent() {
    if (defaultTemplateContent === '') {
        defaultTemplateContent = fs.readFileSync(defaultTemplate, 'utf8');
    }
    return defaultTemplateContent;
}
function genRequest(resourcePath, query) {
    const resourceUri = resourcePath + '?' + qs.stringify(query);
    return loaderUtils.stringifyRequest(this, resourceUri);
}
module.exports = function loader(content) {
    const {resourcePath, resourceQuery} = this;
    const queryGenerator = genRequest.bind(this, resourcePath);
    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);

    debug('select.js query: %O', query);
    let {context = {}, eq: index, get = ''} = query;

    const cacheKey = `${resourcePath}~${get}~${index}`;
    if (query.san != null) {
        const cache = cacheMap.get(cacheKey);
        if (cache) {
            return cache;
        }
    }

    if (typeof context === 'string') {
        try {
            context = JSON.parse(context);
        }
        catch (e) {
            context = {};
        }
    }
    let {codebox, cwd = process.cwd(), i18n = ''} = context;
    const resolve = p => path.resolve(cwd, p);

    sanboxRegExp.lastIndex = 0;
    index = parseInt(index, 10);

    const matches = content.match(sanboxRegExp);
    if (!matches) {
        return content;
    }
    if (!matches[index]) {
        throw new Error(`md-picker: Get ${get}-${index} from ${resourcePath} fail!`);
    }
    content = matches[index].trim().replace(sanboxRegExp, '$2');

    // 加个 cache
    let codeType = '';
    let sanCode = '';

    sanCode = content.match(/```(html|san|js)\s{0,}(?:(?:\{[^?]+?\})?)\s+(.+?)\s+```/s);
    // console.log(sanCode[1]);
    if (sanCode) {
        codeType = sanCode[1];
        sanCode = sanCode[2].trim();
    }
    else {
        sanCode = '';
    }

    let codo = content;
    switch (get) {
        case sanboxHighlightCode:
            // 更改san-loader的type和lang
            codo = `
                <template>
                    ${getTagFromContent(content, {i18n}).code}
                </template>
                <script>
                export default {}
                </script>
            `;
            break;
        case sanboxTextTag:
            codo = `
                <template>
                    <section>${getTagFromContent(content, {i18n}).text}</section>
                </template>
                <script>
                export default {}
                </script>
            `;
            break;
        // 这俩是内部用的！
        case sanboxJS:
            // 如果 sanCode
            codo = `<script>${sanCode}</script>`;
            break;
        case sanboxComponent:
        case sanboxSanComponent:
            // 如果 sanCode
            codo = sanCode;
            break;
        case 'sanbox': {
            // 获取 template 内容
            let templateContent = '';

            if (codebox) {
                if (!path.isAbsolute(codebox)) {
                    codebox = resolve(codebox);
                }
                // TODO 报错信息，健壮性
                templateContent = fs.readFileSync(codebox, 'utf8');
            }
            else {
                templateContent = getDefaultTplContent();
            }
            let codeboxRequest;
            if (codeType === 'js') {
                query.get = sanboxJS;
                // codebox query string
                codeboxRequest = queryGenerator(query);
            }
            else {
                query.get = sanboxComponent;
                // san component query string
                codeboxRequest = queryGenerator(query);
            }

            // 生成san 语法高亮 query
            query.get = sanboxHighlightCode;
            const codeRequest = queryGenerator(query);

            // 生成san textTag query
            query.get = sanboxTextTag;
            const textRequest = queryGenerator(query);

            const requests = [codeRequest, textRequest, codeboxRequest];
            let code = String(templateContent);
            ['HighlightCode', 'Text', 'CodeBox'].forEach((str, i) => {
                code = code.replace(new RegExp(`('|")@docit/${str}\\1`, 'g'), requests[i]);
            });
            debug(code);
            codo = code;
            break;
        }
    }

    cacheMap.set(cacheKey, codo);

    return codo;
};

function getTagFromContent(content, options) {
    const {i18n} = options;
    const html = compiler.render(content);
    // 找出 div class='lang'
    // 找出 pre 结果
    let codeTree;
    let textTree;
    posthtml([
        tree => {
            tree.match({tag: 'pre'}, node => {
                codeTree = node;
                return node;
            });
            tree.match({tag: 'div', attrs: {class: i18n}}, node => {
                textTree = node.content;
                return node;
            });
            return tree;
        }
    ]).process(html, {
        sync: true
    });

    const code = render(codeTree).replace(/\`/g, '&#96;');
    const text = render(textTree).replace(/\`/g, '&#96;');
    return {code, text};
}
