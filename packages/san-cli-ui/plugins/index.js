/**
 * @file defaults
 * @author zttonly
 */

const {cosmiconfigSync} = require('cosmiconfig');
// const explorerSync = cosmiconfigSync('eslint', {
//     stopDir: process.cwd()
// });

module.exports = api => {
    require('./widgets')(api);
    require('./sanConfig')(api);
    // 如果项目没有 eslint 的相关配置，就不加载 eslint 插件
    // if (explorerSync.search() !== null) {
    //     require('./eslintConfig')(api);
    // }
    // TODO：task.js 还没开发完，所以先把下面这行注释掉，不然页面跑起来有问题
    require('./task')(api);
};
