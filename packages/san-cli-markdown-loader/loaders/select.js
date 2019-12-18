/**
 * @file 提取 html 代码
 */
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const loaderUtils = require('loader-utils');
const posthtml = require('posthtml');
const render = require('posthtml-render');
const {sanboxRegExp} = require('../const');
const compiler = require('../lib/compiler').getCompiler();
const defaultTemplate = path.join(__dirname, '../template.san');
const filename = __filename;
function loader(content) {
    sanboxRegExp.lastIndex = 0;

    let {template, context = process.cwd(), index, i18n = ''} = loaderUtils.getOptions(this);

    const loaders = this.loaders;

    const rawQuery = this.resourceQuery.slice(1);
    const query = qs.parse(rawQuery);

    const matches = content.match(sanboxRegExp);
    content = matches[index].trim().replace(sanboxRegExp, '$2');
    let sanCode = content.match(/```(?:html|san)\s{0,}(?:(?:\{[^?]+?\})?)\s+(.+?)\s+```/s);
    // console.log(sanCode[1]);
    if (sanCode) {
        sanCode = sanCode[1].trim();
    } else {
        sanCode = '';
    }
    if (query.type === 'sanbox') {
        // 获取 template 内容
        let templateContent = '';

        if (template) {
            if (!path.isAbsolute(template)) {
                template = path.resolve(context, template);
            }
            // TODO 报错信息，健壮性
            templateContent = fs.readFileSync(template, 'utf8');
        } else {
            templateContent = fs.readFileSync(defaultTemplate, 'utf8');
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
            query.type = 'code-component';
            const resourceUri = this.resourcePath + '?' + qs.stringify(query);
            return loaderUtils.stringifyRequest(this, '-!' + [...loaderStrings, resourceUri].join('!'));
        };
        const loaderIndex = loaders.findIndex(l => l.path === filename);
        if (loaderIndex > -1) {
            const afterLoaders = loaders.slice(0, loaderIndex + 1);
            const beforeLoaders = loaders.slice(loaderIndex + 1);
            const curLoader = loaders[loaderIndex];
            // console.log(curLoader)
            const request = genRequest([...afterLoaders, curLoader, ...beforeLoaders]);
            // console.log(
            //     String(templateContent)
            //         .replace(/<code-place-holder\s?\/>/g, code)
            //         .replace(/<text-place-holder\s?\/>/g, text)
            //         .replace(/('|")~code-preview\1/, request)
            // );
            return String(templateContent)
                .replace(/<code-place-holder\s?\/>/g, code)
                .replace(/<text-place-holder\s?\/>/g, text)
                .replace(/('|")~code-preview\1/, request);
        }
    } else if (query.type === 'code-component') {
        return sanCode;
    }
}

module.exports = loader;
