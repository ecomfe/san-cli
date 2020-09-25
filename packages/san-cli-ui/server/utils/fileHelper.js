/**
 * @file 操作文件相关的方法
 * @author jinzhan
 */

const path = require('path');
const fs = require('fs-extra');
const LRU = require('lru-cache');
const winattr = require('@akryum/winattr');
const {getDebugLogger, warn, error} = require('san-cli-utils/ttyLogger');
const {currentOS} = require('san-cli-utils/env');

const debug = getDebugLogger('ui:folders');

const pkgCache = new LRU({
    max: 500,
    maxAge: 1000 * 5
});

const isDirectory = file => {
    file = file.replace(/\\/g, path.sep);
    try {
        return fs.statSync(file).isDirectory();
    }
    catch (e) {
        debug(e.message);
    }
    return false;
};

/**
 * 判断是否为隐藏文件
 *
 * @param {string} file 文件路径
*/
const isHidden = file => {
    const hiddenPrefix = '.';
    try {
        const prefixed = path.basename(file).charAt(0) === hiddenPrefix;
        const result = {
            unix: prefixed,
            windows: false
        };

        if (currentOS.isWindows) {
            const windowsFile = file.replace(/\\/g, '\\\\');
            result.windows = winattr.getSync(windowsFile).hidden;
        }

        return (!currentOS.isWindows && result.unix) || (currentOS.isWindows && result.windows);
    }
    catch (e) {
        debug('file:', file);
        error(e);
    }
};

/**
 * 获取文件夹列表
 *
 * @param {string} base base url
*/
const folderList = async base => {
    let dir = base;
    if (currentOS.isWindows) {
        if (base.match(/^([A-Z]{1}:)$/)) {
            dir = path.join(base, '\\');
        }
    }

    const files = await fs.readdir(dir, 'utf8');
    return files.map(
        file => {
            const folderPath = path.join(base, file);
            return {
                path: folderPath,
                name: file,
                hidden: isHidden(folderPath)
            };
        }
    ).filter(
        file => isDirectory(file.path)
    );
};

/**
 * 获取文件对应的目录
 *
 * @param {string} file 文件路径
 */
const generateFolder = file => {
    return {
        name: path.basename(file),
        path: file
    };
};

/**
 * 是否包含package.json
 *
 * @param {string} file 文件路径
 */
const isPackage = file => {
    try {
        return fs.existsSync(path.join(file, 'package.json'));
    }
    catch (e) {
        warn(e.message);
    }
    return false;
};

/**
 * 获取package.json信息
 *
 * @param {string} file 文件路径
 * @param {boolean} force 是否走缓存中读，force为true代表不走
 */
const readPackage = (file, force = false) => {
    if (!force) {
        const cachedValue = pkgCache.get(file);
        if (cachedValue) {
            return cachedValue;
        }
    }
    if (fs.existsSync(file)) {
        const pkgFile = path.join(file, 'package.json');
        if (fs.existsSync(pkgFile)) {
            const pkg = fs.readJsonSync(pkgFile);
            pkgCache.set(file, pkg);
            return pkg;
        }
    }
    return {};
};

const delInvalidatePackage = file => {
    pkgCache.del(file);
    return true;
};

const writePackage = ({file, data}, context) => {
    fs.outputJsonSync(path.join(file, 'package.json'), data, {
        spaces: 2
    });
    delInvalidatePackage(file, context);
    return true;
};

const isSanProject = (file, context) => {
    if (!isPackage(file)) {
        return false;
    }
    try {
        const pkg = readPackage(file, context);
        const devDependencies = Object.keys(pkg.devDependencies || {});
        return devDependencies.includes('san-cli') || devDependencies.includes('@baidu/san-cli');
    }
    catch (e) {
        debug(e);
    }
    return false;
};

/**
 * 格式化目录路径
 *
 * @param {string} dir 目录
 * @return {string}  去掉结尾的(反)斜杠后的路径
*/
const normalizeDir = dir => {
    // keep / or \
    if (dir.length === 1) {
        return dir;
    }

    const lastChar = dir.charAt(dir.length - 1);
    if (lastChar === path.sep) {
        dir = dir.substr(0, dir.length - 1);
    }

    return dir;
};

module.exports = {
    normalizeDir,
    isDirectory,
    folderList,
    isPackage,
    readPackage,
    writePackage,
    isSanProject,
    generateFolder
};
