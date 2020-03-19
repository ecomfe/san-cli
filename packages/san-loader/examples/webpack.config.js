/**
 * @file webpack.config.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const SanLoaderPlugin = require('../lib/plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
                test: /\.san$/,
                use: [
                    {
                        loader: path.resolve(__dirname, '../index.js')
                    }
                ]
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true
                        }
                    },
                    // {
                    //     loader: 'style-loader'
                    // },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true
                        }
                    },
                    // {
                    //     loader: 'style-loader'
                    // },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            esModule: false
                        }
                    }
                ]
            },
            {
                test: /\.(jpe?g|png)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 6000,
                            name: 'img/[name]-[hash].[ext]',
                            esModule: false
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.san', '.json']
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
        new SanLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ]
};

