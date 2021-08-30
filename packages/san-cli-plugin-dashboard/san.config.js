/**
 * @file san config
 * @author jinzhan
 */

const clientAddonConfig = require('san-cli-ui/san.addon.config');

module.exports = {
    ...clientAddonConfig({
        id: 'san.webpack.client-addon.dashboard',
        port: 8951
    })
};
