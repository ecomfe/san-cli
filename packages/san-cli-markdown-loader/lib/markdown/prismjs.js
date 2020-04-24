// Modified from https://github.com/vuejs/vuepress/blob/fda5476aa1/packages/%40vuepress/markdown/lib/highlight.js

const prism = require('prismjs');
const loadLanguages = require('prismjs/components/index');
const {warn} = require('san-cli-utils/ttyLogger');
const escapeHtml = require('escape-html');
const NEW_LINE_EXP = /\n(?!$)/g;

// required to make embedded highlighting work...
loadLanguages(['markup', 'css', 'javascript']);

function wrap(code, lang, {lineNumbers, _linesNum}) {
    if (lang === 'text') {
        code = escapeHtml(code);
    }
    let lineNumString = '';
    if (_linesNum && _linesNum > 1) {
        lineNumString += '<span class="line-numbers-rows" aria-hidden="true">';
        lineNumString += [...Array(_linesNum)].map((line, index) => '<span></span>').join('');
        lineNumString += '</span>';
    }
    return `<pre class="${
        lineNumString !== '' ? 'line-numbers ' : ''
    }language-${lang}"><code class="language-${lang}">${code.trimRight()}${lineNumString}</code></pre>`;
}

module.exports = (options = {}) => (str, lang) => {
    if (options.lineNumbers) {
        // 添加lineNumbers
        let match = str.match(NEW_LINE_EXP);
        let linesNum = match ? match.length + 1 : 1;
        options._linesNum = linesNum;
    }
    if (!lang) {
        return wrap(str, 'text', options);
    }
    lang = lang.toLowerCase();
    const rawLang = lang;
    if (lang === 'vue' || lang === 'html') {
        lang = 'markup';
    }
    if (lang === 'md') {
        lang = 'markdown';
    }
    if (lang === 'rb') {
        lang = 'ruby';
    }
    if (lang === 'ts') {
        lang = 'typescript';
    }
    if (lang === 'py') {
        lang = 'python';
    }
    if (lang === 'sh') {
        lang = 'bash';
    }
    if (lang === 'yml') {
        lang = 'yaml';
    }
    if (lang === 'styl') {
        lang = 'stylus';
    }

    if (!prism.languages[lang]) {
        try {
            loadLanguages([lang]);
        } catch (e) {
            warn(`[markdown-loader] Syntax highlight for language "${lang}" is not supported.`);
        }
    }
    if (prism.languages[lang]) {
        const code = prism.highlight(str, prism.languages[lang], lang);
        return wrap(code, rawLang, options);
    }
    return wrap(str, 'text', options);
};
