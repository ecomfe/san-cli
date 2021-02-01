['babel', 'ejs', 'file', 'url', 'less', 'html', 'postcss', 'san', 'san-hot', 'style', 'svg', 'svg-sprite'].map(id => {
    exports[id] = require(`./${id}`);
});
