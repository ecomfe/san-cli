['file', 'url', 'style', 'script', 'svg', 'createRule', 'createOneOfRule'].forEach(id => {
    exports[id] = require(`./${id}.js`);
});
