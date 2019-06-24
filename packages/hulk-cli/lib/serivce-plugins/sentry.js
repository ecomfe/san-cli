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
const sentryInsert = require('../webpack/SentryInsertPlugin');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

// 基础功能 - 文件写入方法封装
let writeFileSync = (path, contents, cb) => {
    try {
        if (fs.existsSync(path)) {
            fs.writeFileSync(path, contents);
        } else {
            mkdirp(getDirName(path), function(err) {
                if (err) {
                    return cb(err);
                }
                fs.writeFileSync(path, contents);
            });
        }

    } catch (e) {
        error('★[sentry] Create .sentryclirc file fail!!', e);
    }

};


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
let getSentryInfo = (config = {}) => {
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
        config.sSDKurl = 'https://s.bdstatic.com/monitor/sentry.js';
    }



    return config || {};
};

let getFiles = (sentryInfo = {}) => {

    // 参数准备 - 上传生成两个文件，一个插件必备，一个上传参数
    const sentryConfigFileBase = sentryInfo.sOutputDir + '/sourcemaps/';

    const sentryConfFilePlugin = sentryConfigFileBase + '.sentryclirc';
    const sentryConfFileUpParam = sentryConfigFileBase + '.sentryupparam';

    let SentryConfig = `[defaults]
                        url = ${sentryInfo.sHost}
                        org = ${sentryInfo.sOrg}
                        project = ${sentryInfo.sName}
                        [auth]
                        token = ${sentryInfo.sToken}`;

    let SentryUploadParamInfo = `${sentryInfo.sName}@${sentryInfo.sBranchName}|${sentryInfo.sUrlPrefix}`;
    return [{
            name: sentryConfFilePlugin,
            value: SentryConfig
        },
        {
            name: sentryConfFileUpParam,
            value: SentryUploadParamInfo
        }
    ];
};

module.exports = {
    id: 'sentry',
    apply: (api, options) => {
        // setp1: 获取hulk.conf里的参数配置
        let sentryInfo = getSentryInfo(options.sentryOptions || {});

        // step2: 接受hulkconf里的output， 默认output
        let sOutputDir = options.outputDir || './output';
        sentryInfo.sOutputDir = sOutputDir.indexOf('./') !== 0 ? './' + sOutputDir : sOutputDir;

        // [参数准备] - 植入JSSDK所需参数
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

        let sentryConf = getFiles(sentryInfo);

        if (sBranchName) {
            // step3: 创建文件 outputDir -> sourcemaps -> .sentryclirc
            setTimeout(() => {
                sentryConf.forEach((ele) => {
                    writeFileSync(ele.name, ele.value);
                });
            }, 2000);


            // step4: 插件将JSSDK写入页面
            api.chainWebpack(webpackConfig => {
                webpackConfig
                    .plugin('sentryInsert')
                    .use(sentryInsert, sentryInsertConfig);
            });

        }

    }
};
