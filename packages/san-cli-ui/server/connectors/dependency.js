/**
 * @file 安装依赖
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/dependencies.js
 */

const cwd = require('./cwd');
const folders = require('./folders');
const {resolveModule, resolveModuleRoot} = require('../utils/module');
const {getMetadata} = require('../utils/getVersion');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const execa = require('execa');
const semver = require('semver');
const {
    isPlugin
} = require('san-cli-utils/plugin');
const filePath = cwd.get();
let dependencies;
const PACKAGE_INSTLL_CONFIG = {
    npm: {
        install: ['install', '--loglevel', 'error'],
        add: ['install', '--loglevel', 'error'],
        upgrade: ['update', '--loglevel', 'error'],
        remove: ['uninstall', '--loglevel', 'error']
    },
    yarn: {
        install: [],
        add: ['add'],
        upgrade: ['upgrade'],
        remove: ['remove']
    }
};
const registries = {
    npm: 'https://registry.npmjs.org',
    yarn: 'https://registry.yarnpkg.com',
    taobao: 'https://registry.npm.taobao.org',
    pnpm: 'https://registry.npmjs.org'
};

function shouldUseTaobao() {
    // console.log('dd', fs.existsSync(path.join(cwd.get(), '.npmrc')));
}

function installTool() {
    return 'npm';
}

async function getRegistry() {
    const args = minimist(process.argv, {
        alias: {
            r: 'registry'
        }
    });
    let registry = args.registry;
    let tool = installTool();

    if (await shouldUseTaobao(tool)) {
        registry = registries.taobao;
    } else {
        try {
            registry = (await execa(tool, ['config', 'get', 'registry'])).stdout;
        } catch (e) {
            registry = (await execa(tool, ['config', 'get', 'npmRegistryServer'])).stdout;
        }
    }
    return registry;
}

function runCommand(type, args) {
    // 获取npm的安装源
    getRegistry();
    let tool = installTool();

    // npm安装依赖
    execa(tool, [
        ...PACKAGE_INSTLL_CONFIG[tool][type],
        ...(args || [])
    ], {
        filePath,
        stdio: ['inherit', 'inherit', 'inherit']
    });
}

function getPath(id) {
    // 检测每个模快的是否有package.json
    const getfilePath = resolveModule(path.join(id, 'package.json'), filePath);
    if (!getfilePath) {
        return;
    }
    // 检测node_modules是否安装该模块
    return resolveModuleRoot(getfilePath, id);
}

function isInstalled(id) {
    const resolvedPath = getPath(id);
    return resolvedPath && fs.existsSync(resolvedPath);
}

function readPackage(id) {
    try {
        let idPath = getPath(id);
        return idPath && folders.readPackage(idPath);
    } catch (e) {
        console.log(e);
    }
    return {};
}

function getLink(id) {
    const pkg = readPackage(id);
    return pkg && pkg.homepage
        || (pkg && pkg.repository && pkg.repository.url)
        || `https://www.npmjs.com/package/${id.replace('/', '%2F')}`;
}

function findDependencies(deps, type) {
    return Object.keys(deps).filter(
        id => !isPlugin(id)
    ).map(
        id => ({
            id,
            versionRange: deps[id],
            installed: isInstalled(id),
            website: getLink(id),
            type,
            baseFir: filePath
        })
    );
}

function list() {
    const pkg = folders.readPackage(filePath);
    dependencies = [];
    dependencies = dependencies.concat(
        findDependencies(pkg.devDependencies || {}, 'devDependencies')
    );
    dependencies = dependencies.concat(
        findDependencies(pkg.dependencies || {}, 'dependencies')
    );
    return dependencies;
}

function findOne(id) {
    list();
    return dependencies.find(
        p => p.id === id
    );
}

async function install(args) {
    let {id, type} = args;
    // 工具太多选 npm - yarn- pnpm - 先走通功能
    let dev = type ? ['-D'] : [];
    // npm安装依赖
    runCommand('add', [id, ...(dev || [])]);
    return findOne(id);
}

function unInstall(args) {
    let {id, type} = args;
    let dev = type ? ['-D'] : [];
    // 卸载npm安装依赖
    runCommand('remove', [id, ...(dev || [])]);
    return findOne(id);
}

async function getVersion({id}) {
    let current;

    const registry = await getRegistry();
    const pkg = readPackage(id);
    current = pkg.version;

    let latest = '';
    let wanted = '';
    let versionRange = '';
    let tool = installTool();

    const metadata = await getMetadata({id, tool, registry, filePath});
    if (metadata) {
        latest = metadata['dist-tags'].latest;

        const versions = Array.isArray(metadata.versions) ? metadata.versions : Object.keys(metadata.versions);
        versionRange = findOne(id).versionRange;
        wanted = semver.maxSatisfying(versions, versionRange);
    }

    if (!latest) {
        latest = current;
    };
    if (!wanted) {
        wanted = current;
    };

    return {
        current,
        latest,
        wanted,
        range: versionRange
    };
}

// 获取版本

module.exports = {
    install,
    list,
    getVersion,
    unInstall
};