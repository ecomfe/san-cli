/**
 * @file 解析器
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/**
 * 修改自 docsify
 * Render anchor tag
 * @link https://github.com/markedjs/marked#overriding-renderer-methods
 */
const marked = require('marked');

const merge = Object.assign;

const hasOwn = Object.prototype.hasOwnProperty;
let cache$1 = {};
const re = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;

function lower(string) {
    return string.toLowerCase();
}

function slugify(str) {
    if (typeof str !== 'string') {
        return '';
    }

    let slug = str
        .trim()
        .replace(/[A-Z]+/g, lower)
        .replace(/<[^>\d]+>/g, '')
        .replace(re, '')
        .replace(/\s/g, '-')
        .replace(/-+/g, '-')
        .replace(/^(\d)/, '_$1');
    let count = cache$1[slug];

    count = hasOwn.call(cache$1, slug) ? count + 1 : 0;
    cache$1[slug] = count;

    if (count) {
        slug = slug + '-' + count;
    }

    return slug;
}

slugify.clear = () => {
    cache$1 = {};
};

function helper(className, content) {
    return '<p class="' + className + '">' + content.slice(5).trim() + '</p>';
}

const renderer = new marked.Renderer();
const origin = {};

origin.heading = renderer.heading = (text, level) => {
    const slug = slugify(text);
    const url = '#' + slug;

    return `<h${level} id="${slug}"><span>${text}</span><a href="${url}" class="anchor">#</a></h${level}>`;
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
