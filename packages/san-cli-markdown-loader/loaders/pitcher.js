/**
 * @file 通过 loader pitch 方法获取单个内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const loaderUtils = require('loader-utils');
const qs = require('querystring');
const selectLoader = require.resolve('./select');

module.exports = code => code;
const isPitcher = l => l.path !== __filename;
const isNullLoader = l => /(\/|\\|@)null-loader/.test(l.path);
const isSanLoader = l => /(\/|\\|@)(san-loader|san-webpack-loader|(\w+)-san-loader)/.test(l.path);
const isBabelLoader = l => /(\/|\\|@)babel-loader/.test(l.path);

/* eslint-disable space-before-function-paren */
module.exports.pitch = function(remainingRequest) {
    const options = loaderUtils.getOptions(this);
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
    const pickerSanbox = (loaders, idx, genRequest, options) => {
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
    switch (query.type) {
        case 'sanbox':
            return pickerSanbox(loaders, query.index, genRequest, options);
        case 'code-component':
            return pickerSanbox(loaders, query.index, genRequest, options);
    }

    return '';
};
