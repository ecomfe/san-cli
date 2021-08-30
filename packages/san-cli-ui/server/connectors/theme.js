/**
 * @file San CLI UI 的主题
 * @author Lohoyo
 */

class Theme {
    get(context) {
        return context.db.get('config.uiTheme').value() || '';
    }

    set(theme, context) {
        context.db.set('config.uiTheme', theme).write();
        return true;
    }
};

module.exports = new Theme();
