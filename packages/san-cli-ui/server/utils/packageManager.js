const fs = require('fs');
const semver = require('semver');
const {execSync} = require('child_process');
const LRU = require('lru-cache');
const path = require('path');
const cache = {
    yarn: new LRU({
        max: 10,
        maxAge: 1000
    }),
    pnpm: new LRU({
        max: 10,
        maxAge: 1000
    }),
    npm: new LRU({
        max: 10,
        maxAge: 1000
    })
};
let isHasYarnEnv = null;
let isHasPnpmEnv = null;
let version = null;
// 判断文件是否存在
function isFileExist(type, cwd, file) {
    const yarnFile = path.join(cwd, 'yarn.lock');
    const result = fs.existsSync(yarnFile);
    cache[type].set(cwd, result);
    return result;
}

// 判断是否支持npm
function hasNpm(cwd) {
    let cacheNpm = cache.npm;

    if (cacheNpm.has(cwd)) {
        return cacheNpm.get(cwd);
    }

    let result = isFileExist('npm', cwd, 'package-lock.json');
    return result;
}

// 判断是否支持pnpm环境
function hasPnpmEnv() {
    if (isHasPnpmEnv !== null) {
        return isHasPnpmEnv;
    }

    if (version === null) {
        version = '0.0.0';
        try {
            version = execSync('pnpm --version', {
                stdio: ['pipe', 'pipe', 'ignore']
            }).toString();
        }
        catch (e) {
        }
    }

    isHasPnpmEnv = semver.gte(version, '3.0.0');
    return isHasPnpmEnv;
}

// 判断是否支持Pnpm
function hasPnpm(cwd) {
    let cachePnpm = cache.pnpm;
    if (cachePnpm.has(cwd) && hasPnpmEnv()) {
        return cachePnpm.get(cwd);
    }

    let result = isFileExist('pnpm', cwd, 'pnpm-lock.yaml');
    return result && hasPnpmEnv();
}

// 判断是否支持yarn
function hasYarnEnv() {
    if (isHasYarnEnv !== null) {
        return isHasYarnEnv;
    }
    try {
        execSync('yarn --version', {stdio: 'ignore'});
        return isHasYarnEnv = true;
    } catch (e) {
        return isHasYarnEnv = false;
    }
}

// 判断是否支持yarn环境
function hasYarn(cwd) {
    let cacheYarn = cache.yarn;
    if (cacheYarn.has(cwd) && hasYarnEnv()) {
        return cacheYarn.get(cwd);
    }
    let result = isFileExist('yarn', cwd, 'yarn.lock');
    return result && hasYarnEnv();
}

function packageManager(cwd) {
    let tool = '';
    if (hasYarn(cwd)) {
        tool = 'yarn';
    }
    else if (hasPnpm(cwd)) {
        tool = 'pnpm';
    }
    else if (hasNpm(cwd)) {
        tool = 'npm';
    }
    return !tool || hasYarnEnv() ? 'yarn' : hasPnpmEnv() ? 'pnpm' : 'npm';
}

module.exports = {
    hasYarn,
    hasYarnEnv,
    hasPnpm,
    hasPnpmEnv,
    hasNpm,
    packageManager
};
