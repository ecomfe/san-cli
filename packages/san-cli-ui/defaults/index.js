/**
 * @file defaults
 * @author zttonly
 */

module.exports = api => {
    require('./config')(api);
    require('./widgets')(api);
};
