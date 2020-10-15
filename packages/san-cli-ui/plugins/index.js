/**
 * @file defaults
 * @author zttonly
 */

module.exports = api => {
    require('./widgets')(api);
    require('./sanConfig')(api);
    require('san-cli-plugin-dashboard/ui')(api);
    require('san-cli-plugin-ocr/ui')(api);
    require('./eslintConfig')(api);
};
