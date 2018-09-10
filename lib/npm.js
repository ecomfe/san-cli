/**
 * @file npm 相关操作
 */
const execa = require('execa');
const {getNPMRegistry} = require('./utils/get-npm-registry');
const debug = require('debug')('installDeps');
const registries = require('./registries');
// @fex, @baidu, @befe, @nfe, @nuomi, @tieba, @super-fe
const privateRegx = /\s*@(fex|baidu|befe|nfe|nuomi|tieba|super-fe)\b/;

async function addRegistryToArgs(args, cliRegistry) {
    const altRegistry = cliRegistry || await getNPMRegistry();

    if (altRegistry) {
        args.push(`--registry=${altRegistry}`);
    }
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
            stdio: ['inherit', apiMode ? process.stdout : 'inherit', apiMode ? process.stderr : 'inherit']
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

exports.installPackage = async  (targetDir, packageName, args = [], cliRegistry, apiMode = false) => {
    args = ['install', '--loglevel', 'error'].concat(args);

    if (isBaiduScope(packageName)) {
        cliRegistry = registries.baidu;
    }

    await addRegistryToArgs(args, cliRegistry);
    if (Array.isArray(packageName)) {
        packageName.forEach(name => {
            args.push(name);
        });
    }
    else {
        packageName.split(' ').forEach(name => args.push(name));
    }

    debug('args: ', args);
    await executeCommand(args, targetDir, apiMode);
};

exports.uninstallPackage = async  (targetDir, packageName, cliRegistry, apiMode = false) => {
    const args = ['uninstall', '--loglevel', 'error'];

    await addRegistryToArgs(args, cliRegistry);
    args.push(packageName);

    debug('args: ', args);

    await executeCommand(args, targetDir, apiMode);
};

exports.updatePackage = async  (targetDir, packageName, args = [], cliRegistry, apiMode = false) => {
    args = ['update', '--loglevel', 'error'].concat(args);
    if (isBaiduScope(packageName)) {
        cliRegistry = registries.baidu;
    }

    await addRegistryToArgs(args, cliRegistry);
    if (Array.isArray(packageName)) {
        packageName.forEach(name => {
            args.push(name);
        });
    }
    else {
        packageName.split(' ').forEach(name => args.push(name));
    }

    debug('args: ', args);

    await executeCommand(args, targetDir, apiMode);
};
