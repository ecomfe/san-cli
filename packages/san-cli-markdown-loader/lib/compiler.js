/**
 * @file 解析器
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const MdIt = require('markdown-it');

function getCompiler(opt = {}) {
    // {
    //     anchor
    //     toc
    //     lineNumbers
    //   extend
    //   extractHeaders
    // }
    const {
        link,
        lineNumbers = false,
        anchor = {permalink: true, permalinkBefore: true, permalinkSymbol: '#'},
        extend = () => {},
        toc = {includeLevel: [2, 3]},
        table = {
            multiline: false,
            rowspan: true,
            headerless: false
        }
    } = opt;

    const preset = opt.preset;
    // prettier-ignore
    let parser = preset === 'default' || preset === 'commonmark' || preset === 'zero' ? new MdIt(opt) : new MdIt(
        Object.assign({
            xhtmlOut: true,
            html: true,
            highlight: require('./markdown/prismjs')({lineNumbers})
        }, preset)
    );

    parser.use(require('markdown-it-cjk-breaks'));
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
    parser.use(require('markdown-it-div'), {
        render(tokens, idx, options, env, slf) {
            const map = {
                warn: 'warning',
                danger: 'error',
                tip: 'info'
            };
            const info = tokens[idx].info.trim();
            const m = info.match(/^(warning|error|danger|warn|tip|info|success)\s+(.*)$/);

            if (tokens[idx].nesting === 1) {
                // opening tag
                let rs = '';
                if (m) {
                    const cls = map[m[1]] ? map[m[1]] : m[1];
                    rs += `<div class="${cls}">`;
                    const title = m[2];
                    if (title) {
                        rs += `<p class="info-title">${parser.utils.escapeHtml(title)}</p>\n`;
                    }
                    return rs;
                } else {
                    // add a class to the opening tag
                    const params = info.split(/\s+/);
                    let id = null;
                    let classes = [];
                    for (let i = 0; i < params.length; i++) {
                        let cls = params[i];
                        if (cls.includes('=')) {
                            let [set0, set1] = cls.split('=', 2);
                            tokens[idx].attrJoin(set0, set1);
                        } else if (cls[0] === '#') {
                            id = cls.slice(1);
                        } else if (cls[0] === '.') {
                            classes.push(cls.slice(1));
                        } else {
                            classes.push(cls);
                        }
                    }
                    if (id) {
                        tokens[idx].attrJoin('id', id);
                    }
                    if (classes.length > 0) {
                        tokens[idx].attrJoin('class', classes.join(' '));
                    }
                }
                return slf.renderToken(tokens, idx, options, env, slf);
            } else {
                // closing tag
                return '</div>\n';
            }
        }
    });

    parser.use(require('./markdown/jsx'));
    parser.use(require('./markdown/link'), link);
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
    const parser = getCompiler(options);

    let html = parser.render(text);
    // 解决{{}}被 san 误当成变量解析的情况
    // html = html.replace('{{', '&#123;&#123;');
    return html;
};

module.exports.getCompiler = getCompiler;
