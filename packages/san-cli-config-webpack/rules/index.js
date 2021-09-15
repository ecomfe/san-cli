[
    'url',
    'css',
    'sass',
    'less',
    'stylus',
    'script',
    'svg',
    'createCSSRule',
    'createRule',
    'createOneOfRule'
].forEach(id => {
    exports[id] = require(`./${id}.js`);
});
