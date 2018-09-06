/**
 * @file npm 相关操作
 */
const execa = require('execa');
const {getNPMRegistry} = require('./utils/get-npm-registry');
const debug = require('debug')('installDeps');
const registries = require('./registries');

async function addRegistryToArgs(args, cliRegistry) {
    const altRegistry = cliRegistry || await getNPMRegistry();

    if (altRegistry) {
        args.push(`--registry=${altRegistry}`);
    }
}
function isBaiduScope(pkgName) {
    // @fex, @baidu, @befe, @nfe, @nuomi, @tieba, @super-fe
    return /^@(fex|baidu|befe|nfe|nuomi|tieba|super-fe)/.test(pkgName);
}
function executeCommand(args, targetDir) {
    return new Promise((resolve, reject) => {
        const command = 'npm';
        const child = execa(command, args, {
            cwd: targetDir,
            stdio: ['inherit']
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

exports.installDeps = async (targetDir, cliRegistry) => {

    const args = ['install', '--loglevel', 'error'];
    await addRegistryToArgs(args, cliRegistry);
    debug(`args: `, args);
    await executeCommand(args, targetDir);
};

exports.installPackage = async  (targetDir, packageName, cliRegistry, dev = true) => {

    const args = ['install', '--loglevel', 'error'];
    if (dev) {
        args.push('-D');
    }

    if (isBaiduScope(packageName)) {
        cliRegistry = registries.baidu;
    }

    await addRegistryToArgs(args, cliRegistry);
    args.push(packageName);
    debug(`args: `, args);
    await executeCommand(args, targetDir);
};

exports.uninstallPackage = async  (targetDir, packageName, cliRegistry) => {
    const args = ['uninstall', '--loglevel', 'error'];

    await addRegistryToArgs(args, cliRegistry);
    args.push(packageName);

    debug(`args: `, args);

    await executeCommand(args, targetDir);
};

exports.updatePackage = async  (targetDir, packageName, cliRegistry) => {
    const args = ['update', '--loglevel', 'error'];
    if (isBaiduScope(packageName)) {
        cliRegistry = registries.baidu;
    }

    await addRegistryToArgs(args, cliRegistry);
    packageName.split(' ').forEach(name => args.push(name));

    debug(`args: `, args);

    await executeCommand(args, targetDir);
};
