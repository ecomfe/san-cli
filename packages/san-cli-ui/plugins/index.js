/**
 * @file defaults
 * @author zttonly
 */

module.exports = api => {
    require('./widgets')(api);
    require('./sanConfig')(api);
    require('./task')(api);
    require('./eslintConfig')(api);
};
