

const registries = require('../registries');
const {log, warn} = require('./logger');
const request = require('request');
// http://registry.npm.baidu-int.com/@baidu/Boxjs/latest
async function ping(registry, pkg = 'vue') {
    await request.get(`${registry}/${pkg}/latest`);
    return registry;
}
let latest;
exports.getNPMRegistry = async () => {
    // 目前优先选择公司网络
    const registry = await ping(registries.baidu, '@baidu/Boxjs');

    if (!registry) {
        log();
        warn('不在百度内部环境，可能私有包安装不成功');
        warn('如果是在家办公，请使用打开 VPN 再安装私有包');
        if (latest && latest !== registries.baidu) {
            // 缓存下最新的结果
            return latest;
        }

        let faster;
        try {
            faster = await Promise.race([
                ping(registries.npm),
                ping(registries.taobao)
            ]);
        }
        catch (e) {
            return;
        }
        latest = faster;
        return faster;
    }

    return registry;
};
