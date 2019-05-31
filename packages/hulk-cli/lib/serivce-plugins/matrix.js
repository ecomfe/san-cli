/**
 * @file matrix-loader plugin
 * @author jinzhan <jinzhan@baidu.com>
 */
/* eslint-disable no-unused-vars,fecs-no-require */
const {success, error, info} = require('@baidu/hulk-utils/logger');
/* eslint-enable no-unused-vars,fecs-no-require */

const rulesMap = {
    js: 'js',
    html: 'html',
    css: 'css',
    less: 'less'
};

module.exports = {
    id: 'matrix',
    apply: (api, {enableMatrix, matrixEnv}) => {
        if (!enableMatrix) {
            return;
        }
        info('Matrix enabled!');

        const isBuild = Array.isArray(matrixEnv);

        // build情况下，默认编译用第一个
        const env = isBuild ? matrixEnv[0] : matrixEnv;

        if (!env || !env.trim) {
            error('Matrix env require!');
            return;
        }

        api.chainWebpack(config => {
            for (const fileSuffix in rulesMap) {
                config.module.rules
                    .get(fileSuffix)
                    .use('matrix')
                    .loader(require.resolve('@baidu/matrix-loader'))
                    .options({
                        env,
                        type: rulesMap[fileSuffix]
                    });
            }

            // 如果是build阶段，且存在多个matrixEnv的情况
            if (isBuild && matrixEnv.length > 1) {
                const MatrixPlugin = require('../../lib/webpack/MatrixPlugin');
                config.plugin('matrix-plugin').use(
                    new MatrixPlugin({
                        matrixEnv,
                        mainMatrixEnv: env
                    })
                );
            }
        });
    }
};
