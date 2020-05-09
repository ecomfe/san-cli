const fs = require('fs');
const path = require('path');

const channels = require('../apollo-server/channels');

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
        context.pubsub.publish(channels.CWD_CHANGED, {
            cwdChanged: value
        });
        try {
            process.chdir(value);
        }
        catch (err) {}
    }
};
