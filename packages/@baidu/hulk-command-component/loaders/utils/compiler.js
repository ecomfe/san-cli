/**
 * @file 解析器
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const prism = require('prismjs');
const marked = require('marked');

const {
    slugify,
    helper,
    merge
} = require('./index.js');

const renderer = new marked.Renderer();

const origin = {};

/**
 * 来自 docsify
 * Render anchor tag
 * @link https://github.com/markedjs/marked#overriding-renderer-methods
 */
origin.heading = renderer.heading = function (text, level) {
    var slug = slugify(text);
    var url = '#' + slug;

    return ('<h' + level + ' id="' + slug + '"><span>' + text + '</span><a href="' + url + '" class="anchor">#</a></h' + level + '>');
};
// Highlight code
origin.code = renderer.code = function (code, lang) {
    if (lang === void 0) {
        lang = '';
    }

    var hl = prism.highlight(
        code,
        prism.languages[lang] || prism.languages.markup
    );

    return ('<pre v-pre data-lang="' + lang + '"><code class="lang-' + lang + '">' + hl + '</code></pre>');
};

origin.paragraph = renderer.paragraph = function (text) {
    var result;
    if (/^!&gt;/.test(text)) {
        result = helper('tip', text);
    }
    else if (/^\?&gt;/.test(text)) {
        result = helper('warn', text);
    }
    else {
        result = '<p>' + text + '</p>';
    }
    return result;
};

renderer.origin = origin;

function isPrimitive(value) {
    return typeof value === 'string' || typeof value === 'number';
}

module.exports = function (text, options) {
    options = options || {};
    marked.setOptions(
        merge(options, {
            renderer: merge(renderer, options.renderer || {})
        })
    );

    let html;
    if (isPrimitive(text)) {
        html = marked(text);
    }
    else {
        html = marked.parser(text);
    }

    slugify.clear();
    return html;
};
