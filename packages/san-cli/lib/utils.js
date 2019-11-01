/**
 * @file 工具函数全部整理到 utils.js
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fse = require('fs-extra');
const url = require('url');
const path = require('path');
const {execSync} = require('child_process');
const address = require('address');

const {chalk} = require('./ttyLogger');

exports.isLocalPath = templatePath => {
    return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
};
exports.resolveLocal = function resolveLocal(...args) {
    return path.join(__dirname, '../', ...args);
};
exports.getAssetPath = (assetsDir, filePath) => (assetsDir ? path.posix.join(assetsDir, filePath) : filePath);

exports.getTemplatePath = templatePath => {
    const cwd = process.cwd();
    return path.isAbsolute(templatePath) ? templatePath : path.normalize(path.join(cwd, templatePath));
};
exports.evaluate = (exp, data) => {
    /* eslint-disable no-new-func */
    const fn = new Function('data', 'with (data) { return ' + exp + '}');
    try {
        return fn(data);
    } catch (e) {
        console.error(chalk.red('Error when evaluating filter condition: ' + exp));
    }
};

let isYarn;
exports.hasYarn = () => {
    if (isYarn != null) {
        return isYarn;
    }
    try {
        execSync('yarnpkg --version', {stdio: 'ignore'});
        return (isYarn = true);
    } catch (e) {
        return (isYarn = false);
    }
};

exports.getGitUser = () => {
    let name;
    let email;

    try {
        name = execSync('git config --get user.name');
        email = execSync('git config --get user.email');
        email = email.toString().trim();
        name = JSON.stringify(name.toString().trim()).slice(1, -1);
        const t = email && ' <' + email.toString().trim() + '>';
        return {
            name,
            email,
            author: (name || '') + (t || ''),
            isBaidu: /@baidu\.com/.test(email)
        };
    } catch (e) {
        return {};
    }
};

exports.findExisting = (context, files) => {
    for (const file of files) {
        if (fse.existsSync(path.join(context, file))) {
            return file;
        }
    }
};

exports.flatten = arr => arr.reduce((prev, curr) => prev.concat(curr), []);
exports.isJS = val => /\.js$/.test(val);
exports.isCSS = val => /\.css$/.test(val);

// ref @vue/cli-shared-utils prepareurls
exports.prepareUrls = (protocol, host, port, pathname = '/') => {
    const formatUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port,
            pathname
        });
    const prettyPrintUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port: chalk.bold(port),
            pathname
        });

    const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
    let prettyHost;
    let lanUrlForConfig;
    let lanUrlForTerminal = chalk.gray('unavailable');
    if (isUnspecifiedHost) {
        prettyHost = 'localhost';
        try {
            // This can only return an IPv4 address
            lanUrlForConfig = address.ip();
            if (lanUrlForConfig) {
                // Check if the address is a private ip
                // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
                if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
                    // Address is private, format it for later use
                    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
                } else {
                    // Address is not private, so we will discard it
                    lanUrlForConfig = undefined;
                }
            }
        } catch (_e) {
            // ignored
        }
    } else {
        prettyHost = host;
    }
    const localUrlForTerminal = prettyPrintUrl(prettyHost);
    const localUrlForBrowser = formatUrl(prettyHost);
    return {
        lanUrlForConfig,
        lanUrlForTerminal,
        localUrlForTerminal,
        localUrlForBrowser
    };
};

exports.addDevClientToEntry = (config, devClient) => {
    const {entry} = config; // eslint-disable-line
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        Object.keys(entry).forEach(key => {
            entry[key] = devClient.concat(entry[key]);
        });
    } else if (typeof entry === 'function') {
        config.entry = entry(devClient);
    } else {
        config.entry = devClient.concat(entry);
    }
};

exports.resolveEntry = entry => {
    let isFile = false;
    try {
        const stats = fse.statSync(entry);
        if (stats.isFile()) {
            const ext = path.extname(entry);
            if (ext === '.js' || ext === '.san') {
                isFile = true;
            } else {
                console.log(chalk.red('Valid entry file should be one of: *.js or *.san.'));
                process.exit(1);
            }
            isFile = true;
        }
    } catch (e) {
        console.log(chalk.red('Valid entry is not a file or directory.'));
        process.exit(1);
    }
    return {
        entry,
        isFile
    };
};

exports.getWebpackErrorInfoFromStats = (err, stats) => {
    if (!stats.stats) {
        return {
            err: err || (stats.compilation && stats.compilation.errors && stats.compilation.errors[0]),
            stats,
            rawStats: stats
        };
    }
    const [curStats] = stats.stats;
    return {
        err: err || (curStats.compilation && curStats.compilation.errors && curStats.compilation.errors[0]),
        stats: curStats,
        rawStats: stats
    };
};
