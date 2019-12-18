/**
 * @file 提取 html 代码
 */
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const loaderUtils = require('loader-utils');
const posthtml = require('posthtml');
const render = require('posthtml-render');
const {sanboxRegExp, isSanLoader} = require('../const');
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

const CODE_MAP = new Map();
function loader(content) {
    sanboxRegExp.lastIndex = 0;
    let codeboxTemplateType = 'san';
    let {codebox, context = process.cwd(), index, i18n = ''} = loaderUtils.getOptions(this);

    const {resourcePath, resourceQuery} = this;
    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);

    const matches = content.match(sanboxRegExp);
    content = matches[index].trim().replace(sanboxRegExp, '$2');

    // 加个 cache
    let codeType = '';
    let sanCode = '';
    const cacheKey = `${resourcePath}_${index}`;
    let cacheCode = CODE_MAP.get(cacheKey);

    if (!cacheCode) {
        sanCode = content.match(/```(html|san|js)\s{0,}(?:(?:\{[^?]+?\})?)\s+(.+?)\s+```/s);
        // console.log(sanCode[1]);
        if (sanCode) {
            codeType = sanCode[1];
            sanCode = sanCode[2].trim();
        } else {
            sanCode = '';
        }
        CODE_MAP.set(cacheKey, {
            type: codeType,
            code: sanCode
        });
    } else {
        sanCode = cacheCode.code;
        codeType = cacheCode.type;
    }
    if (query.type === 'sanbox') {
        // 获取 template 内容
        let templateContent = '';

        if (codebox) {
            if (!path.isAbsolute(codebox)) {
                codebox = path.resolve(context, codebox);
            }
            if (path.extname(codebox) === '.js') {
                codeboxTemplateType = 'js';
            } else {
                // TODO 报错信息，健壮性
                templateContent = fs.readFileSync(codebox, 'utf8');
            }
        } else {
            templateContent = getDefaultTplContent();
        }

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

        const code = render(codeTree);
        const text = render(textTree);

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
        if (codeType === 'js') {
            // 这里是 js 的写法
            // 这里不用 san-loader 查找是否有 babel-loader ，没有则直接返回，有的话加上 babel-loader

            // 将 san-loader 过滤掉
            loaders = loaders.filter(l => !isSanLoader(l));
        }
        const loaderIndex = loaders.findIndex(l => l.path === filename);
        if (loaderIndex > -1) {
            // console.log(
            //     String(templateContent)
            //         .replace(/<code-place-holder\s?\/>/g, code)
            //         .replace(/<text-place-holder\s?\/>/g, text)
            //         .replace(/('|")~code-preview\1/, request)
            // );

            const afterLoaders = loaders.slice(0, loaderIndex + 1);
            const beforeLoaders = loaders.slice(loaderIndex + 1);
            const curLoader = loaders[loaderIndex];
            let request = '';

            request = genRequest([...afterLoaders, curLoader, ...beforeLoaders]);

            if (codeboxTemplateType === 'js') {
                // 1. require codebox 模板
                // 2. 添加 Components：code-place-holder，text-place-holder，code-preview

                return `
                    import mod from '${codebox}';
                    import CodePreview from ${request};
                    mod.components = mod.components || {};
                    mod.template = mod.template.replace(/<text-place-holder\s?\/>/g, ${JSON.stringify(text).replace(
                        '`',
                        '&#96;'
                    )})
                                               .replace(/<code-place-holder\s?\/>/g, ${JSON.stringify(code).replace(
                                                   '`',
                                                   '&#96;'
                                               )}})
                    mod.components['code-preview'] = CodePreview;
                `;
            } else {
                // 这里是 san file 写法，需要添加 san-loader
                return String(templateContent)
                    .replace(/<code-place-holder\s?\/>/g, code.replace(/\`/g, '&#96;'))
                    .replace(/<text-place-holder\s?\/>/g, text.replace(/\`/g, '&#96;'))
                    .replace(/('|")~code-preview\1/, request);
            }
        }
    } else if (query.type === 'san-component' || query.type === 'js-component') {
        // 如果 sanCode
        return sanCode;
    }
}

module.exports = loader;
