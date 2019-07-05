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
const SentryWebpack = require('@baidu/sentry-webpack-configext');
const sentryInsert = require('@baidu/sentry-webpack-configext/webpack/SentryInsertPlugin');




module.exports = {
    id: 'sentry',
    apply: (api, options) => {

        // sentryOutOption 统一接受参数
        // 接受hulk.conf里的参数，sentryOpitons 和 output地址 ，
        let sentryOutOption = options.sentryOptions || {};
        let sentryOutDir = options.outputDir || './output';
        sentryOutOption.sOutputDir = sentryOutDir.indexOf('./') !== 0 ? './' + sentryOutDir : sentryOutDir;


        // 初始化插件
        let sentryWebpack = new SentryWebpack(sentryOutOption || {});

        let sentryWebpackTemp = sentryWebpack.getHulk2Config();
        let sentryInfo = sentryWebpackTemp.sentryInfo;
        let sentryInsertConfig = sentryWebpackTemp.sentryInsertConfig;

        if (sentryInfo.sBranchName) {

            // 插件将JSSDK写入页面
            api.chainWebpack(webpackConfig => {
                webpackConfig
                    .plugin('sentryInsert')
                    .use(sentryInsert, sentryInsertConfig);
            });

        }

    }
};
