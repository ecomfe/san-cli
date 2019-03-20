/**
 * @file less-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {join} = require('path'); // eslint-disable-line
module.exports = ({context, sourceMap}) => {
    return {
        name: 'less-loader',

        loader: require.resolve('less-loader'),
        options: {
            sourceMap,
            javascriptEnabled: true,
            paths: [join(context, 'src'), join(context, 'src', 'assets/styles'), join(context, 'node_modules')],
            compress: false
        }
    };
};
