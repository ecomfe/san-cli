/**
 * @file less-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// const {join} = require('path'); // eslint-disable-line
module.exports = ({context, sourceMap, loaderOptions: {less = {}}}) => {
    return {
        name: 'less-loader',

        loader: require.resolve('less-loader'),
        options: Object.assign(
            {
                sourceMap,
                javascriptEnabled: true,
                // paths: [join(context, 'src'), join(context, 'src', 'assets'), join(context, 'node_modules')],
                compress: false
            },
            less
        )
    };
};
