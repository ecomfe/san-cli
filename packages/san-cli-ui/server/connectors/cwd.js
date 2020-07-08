/**
 * @file To get/set cwd，base on process.cwd()
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/cwd.js
 */

const fs = require('fs');
const {CWD_CHANGED} = require('../utils/channels');
const {normalizeDir} = require('../utils/fileHelper');

let cwd = process.cwd();

module.exports = {
    get: () => cwd,
    set: (value, context) => {
        value = normalizeDir(value);
        if (!fs.existsSync(value)) {
            return;
        }
        cwd = value;
        process.env.SAN_CLI_CONTEXT = value;
        context.pubsub.publish(CWD_CHANGED, {
            cwdChanged: value
        });
        try {
            process.chdir(value);
        }
        catch (err) {
            console.error(`chdir: ${err}`);
        }
    }
};
