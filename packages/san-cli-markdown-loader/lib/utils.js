/**
 * @file utils
 * @author ksky521
 */
const path = require('path');
const URL = require('url');
const {remove: removeDiacritics} = require('diacritics');

// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
exports.slugify = str =>
    removeDiacritics(str)
        // Remove control characters
        .replace(rControl, '')
        // Replace special characters
        .replace(rSpecial, '-')
        // Remove continuous separators
        .replace(/\-{2,}/g, '-')
        // Remove prefixing and trailing separators
        .replace(/^\-+|\-+$/g, '')
        // ensure it doesn't start with a number (#121)
        .replace(/^(\d)/, '_$1')
        // lowercase
        .toLowerCase();

const mdLink2Html = str => str.replace(/\.md$/, '.html').replace(/README\.html$/, 'index.html');
exports.mdLink2Html = mdLink2Html;
exports.getRelativeLink = (from, to, rootUrl = '/') => {
    to = mdLink2Html(to);
    if (path.isAbsolute(to)) {
        return rootUrl.replace(/\/+$/, '') + '/' + to.replace(/^\/+/, '');
    }
    to = URL.resolve(from, to);
    if (/^\./.test(to)) {
        return to;
    }
    return rootUrl.replace(/\/+$/, '') + '/' + to.replace(/^\/+/, '');
};
const unescapeHtml = html =>
    String(html)
        .replace(/&quot;/g, '"')
        /* eslint-disable quotes */
        .replace(/&#39;/g, "'")
        /* eslint-enable quotes */
        .replace(/&#x3A;/g, ':')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
exports.unescapeHtml = unescapeHtml;

const escapeHtml = require('escape-html');
exports.escapeHtml = escapeHtml;

// This method remove the raw HTML but reserve the HTML wrapped by `<code>`.
// e.g.
// Input: "<a> b",   Output: "b"
// Input: "`<a>` b", Output: "`<a>` b"
exports.removeNonCodeWrappedHTML = function removeNonCodeWrappedHTML(str) {
    return String(str).replace(/(^|[^><`])<.*>([^><`]|$)/g, '$1$2');
};

const emojiData = require('markdown-it-emoji/lib/data/full.json');
function parseEmojis(str) {
    return String(str).replace(/:(.+?):/g, (placeholder, key) => emojiData[key] || placeholder);
}
exports.parseEmojis = parseEmojis;
const removeMarkdownTokens = str =>
    String(str)
        .replace(/\[(.*)\]\(.*\)/, '$1') // []()
        .replace(/(`|\*{1,3}|_)(.*?[^\\])\1/g, '$2') // `{t}` | *{t}* | **{t}** | ***{t}*** | _{t}_
        .replace(/(\\)(\*|_|`|\!)/g, '$2');
exports.removeMarkdownTokens = removeMarkdownTokens;

function compose(...processors) {
    if (processors.length === 0) {
        return input => input;
    }
    if (processors.length === 1) {
        return processors[0];
    }
    return processors.reduce((prev, next) => {
        return (...args) => next(prev(...args));
    });
}
exports.compose = compose;

// Unescape html, parse emojis and remove some md tokens.
exports.parseHeaders = v => compose(unescapeHtml, parseEmojis, removeMarkdownTokens, str => str.trim());
