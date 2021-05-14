/**
 * @file 加载模块
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/util/resolve-path.js
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-shared-utils/lib/module.js
 * modify by zttonly
 */

const path = require('path');
const Module = require('module');
const semver = require('semver');

const clearRequireCache = (id, map = new Map()) => {
    const module = require.cache[id];
    if (module) {
        map.set(id, true);
        // Clear children modules
        module.children.forEach(child => {
            if (!map.get(child.id)) {
                clearRequireCache(child.id, map);
            }
        });
        delete require.cache[id];
    }
};

exports.reloadModule = path => {
    // clear cache brefore require
    clearRequireCache(path);
    return require(path);
};

const resolveFallback = (request, options) => {
    const isMain = false;
    const fakeParent = new Module('', null);

    const paths = [];

    for (let i = 0; i < options.paths.length; i++) {
        const p = options.paths[i];
        fakeParent.paths = Module._nodeModulePaths(p);
        const lookupPaths = Module._resolveLookupPaths(request, fakeParent, true);

        if (!paths.includes(p)) {
            paths.push(p);
        }

        for (let j = 0; j < lookupPaths.length; j++) {
            if (!paths.includes(lookupPaths[j])) {
                paths.push(lookupPaths[j]);
            }
        }
    }

    const filename = Module._findPath(request, paths, isMain);
    if (!filename) {
        const err = new Error(`Cannot find module '${request}'`);
        err.code = 'MODULE_NOT_FOUND';
        throw err;
    }
    return filename;
};

const resolve = semver.satisfies(process.version, '>=10.0.0')
    ? require.resolve
    : resolveFallback;

const createRequire = Module.createRequire || Module.createRequireFromPath || function (filename) {
    const mod = new Module(filename, null);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));

    mod._compile('module.exports = require;', filename);

    return mod.exports;
};
exports.resolveModule = function (request, context) {
    let resolvedPath;
    try {
        try {
            resolvedPath = createRequire(path.resolve(context, 'package.json')).resolve(request);
        } catch (e) {
            resolvedPath = resolve(request, {paths: [context]});
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }
    return resolvedPath;
};

/**
 * 返回node_modules下安装的某模块根路径
 *
 * @param {string} filePath 文件路径
 * @param {string} id 文件名
 * @return {string}
*/
exports.resolveModuleRoot = (filePath, id = null) => {
    const index = filePath.lastIndexOf(path.sep + 'index.js');
    if (index !== -1) {
        filePath = filePath.substr(0, index);
    }
    if (id) {
        id = id.replace(/\//g, path.sep);
        let search = `node_modules/${id}`;
        let index = filePath.lastIndexOf(search);
        if (index === -1) {
            search = id;
            index = filePath.lastIndexOf(search);
        }
        if (index === -1) {
            index = id.lastIndexOf('/');
            if (index !== -1) {
                search = id.substr(index + 1);
                index = filePath.lastIndexOf(search);
            }
        }

        if (index !== -1) {
            filePath = filePath.substr(0, index + search.length);
        }
    }
    return filePath;
};
