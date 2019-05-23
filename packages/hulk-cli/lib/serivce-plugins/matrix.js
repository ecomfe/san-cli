/**
 * @file matrix-loader plugin
 * @author jinzhan <jinzhan@baidu.com>
 */

const rulesMap = {
    js: 'js',
    html: 'html',
    css: 'css',
    less: 'less'
};

module.exports = {
    id: 'matrix',
    apply: (api, options) => {
        api.chainWebpack(config => {
            for (const fileSuffix in rulesMap) {
                config.module
                    .rules
                    .get(fileSuffix)
                    .use('matrix')
                    .loader(require.resolve('@baidu/matrix-loader'))
                    .options({
                        env: options.matrixEnv,
                        type: rulesMap[fileSuffix]
                    });
            }
        });
    }
};