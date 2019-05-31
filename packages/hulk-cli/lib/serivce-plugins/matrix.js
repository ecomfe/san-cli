/**
 * @file matrix-loader plugin
 * @author jinzhan <jinzhan@baidu.com>
 */
const {success, error, info} = require('@baidu/hulk-utils/logger');

const rulesMap = {
    js: 'js',
    html: 'html',
    css: 'css',
    less: 'less'
};

module.exports = {
    id: 'matrix',
    apply: (api, {_args, enableMatrix, matrixEnv}) => {
        const isBuild = _args.command === 'build';

        if (isBuild && !enableMatrix) {
            info('Matrix disabled!');
            return;
        }

        // build情况下，默认编译用第一个
        const env = isBuild ? matrixEnv[0] : _args.matrixEnv;

        if (!env || !env.trim) {
            isBuild && error('Matrix env require!');
            return;
        }

        api.chainWebpack(config => {
            for (const fileSuffix in rulesMap) {
                config.module
                    .rules
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
                config.plugin('matrix-plugin').use(new MatrixPlugin({
                    matrixEnv,
                    mainMatrixEnv: env
                }));
            }
        });
    }
};