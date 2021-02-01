['css', 'file', 'url', 'style', 'stylus', 'sass', 'postcss', 'script', 'svg', 'createRule', 'createOneOfRule'].forEach(
    id => {
        exports[id] = require(`./${id}.js`);
    }
);
