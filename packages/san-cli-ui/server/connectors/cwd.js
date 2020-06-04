/**
 * @file To get/set cwd，base on process.cwd()
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/cwd.js
 */

const fs = require('fs');
const path = require('path');
const {CWD_CHANGED} = require('../utils/channels');

let cwd = process.cwd();

const normalizeDir = dir => {
    // keep / or \
    if (dir.length === 1) {
        return dir;
    }

    // remove last / or \
    const lastChar = dir.charAt(dir.length - 1);
    if (lastChar === path.sep) {
        dir = dir.substr(0, dir.length - 1);
    }

    return dir;
};

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
