/**
 * @file san config
 *
 */

const {clientAddonConfig} = require('san-cli-ui/config');

module.exports = {
    ...clientAddonConfig({
        id: 'san.webpack.client-addon.task',
        port: 9999
    })
};
