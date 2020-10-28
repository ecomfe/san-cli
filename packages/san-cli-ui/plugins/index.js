/**
 * @file CLI UI第三方插件
 * @author zttonly
 */

module.exports = api => {
    require('san-cli-ui-widgets')(api);
    require('san-cli-plugin-dashboard/ui')(api);
    require('./sanConfig')(api);
    require('./eslintConfig')(api);
};
