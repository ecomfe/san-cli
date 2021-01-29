
const loaderMap = new Map();
exports.setLoader = function setLoader(name, loader, options) {
    loaderMap.set(name, {loader, options});
};

exports.getLoaders = ()=>{
    ['babel', 'ejs', 'file', 'url', 'less', 'html', 'postcss', 'san', 'san-hot', 'style', 'svg'].map(
        id => {
             = require(`./${id}`);
        }
    );
}
