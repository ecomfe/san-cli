/**
 * @file 解析器
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const MdIt = require('markdown-it');

function getCompiler(opt) {
    // prettier-ignore
    let parser = opt === 'default' || opt === 'commonmark' || opt === 'zero' ? new MdIt(opt) : new MdIt({
        xhtmlOut: true,
        html: true,
        langPrefix: 'line-numbers language-'
    });
    parser.use(require('markdown-it-cjk-breaks'));
    parser.use(require('markdown-it-abbr'));
    parser.use(require('markdown-it-emoji'));
    parser.use(require('markdown-it-deflist'));

    parser.use(require('markdown-it-footnote'));
    parser.use(require('markdown-it-ins'));
    parser.use(require('markdown-it-sub'));
    parser.use(require('markdown-it-imsize'));
    parser.use(require('markdown-it-sup'));
    parser.use(require('markdown-it-attrs'));
    parser.use(require('markdown-it-task-lists'));
    parser.use(require('markdown-it-multimd-table'), {
        multiline: false,
        rowspan: true,
        headerless: false
    });
    parser.use(require('markdown-it-div'));
    parser.use(require('./markdown/jsx'));

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
