/**
 * @file 桌面通知
 * @author jinzhan
 */

const path = require('path');
const notifier = require('node-notifier');

const builtinIcons = {
    done: path.resolve(__dirname, '../../client/assets/done.png'),
    error: path.resolve(__dirname, '../../client/assets/error.png')
};

// 提供给桌面的消息通知，默认使用成功图标
module.exports = ({
    title,
    message,
    icon = 'done'
}) => notifier.notify({
    title,
    message,
    icon: builtinIcons[icon] || icon
});
