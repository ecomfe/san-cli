/**
 * @file 通过 loader pitch 方法获取单个内容 返回的都是 san file Component，会被 san-loader 修改
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const loaderUtils = require('loader-utils');
const qs = require('querystring');
const selectLoader = require.resolve('./select');
const {isSanLoader, isNullLoader, isBabelLoader} = require('../const');

module.exports = code => code;
const isPitcher = l => l.path !== __filename;

/* eslint-disable space-before-function-paren */
module.exports.pitch = function(remainingRequest) {
    const rawQuery = this.resourceQuery.slice(1);
    const query = qs.parse(rawQuery);

    let loaders = this.loaders;

    loaders = loaders.filter(isPitcher);
    if (loaders.some(isNullLoader)) {
        return;
    }
    const genRequest = loaders => {
        /* eslint-disable no-undef */
        const seen = new Map();
        /* eslint-enable no-undef */
        const loaderStrings = [];

        loaders.forEach(loader => {
            const identifier = typeof loader === 'string' ? loader : loader.path + loader.query;
            const request = typeof loader === 'string' ? loader : loader.request;
            if (!seen.has(identifier)) {
                seen.set(identifier, true);
                loaderStrings.push(request);
            }
        });

        /* eslint-disable max-len */
        return loaderUtils.stringifyRequest(
            this,
            '-!' + [...loaderStrings, this.resourcePath + this.resourceQuery].join('!')
        );
    };
    const pickerSanbox = (loaders, idx, genRequest) => {
        loaders = loaders.filter(l => isBabelLoader(l) || isSanLoader(l));
        const loaderIndex = loaders.findIndex(isSanLoader);
        if (loaderIndex > -1) {
            const afterLoaders = loaders.slice(0, loaderIndex + 1);
            const beforeLoaders = loaders.slice(loaderIndex + 1);
            query.index = idx;

            const selectLoaderQuery = `?${qs.stringify(query)}`;
            const request = genRequest([...afterLoaders, selectLoader + selectLoaderQuery, ...beforeLoaders]);
            return `import mod from ${request}; export default mod; export * from ${request}`;
        }
    };
    // 这里直接转发下
    switch (query.type) {
        case 'sanbox':
            // 第一次
            return pickerSanbox(loaders, query.index, genRequest);
        case 'san-component':
        case 'js-component':
            // 第二次 san component
            return pickerSanbox(loaders, query.index, genRequest);
        case 'codebox':
            // 第一次
            return pickerSanbox(loaders, query.index, genRequest);
        default:
            return pickerSanbox(loaders, query.index, genRequest);
    }
};
