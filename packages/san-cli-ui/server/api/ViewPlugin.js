/**
 * @file 自定义视图插件
 * @author jinzhan
 */

class ViewPlugin {
    constructor() {
        this.hooks = {
            viewOpen: []
        };
        // Data
        this.clientAddons = [];
        this.views = [];
    }

    /**
     * 打开视图时候的回调
     *
     * @param {function} cb Handler
     */
    onViewOpen(cb) {
        if (this.lightMode) {
            return;
        }

        this.hooks.viewOpen.push(cb);
    }

    register(options) {
        try {
            // validateView(options);
            this.views.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errlog
        }
    }

    addClientAddon(options) {
        try {
            // validateClientAddon(options);
            if (options.url && options.path) {
                throw new Error('[url] and [path] can\'t be defined at the same time.');
            }
            this.clientAddons.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errlog()
        }
    }
};

module.exports = ViewPlugin;
