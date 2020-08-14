/**
 * @file san config
 * @author zttonly <zttonly@gmail.com>
 *
 */
const clientAddonConfig = require('san-cli-ui/client-addon-config');

module.exports = {
    ...clientAddonConfig({
        id: 'san.webpack.client-addon',
        port: 8889
    })
};
