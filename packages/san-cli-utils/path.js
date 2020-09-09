/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 跟路径相关函数
 * @author ksky521
 */

const url = require('url');
const path = require('path');
const hash = require('hash-sum');
const importLazy = require('import-lazy')(require);
const address = importLazy('address');
const home = require('user-home');

const fse = importLazy('fs-extra');
const {chalk} = require('./ttyLogger');

exports.isLocalPath = templatePath => {
    return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
};

exports.getAssetPath = (assetsDir, filePath) => (assetsDir ? path.posix.join(assetsDir, filePath) : filePath);

exports.getTemplatePath = templatePath => {
    const cwd = process.cwd();
    return path.isAbsolute(templatePath) ? templatePath : path.normalize(path.join(cwd, templatePath));
};

exports.findExisting = (files, context) => {
    if (typeof files === 'string') {
        files = [files];
    }
    for (const file of files) {
        const filePath = context && !path.isAbsolute(file) ? path.join(context, file) : file;
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
    return path.join(
        getUserHomeFolder(),
        'templates',
        // 增加一层hash的目录，避免同名文件被覆盖
        hash(template),
        template.replace(/[/:#]/g, '-').substring(template.lastIndexOf('/') + 1)
    );
};
function getUserHomeFolder() {
    return path.join(home, '.san');
}
exports.getUserHomeFolder = getUserHomeFolder;
function getGlobalSanRcFilePath() {
    return path.join(home, '.san', 'sanrc.json');
}
exports.getGlobalSanRcFilePath = getGlobalSanRcFilePath;

