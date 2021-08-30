const minimist = require('minimist');
const fetch = require('node-fetch');
const execa = require('execa');
const {packageManager} = require('./packageManager');
const cwd = require('../connectors/cwd');

const registries = {
    npm: 'https://registry.npmjs.org',
    yarn: 'https://registry.yarnpkg.com',
    taobao: 'https://registry.npm.taobao.org',
    pnpm: 'https://registry.npmjs.org'
};

let registry = '';

async function getRegistry(tool) {
    const args = minimist(process.argv, {
        alias: {
            r: 'registry'
        }
    });
    registry = args.registry;
    if (await shouldUseTaobao(tool)) {
        registry = registries.taobao;
    }
    return registry;
}

async function getFileRegistry(tool) {
    try {
        registry = (await execa(tool, ['config', 'get', 'registry'])).stdout;
    }
    catch (e) {
        registry = (await execa(tool, ['config', 'get', 'registry'])).stdout;
    }
}

function removeSlash(url) {
    return url.replace(/\/$/, '');
}

async function ping(url) {
    const opts = {
        method: 'GET',
        timeout: 30000,
        json: true
    };
    await fetch(`${url}/san-cli`, opts);
    return url;
}

// 判断淘宝源
let isChecked = false;
let checkedResult = false;

async function shouldUseTaobao(command) {
    const defaultRegistry = registries[command];
    let faster = '';

    if (!command) {
        command = packageManager(cwd.get());
    }

    if (isChecked) {
        return checkedResult;
    }

    // 获取文件源
    await getFileRegistry(command);

    isChecked = true;

    if (removeSlash(defaultRegistry) !== removeSlash(registry)) {
        return false;
    }

    try {
        faster = await Promise.race([
            ping(defaultRegistry),
            ping(registries.taobao)
        ]);
    }
    catch (e) {
        return false;
    }

    checkedResult = faster === registries.taobao;
    return checkedResult;
}

module.exports = {
    shouldUseTaobao,
    getRegistry
};
