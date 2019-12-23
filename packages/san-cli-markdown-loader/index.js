/**
 * @file markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable fecs-max-calls-in-template */
const qs = require('querystring');

const grayMatter = require('gray-matter');
const loaderUtils = require('loader-utils');
const {NS, sanboxRegExp, sanboxTextTag, sanboxHighlightCode, sanboxSanComponent} = require('./const');
const compiler = require('./lib/compiler');
const parseHeader = require('./lib/parseHeader');

// eslint-disable-next-line
module.exports = function(content) {
    this.cacheable && this.cacheable();
    const loaderContext = this;
    if (!loaderContext['thread-loader'] && !loaderContext[NS]) {
        loaderContext.emitError(
            new Error(
                /* eslint-disable max-len */
                'san-cli-markdown-loader was used without the corresponding plugin. Make sure to include SanMarkdownLoaderPlugin in your webpack config.'
            )
        );
    }
    const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r);
    const {resourcePath, resourceQuery} = loaderContext;
    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);
    let index = parseInt(query.index, 10);

    const inheritQuery = `&${rawQuery}`;

    // eslint-disable-next-line
    let {codebox = '', context = process.cwd(), i18n = '', markdownIt, extractHeaders = ['H2', 'H3'], rootUrl} =
        loaderUtils.getOptions(this) || {};
    // markdownIt 是 mdit 的配置项内容付下：
    // {
    //     options: {},
    //     anchor
    //     toc
    //     lineNumbers
    //   extend
    //   extractHeaders
    // }

    // 1. 获取content，正则匹配 sanbox 内容
    // 2. sanbox 按照位置替换成 Component
    // 3. 组装 san defindComponent 内容
    const frontMatter = grayMatter(content);
    const matter = frontMatter.data || {};
    content = frontMatter.content;

    const headers = parseHeader(content, compiler.getCompiler(), extractHeaders);

    const getTemplate = content => {
        const cls = typeof matter.classes === 'string' ? [matter.classes] : matter.classes || ['markdown'];
        return `${JSON.stringify('<div class="' + cls.join(' ') + '">' + content + '</div>')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')}`;
    };
    // 存在 exportType 的情况
    switch (query.exportType) {
        case 'data':
            // 这里是给 sidebar 和 navbar 这样的 list 用到的解析
            const list = compiler(content, markdownIt);
            return `
            export default ${JSON.stringify(list)};
            `;
        // 这是返回 html，不处理 san box
        case 'html':
            return `
                const html = ${getTemplate(compiler(content, markdownIt))};
                export default html;
            `;
        case 'matter':
            // 返回 matter 对象
            return `
                export default ${JSON.stringify(matter)};
            `;
        case sanboxTextTag:
        case sanboxHighlightCode:
        case sanboxSanComponent:
            if (!isNaN(index) && index >= 0) {
                let rq = `?san-md&type=${query.exportType}&index=${index}&codebox=${codebox}&context=${context}&i18n=${i18n}`;
                rq = stringifyRequest(resourcePath + rq);
                return `
                    import mod from ${rq}; export default mod; export * from ${rq};
                `;
            }
            return '';
    }

    // 整个文件返回 san Component
    let sanboxArray = [];
    sanboxRegExp.lastIndex = 0;
    content = content.replace(sanboxRegExp, (input, match) => {
        const idx = sanboxArray.length;
        sanboxArray.push(match);
        return `<san-box-${idx}></san-box-${idx}>`;
    });

    if (sanboxArray.length === 0) {
        // 如果没有san box 则直接返回 html template
        return `
            import {defineComponent} from 'san';
            const Content = defineComponent({
                template: ${getTemplate(compiler(content, markdownIt))}
            })
            Content.$matter = ${JSON.stringify(matter)};
            Content.$headers = ${JSON.stringify(headers)};
            export default Content;
            if(window){
                window.$Page = Content;
            }
            `;
    } else {
        // 返回 san box
        let components = {};
        sanboxArray = sanboxArray.map((box, idx) => {
            const query = `?san-md&type=sanbox&index=${idx}${inheritQuery}&codebox=${codebox}&context=${context}&i18n=${i18n}`;
            components[`san-box-${idx}`] = `Sanbox${idx}`;
            return `import Sanbox${idx} from ${stringifyRequest(resourcePath + query)};`;
        });
        let compString = [];
        Object.keys(components).forEach(key => {
            compString.push(JSON.stringify(key) + ':' + components[key]);
        });
        compString = `{
            ${compString.join(',\n')}
        }`;

        return `
            import {defineComponent} from 'san';

            ${sanboxArray.join('\n')}
            const Content = defineComponent({
                template: ${getTemplate(compiler(content, markdownIt))},
                components: ${compString}
            })
            Content.$matter = ${JSON.stringify(matter)};
            Content.$headers = ${JSON.stringify(headers)};
            export default Content;
            if(window){
                window.$Page = Content;
            }
        `;
    }
};
