/**
 * @file sentry upload service plguins
 * @author yanwenkai <yanwenkai@baidu.com>
 *
 * ▽ 上传sentry需要的参数
 * sName       - 默认值：package.json中的name, 最好跟模块名保持一致baidu/hulk/${sname}
 * sHost       - 默认值：monitor.bdsatic.com , 上传sentry的域名
 * sOrg        - 默认值：sentry ，上传sentry对应的分组
 * sUrlPrefix  - 默认值：~ ， 上传sentry后，线上URL去除域名后地址，sourcemap映射
 * sToken      - 默认值：官方token，上传sentry，需要的key，可能会变
 * sSDKurl     - 默认值：s.bdstatic.com域名地址
 *
 * ▽ JS-SDK依据sName，白名单下发JSSDK需要的DSN
 * [Icode地址](http://icode.baidu.com/repos/baidu/hulk/sentry-jssdk/blob/master)
 */
const fs = require('fs');
const childProcess = require('child_process');
const error = require('@baidu/hulk-utils/logger').error;
const cosmiconfig = require('cosmiconfig');
const SentryUpload = require('@sentry/webpack-plugin');
const sentryInsert = require('../webpack/sentryInsertPlugin');

// 基础功能 - 获取分支名称
let sBranchName = (() => {
    let branch;
    try {
        branch = childProcess.execSync('git rev-parse --abbrev-ref HEAD');
        branch = branch.toString().replace(/\s+/, '').toLowerCase();
    } catch (e) {
        branch = {};
        error('★ [sentry] Not a GIT project');
    }
    if (branch === 'master' || branch === 'head') {
        error('★ [sentry] Not support Master or HEAD Branch ');
        branch = '';
    }
    return branch;
})();

// 基础功能 - 获取APP信息
let sentryInfo = (() => {
    let appInfo = cosmiconfig('sentryOptions', {
        searchPlaces: ['hulk.config.js', '.hulkrc.js']
    }).searchSync();

    // 参数校验
    let config = appInfo.config.sentryOptions || {};

    // 默认去找package.json的name
    if (!config.sName) {
        config.sName = cosmiconfig('name').searchSync().config;
    }

    // 默认monitor.bdstatic
    if (!config.sHost) {
        config.sHost = 'https://monitor.bdstatic.com';
    }

    // 默认sentry
    if (!config.sOrg) {
        config.sOrg = 'sentry';
    }

    // 默认sUrlPrefix 是~
    if (!config.sUrlPrefix) {
        config.sUrlPrefix = '~';
    }

    // 默认sToken
    if (!config.sToken) {
        config.sToken = 'ba80a42f769441139ca94e29abe34d4cdd545b6dcf5d48f2ae9f3faf36d2b341';
    }

    // 默认sSDK的链接
    if (!config.sSDKurl) {
        config.sSDKurl = 'https://gss0.bdstatic.com/5bd1bjqh_Q23odCf/n/monitor/sentry.js';
    }



    return config || {};
})();



// 参数准备 - 植入脚本
let sentryInsertConfig = [{
    scripts: [{
            tagName: 'script',
            voidTag: false,
            attributes: {
                crossorigin: 'anonymous',
                src: sentryInfo.sSDKurl
            }
        },
        {
            tagName: 'script',
            voidTag: false,
            attributes: {
                anonymous: 'cors'
            },
            innerHTML: `try{window.SENTRY.init({'release': '${sentryInfo.sName}@${sBranchName}'})}catch(e){}`
        }
    ]
}];


// 参数准备 - 上传参数sentryConfig
const fileName = '.sentryclirc';
let SentryConfig = `[defaults]
url = ${sentryInfo.sHost}
org = ${sentryInfo.sOrg}
project = ${sentryInfo.sName}
[auth]
token = ${sentryInfo.sToken}`;

module.exports = {
    id: 'sentry',
    apply: (api, options) => {
        // step1: 接受外部参数

        let sOutputDir = options.outputDir;
        // step2: 创建一个.sentryclirc文件

        if (sBranchName) {
            fs.writeFileSync(fileName, SentryConfig);
            // step3: 分别调用两个插件
            api.chainWebpack(webpackConfig => {
                webpackConfig
                    .plugin('sentryInsert')
                    .use(sentryInsert, sentryInsertConfig);
                webpackConfig
                    .plugin('sentryUpload')
                    .use(SentryUpload, [{
                        release: sentryInfo.sName + '@' + sBranchName,
                        include: sOutputDir,
                        configFile: 'sentry.properties',
                        urlPrefix: sentryInfo.sUrlPrefix
                    }]);
            });

        }

    }
};
