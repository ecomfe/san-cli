/**
 * @file 来自 html-webpack-plugin v4，因为现在都是v3 版本，v3 有生成 html 的函数，但是 v4 没有，为了兼容，所以索性拿来 v4 的方法直接用了
 */
/**
 * @file
 * This file provides to helper to create html as a object repesentation as
 * thoses objects are easier to modify than pure string representations
 *
 * Usage:
 * ```
 * const element = createHtmlTagObject('h1', {class: 'demo'}, 'Hello World');
 * const html = htmlTagObjectToString(element);
 * console.log(html) // -> <h1 class="demo">Hello World</h1>
 * ```
 */

/**
 * All html tag elements which must not contain innerHTML
 * @see https://www.w3.org/TR/html5/syntax.html#void-elements
 */
const voidTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];

function htmlTagObjectToString(tagDefinition, xhtml) {
    const attributes = Object.keys(tagDefinition.attributes || {})
        /* eslint-disable space-before-function-paren */
        .filter(function(attributeName) {
            return tagDefinition.attributes[attributeName] !== false;
        })
        .map(function(attributeName) {
            if (tagDefinition.attributes[attributeName] === true) {
                return xhtml ? attributeName + '="' + attributeName + '"' : attributeName;
            }
            return attributeName + '="' + tagDefinition.attributes[attributeName] + '"';
        });
    /* eslint-enable space-before-function-paren */
    return (
        /* eslint-disable operator-linebreak */
        '<' +
        [tagDefinition.tagName].concat(attributes).join(' ') +
        (tagDefinition.voidTag && xhtml ? '/' : '') +
        '>' +
        (tagDefinition.innerHTML || '') +
        (tagDefinition.voidTag ? '' : '</' + tagDefinition.tagName + '>')
        /* eslint-enable operator-linebreak */
    );
}

function createHtmlTagObject(tagName, attributes = {}, innerHTML) {
    return {
        tagName,
        voidTag: voidTags.indexOf(tagName) !== -1,
        attributes,
        innerHTML
    };
}

module.exports = {
    createHtmlTagObject,
    htmlTagObjectToString
};
