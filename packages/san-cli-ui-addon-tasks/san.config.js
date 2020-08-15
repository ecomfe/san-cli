/**
 * @file san config
 *
 */

const clientAddonConfig = require('san-cli-ui/client-addon-config');

module.exports = {
    ...clientAddonConfig({
        id: 'san.webpack.client-addon.task',
        port: 8951
    })
};
