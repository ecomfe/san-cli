/**
 * @file 视图类插件
 * @author jinzhan
 */

class AddonPlugin {
    constructor() {
        this.hooks = {
            viewOpen: []
        };
        // Data
        this.addons = [];
        this.views = [];
    }
    /**
     * 注册一个自定义的路由
    */
    requestRoute(route) {
        // TODO: requestRoute(route, this.context);
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

    addView(options) {
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

    registerAddon(options) {
        try {
            // validateClientAddon(options);
            if (options.url && options.path) {
                throw new Error('[url] and [path] can\'t be defined at the same time.');
            }
            this.addons.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errlog()
        }
    }
};

module.exports = AddonPlugin;
