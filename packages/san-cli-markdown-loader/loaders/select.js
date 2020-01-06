/**
 * @file 提取 html 代码
 */
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const loaderUtils = require('loader-utils');
const posthtml = require('posthtml');
const render = require('posthtml-render');
const {sanboxRegExp, isSanLoader, sanboxHighlightCode, sanboxTextTag, sanboxSanComponent} = require('../const');
const compiler = require('../lib/compiler').getCompiler();
const defaultTemplate = path.join(__dirname, '../template.san');
const filename = __filename;
let defaultTemplateContent = '';
function getDefaultTplContent() {
    if (defaultTemplateContent === '') {
        defaultTemplateContent = fs.readFileSync(defaultTemplate, 'utf8');
    }
    return defaultTemplateContent;
}

function loader(content) {
    sanboxRegExp.lastIndex = 0;
    let {codebox, context = process.cwd(), index, i18n = ''} = loaderUtils.getOptions(this);
    index = parseInt(index, 10);

    const {resourcePath, resourceQuery} = this;
    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);

    const matches = content.match(sanboxRegExp);
    content = matches[index].trim().replace(sanboxRegExp, '$2');

    // 加个 cache
    let codeType = '';
    let sanCode = '';

    sanCode = content.match(/```(html|san|js)\s{0,}(?:(?:\{[^?]+?\})?)\s+(.+?)\s+```/s);
    // console.log(sanCode[1]);
    if (sanCode) {
        codeType = sanCode[1];
        sanCode = sanCode[2].trim();
    } else {
        sanCode = '';
    }

    switch (query.type) {
        case sanboxHighlightCode:
            return `
                <template>
                    ${getTagFromContent(content, {i18n})['code']}
                </template>
            `;
        case sanboxTextTag:
            return `
                <template>
                    <section>${getTagFromContent(content, {i18n})['text']}</section>
                </template>
            `;
        case sanboxSanComponent:
            // 如果 sanCode
            return sanCode;
        case 'sanbox': {
            // 获取 template 内容
            let templateContent = '';

            if (codebox) {
                if (!path.isAbsolute(codebox)) {
                    codebox = path.resolve(context, codebox);
                }

                // TODO 报错信息，健壮性
                templateContent = fs.readFileSync(codebox, 'utf8');
            } else {
                templateContent = getDefaultTplContent();
            }

            let codeboxRequest;
            if (codeType === 'js') {
                const genRequest = loaders => {
                    const seen = new Map();
                    const loaderStrings = [];

                    loaders.forEach(loader => {
                        const identifier = typeof loader === 'string' ? loader : loader.path + loader.query;
                        const request = typeof loader === 'string' ? loader : loader.request;
                        if (!seen.has(identifier)) {
                            seen.set(identifier, true);
                            loaderStrings.push(request);
                        }
                    });
                    query.type = codeType === 'js' ? 'js-component' : 'san-component';
                    const resourceUri = resourcePath + '?' + qs.stringify(query);
                    return loaderUtils.stringifyRequest(this, '-!' + [...loaderStrings, resourceUri].join('!'));
                };
                let loaders = this.loaders;
                // 这里是 js 的写法
                // 这里不用 san-loader 查找是否有 babel-loader ，没有则直接返回，有的话加上 babel-loader

                // 将 san-loader 过滤掉
                loaders = loaders.filter(l => !isSanLoader(l));
                const loaderIndex = loaders.findIndex(l => l.path === filename);
                if (loaderIndex > -1) {
                    const afterLoaders = loaders.slice(0, loaderIndex + 1);
                    const beforeLoaders = loaders.slice(loaderIndex + 1);
                    const curLoader = loaders[loaderIndex];
                    codeboxRequest = genRequest([...afterLoaders, curLoader, ...beforeLoaders]);
                }
                // console.log(loaderIndex)
            } else {
                query.type = sanboxSanComponent;
                codeboxRequest = JSON.stringify(resourcePath + '?' + qs.stringify(query));
            }

            query.type = sanboxHighlightCode;
            const codeRequest = JSON.stringify(resourcePath + '?' + qs.stringify(query));
            query.type = sanboxTextTag;
            const textRequest = JSON.stringify(resourcePath + '?' + qs.stringify(query));

            const requests = [codeRequest, textRequest, codeboxRequest];
            let source = String(templateContent);
            ['HighlightCode', 'Text', 'CodeBox'].forEach((str, i) => {
                source = source.replace(new RegExp(`('|")@docit/${str}\\1`, 'g'), requests[i]);
            });
            return source;
        }

        // 这俩是内部用的！
        case 'js-component':
        case 'san-component':
            // 如果 sanCode
            return sanCode;
    }
    return '';
}

module.exports = loader;

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
