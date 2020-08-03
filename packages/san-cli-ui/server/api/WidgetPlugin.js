/**
 * @file 仪表盘widget插件
 * @author jinzhan
*/
class WidgetPlugin {
    constructor() {
        this.widgets = [];
    }

    /**
     * 添加一个widget到仪表盘
     *
     * @param {object} def Widget definition
     */
    registerWidget(options) {
        try {
            // validate Widget options
            this.widgets.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errorlog
        }
    }
};

module.exports = WidgetPlugin;
