/**
 * @file store default options
 * @author tanglei02 (tanglei02@baidu.com)
 */

module.exports = {
    hotreload: false,
    patterns: [
        {
            action: /\.action\.js$/,
            store: /\.store\.js$/
        },
        {
            action: 'auto',
            store: 'auto'
        }
    ]
};

