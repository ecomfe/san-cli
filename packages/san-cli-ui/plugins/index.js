/**
 * @file defaults
 * @author zttonly
 */

module.exports = api => {
    require('./widgets')(api);
    require('./sanConfig')(api);
    require('./eslintConfig')(api);
};
