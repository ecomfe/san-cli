/**
 * @file 解析器
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/**
 * 来自 docsify
 * Render anchor tag
 * @link https://github.com/markedjs/marked#overriding-renderer-methods
 */
const prism = require('prismjs');
const marked = require('marked');

const {slugify, helper, merge} = require('./index');

const renderer = new marked.Renderer();
const origin = {};

origin.heading = renderer.heading = (text, level) => {
    const slug = slugify(text);
    const url = '#' + slug;

    return `<h${level} id="${slug}"><span>${text}</span><a href="${url}" class="anchor">#<a></h${level}>`;
};
// Highlight code
origin.code = renderer.code = (code, lang = '') => {
    if (lang === undefined) {
        lang = '';
    }

    const hl = prism.highlight(code, prism.languages[lang] || prism.languages.markup);

    return `<pre v-pre data-lang="' + lang + '"><code class="lang-' + lang + '">${hl}</code></pre>`;
};

origin.paragraph = renderer.paragraph = text => {
    let result;
    if (/^!&gt;/.test(text)) {
        result = helper('tip', text);
    } else if (/^\?&gt;/.test(text)) {
        result = helper('warn', text);
    } else {
        result = '<p>' + text + '</p>';
    }
    return result;
};

renderer.origin = origin;

function isPrimitive(value) {
    return typeof value === 'string' || typeof value === 'number';
}

module.exports = (text, options = {}) => {
    marked.setOptions(
        merge(options, {
            renderer: merge(renderer, options.renderer || {})
        })
    );

    let html;
    if (isPrimitive(text)) {
        html = marked(text);
    } else {
        html = marked.parser(text);
    }

    slugify.clear();
    return html;
};
