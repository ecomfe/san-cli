/**
 * @file markdown loader
 * @author ksky521
 */
const qs = require('querystring');
const fs = require('fs');
const path = require('path');
const grayMatter = require('gray-matter');
const loaderUtils = require('loader-utils');
const {NS, sanboxRegExp} = require('./const');
const compiler = require('./lib/compiler');
const parseHeader = require('./lib/parseHeader');
const parseList = require('./lib/parseList');
const {mdLink2Html} = require('./lib/utils');

function updateSanDocit(filename, info) {
    global.SAN_DOCIT = global.SAN_DOCIT || {};

    let sandocit = global.SAN_DOCIT[filename] || {};
    sandocit = Object.assign(sandocit, info);

    // 记录数据
    global.SAN_DOCIT[filename] = sandocit;
}

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

    const options = loaderUtils.getOptions(loaderContext);
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
    } = options || query;

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

    const contextQuery = `context=${JSON.stringify({
        codebox,
        cwd,
        i18n,
        rootUrl
    })}`;

    const getTemplate = (content, quote = true) => {
        const cls = typeof matter.classes === 'string' ? [matter.classes] : matter.classes || ['markdown'];
        const encode = quote ? str => JSON.stringify(str) : str => str;
        return `${encode('<div class="' + cls.join(' ') + '">' + content + '</div>')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')}`;
    };

    let sanboxArray = [];
    sanboxRegExp.lastIndex = 0;
    content = content.replace(sanboxRegExp, (input, match) => {
        const idx = sanboxArray.length;
        sanboxArray.push(match);
        return `<san-box-${idx}></san-box-${idx}>`;
    });

    const toc = parseHeader(content, compiler.getCompiler(markdownIt), extractHeaders);

    let codeboxSource = '';
    if (sanboxArray.length) {
        codeboxSource = sanboxArray.reduce((total, currentValue, idx) => {
            const query = `?san-md-picker&get=sanbox&eq=${idx}&${contextQuery}`;
            const name = `sanbox${idx}`;
            // San 不支持全局组件，通过变量手工替换处理，另外两种办法也行不通
            // 1. customElements.define 可以实现简单的WebComponent定义（HTML字符串）
            // 2. san-component 支持template里的全局组件，不支持HTML字符串里的组件
            return `${total}
                import ${name} from ${stringifyRequest(resourcePath + query)};
                window.__sanbox['${name}'] = {
                    el: 'san-box-${idx}',
                    comp: ${name}
                };
            `;
        }, 'window.__sanbox = {};');
    }

    let getSideOrNavBarHTML = filepath => {
        const content = fs.readFileSync(filepath, 'utf8');
        const html = parseList(content, {
            resourcePath,
            relativeTo: resourcePath,
            relativeLink: link,
            context: cwd,
            rootUrl
        });

        return html;
    };

    const html = getTemplate(compiler(content, markdownIt), false);

    let info = {
        content: html,
        config: {
            rootUrl,
            siteName: options.siteName
        },
        toc,
        link,
        matter
    };

    if (options.sidebar) {
        info.sidebar = getSideOrNavBarHTML(options.sidebar);
    }
    if (options.navbar) {
        info.navbar = getSideOrNavBarHTML(options.navbar);
    }

    // 记录数据
    updateSanDocit(resourcePath, info);

    const code = `
        /**
         * markdown
         * @file ${resourcePath}
         * @query ${rawQuery}
        */
        ${codeboxSource}
        export default ${JSON.stringify(info)};
    `;

    return code;
};
