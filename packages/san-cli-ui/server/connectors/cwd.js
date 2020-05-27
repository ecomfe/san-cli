/**
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/cwd.js
 */

const fs = require('fs');
const path = require('path');
const {CWD_CHANGED} = require('../utils/channels');

let cwd = process.cwd();

function normalize(value) {
    if (value.length === 1) {
        return value;
    }

    const lastChar = value.charAt(value.length - 1);
    if (lastChar === path.sep) {
        value = value.substr(0, value.length - 1);
    }

    return value;
}

module.exports = {
    get: () => cwd,
    set: (value, context) => {
        value = normalize(value);
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
        catch (err) {}
    }
};
