['babel', 'ejs', 'file', 'url', 'less', 'html', 'postcss', 'san', 'san-hot', 'style', 'svg'].map(id => {
    exports[id] = require(`./${id}`);
});
