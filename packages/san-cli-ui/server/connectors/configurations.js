/**
 * @file To get/set cwd，base on process.cwd()
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/cwd.js
 */

const plugin = require('./plugins');
const cwd = require('./cwd');

const list = context => {
    return plugin.getApi(cwd.get()).configurations;
};

module.exports = {
    list
};
