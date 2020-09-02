const minimist = require('minimist');
const request = require('request');
const execa = require('execa');
const util = require('util');
const {installTool} = require('./installTool');
const cwd = require('../connectors/cwd');


let isChecked = false;
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
    } catch (e) {
        registry = (await execa(tool, ['config', 'get', 'registry'])).stdout;
    }
}

function removeSlash(url) {
    return url.replace(/\/$/, '');
}

async function ping(url) {
    const reqOpts = {
        method: 'GET',
        timeout: 30000,
        resolveWithFullResponse: true,
        json: true,
        uri: `${url}/vue-cli-version-marker/latest`
    };
    await util.promisify(request)(reqOpts);
    return url;
}

// 判断淘宝源
async function shouldUseTaobao(command) {
    const defaultRegistry = registries[command];
    let faster = '';

    if (!command) {
        command = installTool(cwd.get());
    }
    if (isChecked) {
        return registry;
    }
    // 获取文件源
    await getFileRegistry(command);

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
    if (faster !== registries.taobao) {
        return false;
    }
    return true;
}
module.exports = {
    shouldUseTaobao,
    getRegistry
};
