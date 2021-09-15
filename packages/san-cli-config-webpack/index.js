const {devServerOptions} = require('./defaultOptions');
const resolve = require.resolve;
module.exports = {
    // 内置配置插件
    plugins: [
        resolve('./plugins/base'),
        resolve('./plugins/output'),
        resolve('./plugins/extensions'),
        resolve('./plugins/alias'),
        resolve('./plugins/san'),
        resolve('./plugins/fonts'),
        resolve('./plugins/media'),
        resolve('./plugins/image'),
        resolve('./plugins/svg'),
        resolve('./plugins/js'),
        resolve('./plugins/html'),
        resolve('./plugins/css'),
        resolve('./plugins/optimization')
    ],
    // devserver的默认值
    devServerOptions
};
