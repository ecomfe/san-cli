/**
 * @file 配置类的插件
 * @author jinzhan
 */

class ConfigPlugin {
    constructor() {
        this.hooks = {
            configRead: [],
            configWrite: []
        };
        this.configurations = [];
    }

    registerConfig(options) {
        try {
            // TODO: validate Configuration
            this.configurations.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errorLog
        }
    }

    /**
     * 配置被打开的时候回调
     * @param {Function} callback Handler
    */
    onConfigRead(callback) {
        this.hooks.configRead.push(callback);
    }

    /**
     * 配置文件被落盘的时候回调
     * @param {Function} callback Handler
    */
    onConfigWrite(callback) {
        this.hooks.configWrite.push(callback);
    }
};

module.exports = ConfigPlugin;
