/**
 * @file clientAddons connectors
 * @author zttonly
 */
const path = require('path');
const channels = require('../utils/channels');
const {resolveModuleRoot} = require('../utils/module');

// eslint-disable-next-line no-undef
let baseUrl = process.env.SAN_VAR_APP_GRAPHQL_ENDPOINT || '/graphql';
if (baseUrl) {
    baseUrl = baseUrl.replace(/ws:\/\/([a-z0-9_-]+:\d+).*/i, 'http://$1');
}


class ClientAddons {
    constructor() {
        this.addons = [];
    }
    add(options, context) {
        if (this.findOne(options.id)) {
            this.remove(options.id);
        }

        this.addons.push(options);
        context.pubsub.publish(channels.CLIENT_ADDON_ADDED, {
            clientAddonAdded: options
        });
    }
    remove(id) {
        const index = this.addons.findIndex(addon => addon.id === id);
        if (index !== -1) {
            this.addons.splice(index, 1);
        }
    }
    findOne(id) {
        return this.addons.find(addon => addon.id === id);
    }
    list() {
        return this.addons;
    }
    clear() {
        for (const addon of this.addons) {
            this.remove(addon.id);
        }
    }
    getUrl(addon) {
        return addon.url || `${baseUrl}/_addon/${addon.id}/index.js`;
    }
    serve(req, res) {
        const {id, 0: file} = req.params;
        const addon = this.findOne(decodeURIComponent(id));
        if (addon && addon.path) {
            const resolvedPath = require.resolve(addon.path);
            const basePath = resolveModuleRoot(resolvedPath);
            if (basePath) {
                res.sendFile(path.join(basePath, file), {maxAge: 0});
            }
            else {
                res.status(404);
                res.send(`File not found (resolved: ${resolvedPath}`);
            }
        }
        else {
            res.status(404);
            res.send(`Addon ${id} not found in loaded addons.`);
        }
    }
}

module.exports = new ClientAddons();
