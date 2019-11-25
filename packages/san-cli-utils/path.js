/**
 * @file 跟路径相关函数
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const url = require('url');
const path = require('path');
const importLazy = require('import-lazy')(require);
const address = importLazy('address');

const fse = importLazy('fs-extra');
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

exports.findExisting = (files, context) => {
    for (const file of files) {
        const filePath = context ? path.join(context, file) : file;
        if (fse.existsSync(filePath)) {
            return filePath;
        }
    }
};

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
                // prettier-ignore
                if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
                    // Address is private, format it for later use
                    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
                } else {
                    // Address is not private, so we will discard it
                    lanUrlForConfig = undefined;
                }
            }
        } catch (e) {
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

// 获取本地模板路径
exports.getLocalTplPath = template => {
    const home = require('user-home');
    return path.join(home, '.san-templates', template.replace(/[/:#]/g, '-').substring(template.lastIndexOf('/') + 1));
};
