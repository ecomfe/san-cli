/**
 * @file loader.spec.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: path.resolve(__dirname, '../../index.js'),
                        options: {
                            component: {
                                hotreload: true,
                                patterns: [
                                    'auto'
                                    // {
                                    //     component: /\.san\.js$/
                                    // }
                                    // // {
                                    //     component: /\.san\?type=js/,
                                    //     template: /\.san\?type=template/
                                    // },
                                    // {
                                    //     component: 'auto',
                                    //     template: 'auto'
                                    // }
                                ]
                            },
                            store: {
                                hotreload: true,
                                patterns: [
                                    'auto'
                                    // {
                                    //     store: /\.store\.js$/,
                                    //     action: /\.action\.js$/
                                    // }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        overlay: true,
        hot: true,
        inline: true
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, './index.html')
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
};

