/**
 * @file npm 相关操作
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const importLazy = require('import-lazy')(require);

const execa = importLazy('execa');
const {log, warn} = require('./logger');
const request = importLazy('request');
const debug = require('./get-debug').getDebugLogger('npm');
// @fex, @baidu, @befe, @nfe, @nuomi, @tieba, @super-fe
const privateRegx = /\s*@(fex|baidu|befe|nfe|nuomi|tieba|super-fe)\b/;

const registries = {
    npm: 'https://registry.npmjs.org',
    taobao: 'https://registry.npm.taobao.org',
    baidu: 'http://registry.npm.baidu-int.com'
};
exports.registries = registries;

async function addRegistryToArgs(args, cliRegistry) {
    const altRegistry = cliRegistry || (await getNPMRegistry());

    if (altRegistry) {
        args.push(`--registry=${altRegistry}`);
    }
}
// http://registry.npm.baidu-int.com/@baidu/Boxjs/latest
async function ping(registry, pkg = 'vue') {
    await request.get(`${registry}/${pkg}/latest`);
    return registry;
}

function isBaiduScope(pkgName) {
    if (Array.isArray(pkgName)) {
        for (let i = 0, len = pkgName.length; i < len; i++) {
            if (privateRegx.test(pkgName)) {
                return true;
            }
        }
        return false;
    }

    return privateRegx.test(pkgName);
}

function executeCommand(args, targetDir, apiMode = false) {
    return new Promise((resolve, reject) => {
        const command = 'npm';
        const child = execa(command, args, {
            cwd: targetDir,
            stdio: ['inherit', apiMode ? 'pipe' : 'inherit', apiMode ? 'pipe' : 'inherit']
        });

        child.on('close', code => {
            if (code !== 0) {
                reject(`命令执行错误: ${command} ${args.join(' ')}`);
                return;
            }
            resolve();
        });
    });
}

exports.installDeps = async (targetDir, cliRegistry, apiMode = false) => {
    const args = ['install', '--loglevel', 'error'];
    await addRegistryToArgs(args, cliRegistry);
    debug('args: ', args);
    await executeCommand(args, targetDir, apiMode);
};

exports.installPackage = async (targetDir, packageName, args = [], cliRegistry, apiMode = false) => {
    args = ['install', '--loglevel', 'error'].concat(args);

    if (isBaiduScope(packageName)) {
        cliRegistry = registries.baidu;
    }

    await addRegistryToArgs(args, cliRegistry);
    if (Array.isArray(packageName)) {
        packageName.forEach(name => {
            args.push(name);
        });
    } else {
        packageName.split(' ').forEach(name => args.push(name));
    }

    debug('args: ', args);
    await executeCommand(args, targetDir, apiMode);
};

exports.uninstallPackage = async (targetDir, packageName, cliRegistry, apiMode = false) => {
    const args = ['uninstall', '--loglevel', 'error'];

    await addRegistryToArgs(args, cliRegistry);
    args.push(packageName);

    debug('args: ', args);

    await executeCommand(args, targetDir, apiMode);
};

exports.updatePackage = async (targetDir, packageName, args = [], cliRegistry, apiMode = false) => {
    args = ['update', '--loglevel', 'error'].concat(args);
    if (isBaiduScope(packageName)) {
        cliRegistry = registries.baidu;
    }

    await addRegistryToArgs(args, cliRegistry);
    if (Array.isArray(packageName)) {
        packageName.forEach(name => {
            args.push(name);
        });
    } else {
        packageName.split(' ').forEach(name => args.push(name));
    }

    debug('args: ', args);

    await executeCommand(args, targetDir, apiMode);
};

// 最后记录的 registry
let latestRegistry;
async function getNPMRegistry() {
    // 目前优先选择公司网络
    const registry = await ping(registries.baidu, '@baidu/Boxjs');

    if (!registry) {
        log();
        warn('不在百度内部环境，可能私有包安装不成功');
        warn('如果是在家办公，请使用打开 VPN 再安装私有包');
        if (latestRegistry && latestRegistry !== registries.baidu) {
            // 缓存下最新的结果
            return latestRegistry;
        }

        let faster;
        try {
            faster = await Promise.race([ping(registries.npm), ping(registries.taobao)]);
        } catch (e) {
            return;
        }
        latestRegistry = faster;
        return faster;
    }

    return registry;
}

exports.getRegistry = getNPMRegistry;
