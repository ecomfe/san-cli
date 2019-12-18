/**
 * @file 解析器
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const MdIt = require('markdown-it');

function getCompiler(opt) {
    // {
    //     options: {},
    //     anchor
    //     toc
    //     lineNumbers
    //     plugins
    //         '@org/foo', // 等价于 @org/markdown-it-foo，如果对应的包存在
    //         ['markdown-it-bar', {
    //             // 提供你的选项
    //         }]
    //   extend
    //   extractHeaders
    // }

    const {
        lineNumbers = true,
        anchor = {permalink: true, permalinkBefore: true, permalinkSymbol: '#'},
        extend = () => {},
        extractHeaders = ['h2', 'h3'],
        toc = {includeLevel: [2, 3]},
        options = {},
        table = {
            multiline: false,
            rowspan: true,
            headerless: false
        }
    } = typeof opt === 'object' ? opt : {};
    // prettier-ignore
    let parser = opt === 'default' || opt === 'commonmark' || opt === 'zero' ? new MdIt(opt) : new MdIt(
        Object.assign({
            xhtmlOut: true,
            html: true,
            highlight: require('./markdown/prismjs')({lineNumbers})
        }, options)
    );

    parser.use(require('markdown-it-cjk-breaks'));
    parser.use(require('markdown-it-abbr'));
    parser.use(require('markdown-it-emoji'));
    parser.use(require('markdown-it-deflist'));

    parser.use(require('markdown-it-footnote'));
    parser.use(require('markdown-it-ins'));
    parser.use(require('markdown-it-anchor'), anchor);
    parser.use(require('markdown-it-table-of-contents'), toc);
    parser.use(require('markdown-it-sub'));
    parser.use(require('markdown-it-imsize'));
    parser.use(require('markdown-it-sup'));
    parser.use(require('markdown-it-attrs'));
    parser.use(require('markdown-it-task-lists'));
    parser.use(require('markdown-it-multimd-table'), table);
    parser.use(require('markdown-it-div'));

    parser.use(require('./markdown/jsx'));
    parser.use(require('./markdown/snippet'));

    if (typeof extend === 'function') {
        extend(parser);
    }

    const render = parser.render.bind(parser);
    parser.render = content => {
        return render(content).replace('{{', '&#123;&#123;');
    };
    return parser;
}
module.exports = (text, options = {}) => {
    text = String(text);
    const opt = options.markdownIt || {};
    const parser = getCompiler(opt);

    let html = parser.render(text);
    // 解决{{}}被 san 误当成变量解析的情况
    // html = html.replace('{{', '&#123;&#123;');
    return html;
};

module.exports.getCompiler = getCompiler;
