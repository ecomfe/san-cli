/**
 * @file markdown loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable fecs-max-calls-in-template */
const qs = require('querystring');
const path = require('path');
const grayMatter = require('gray-matter');
const loaderUtils = require('loader-utils');
const {NS, sanboxRegExp} = require('./const');
const compiler = require('./lib/compiler');
const parseHeader = require('./lib/parseHeader');
const {mdLink2Html} = require('./lib/utils');

// eslint-disable-next-line
module.exports = function(content) {
    this.cacheable && this.cacheable();
    const loaderContext = this;

    const {resourcePath, resourceQuery} = loaderContext;
    const rawQuery = resourceQuery.slice(1);
    const query = qs.parse(rawQuery);
    if (query['san-md-picker'] != null) {
        // 需要跳过，让给picker处理
        return content;
    }
    let {
        codebox = '',
        cwd = query.cwd || process.cwd(),
        i18n = '',
        // markdownIt 是 mdit 的配置项内容付下：
        // {
        //     options: {},
        //     anchor
        //     toc
        //     lineNumbers
        //      extend
        // }
        markdownIt,
        rootUrl = '/',
        extractHeaders = ['H2', 'H3']
    } = loaderUtils.getOptions(loaderContext) || query;

    if (!loaderContext['thread-loader'] && !loaderContext[NS]) {
        loaderContext.emitError(
            new Error(
                /* eslint-disable max-len */
                'san-cli-markdown-loader was used without the corresponding plugin. Make sure to include SanMarkdownLoaderPlugin in your webpack config.'
            )
        );
    }
    const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r);

    const relativePath = path.relative(cwd, resourcePath);
    const link = mdLink2Html(relativePath);

    // 1. 获取content，正则匹配 sanbox 内容
    // 2. sanbox 按照位置替换成 Component
    // 3. 组装 san defindComponent 内容
    const frontMatter = grayMatter(content);
    const matter = frontMatter.data || {};
    content = frontMatter.content;

    // 合并下 mardownIt 配置
    markdownIt = Object.assign(markdownIt || {}, matter.markdownIt || {});
    markdownIt.link = {
        relativeLink: link,
        context: cwd,
        rootUrl
    };
    const toc = parseHeader(content, compiler.getCompiler(markdownIt), extractHeaders);

    const getTemplate = (content, quote = true) => {
        const cls = typeof matter.classes === 'string' ? [matter.classes] : matter.classes || ['markdown'];
        const encode = quote ? str => JSON.stringify(str) : str => str;
        return `${encode('<div class="' + cls.join(' ') + '">' + content + '</div>')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')}`;
    };

    // 整个文件返回 san Component
    let sanboxArray = [];
    sanboxRegExp.lastIndex = 0;
    content = content.replace(sanboxRegExp, (input, match) => {
        const idx = sanboxArray.length;
        sanboxArray.push(match);
        return `<san-box-${idx}></san-box-${idx}>`;
    });

    const contextQuery = `context=${JSON.stringify({
        codebox,
        cwd,
        i18n,
        rootUrl
    })}`;

    // 存在 exportType 的情况
    switch (query.exportType) {
        case 'data': {
            // 这里是给 sidebar 和 navbar 这样的 list 用到的解析
            const list = compiler(content, markdownIt);
            return `
                /**
                 * markdown with exportType=data
                 * @file ${resourcePath}
                 * @query ${rawQuery}
                 */
                export default ${JSON.stringify(list)};
            `;
        }
        // 这是返回 html，不处理 san box
        case 'html':
            return getTemplate(compiler(content, markdownIt), false);

        case 'matter':
            // 返回 matter 对象
            return `
                /**
                 * markdown with exportType=matter
                 * @file ${resourcePath}
                 * @query ${rawQuery}
                 */
                export default ${JSON.stringify(matter)};
            `;
    }

    // 为了代码好阅读：
    // 1. 默认 md 引入会进入到这里逻辑，然后替换掉 sanbox 中的内容为了对应的 tag
    // 2. template 是直接引入的 html-loader!markdown-loaer!md?exportType=html
    //    用 html-loader 处理后，link 和 image 就得到了保证
    // 3. 转到 template 的处理去上面的 switch 分支
    let code;
    let templateRequest = stringifyRequest(
        [`-!${require.resolve('html-loader')}`, __filename, resourcePath + '?exportType=html'].join('!')
    );
    if (sanboxArray.length === 0) {
        // 如果没有san box 则直接返回 html template
        code = `
            /**
             * markdown to san Component
             * @file ${resourcePath}
             * @query ${rawQuery}
             */
            import {defineComponent} from 'san';
            import template from ${templateRequest};
            const Content = defineComponent({
                template
            })
            Content.$matter = ${JSON.stringify(matter)};
            Content.$toc = ${JSON.stringify(toc)};
            Content.$link = ${JSON.stringify(link)}
            export default Content;
            if(window){
                window.$Page = Content;
            }
        `;
    } else {
        // 返回 san box
        let components = {};
        sanboxArray = sanboxArray.map((box, idx) => {
            const query = `?san-md-picker&get=sanbox&eq=${idx}&${contextQuery}`;
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
        code = `
            /**
             * markdown with sanbox to San Component
             * @file ${resourcePath}
             * @query ${rawQuery}
             */
            import {defineComponent} from 'san';
            import template from ${templateRequest};
            ${sanboxArray.join('\n')}
            const Content = defineComponent({
                template,
                components: ${compString}
            });
            Content.$matter = ${JSON.stringify(matter)};
            Content.$toc = ${JSON.stringify(toc)};
            Content.$link = ${JSON.stringify(link)}
            export default Content;
            if(window){
                window.$Page = Content;
            }
        `;
    }
    return code;
};
