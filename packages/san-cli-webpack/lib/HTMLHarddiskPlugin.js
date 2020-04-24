/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file from html harddisk plugin ，修改兼容 v4 版本，增强健壮性
 */

let mkdirp = require('mkdirp');
let fs = require('fs');
let path = require('path');

function HtmlWebpackHarddiskPlugin(options) {
    options = options || {};
    this.outputPath = options.outputPath;
}

HtmlWebpackHarddiskPlugin.prototype.apply = function (compiler) {
    let self = this;

    if (compiler.hooks) {
        // webpack 4 support
        compiler.hooks.compilation.tap('HtmlWebpackHarddisk', function (compilation) {
            if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
                compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('HtmlWebpackHarddisk', function (
                    htmlPluginData,
                    callback
                ) {
                    self.writeAssetToDisk(
                        compilation,
                        htmlPluginData.plugin.options,
                        htmlPluginData.outputName,
                        callback
                    );
                });
            }
            else {
                // HtmlWebPackPlugin 4.x
                let HtmlWebpackPlugin = require('html-webpack-plugin');
                // 这里修改了
                if (HtmlWebpackPlugin.getHooks) {
                    let hooks = HtmlWebpackPlugin.getHooks(compilation);

                    hooks.afterEmit.tapAsync('HtmlWebpackHarddisk', function (htmlPluginData, callback) {
                        self.writeAssetToDisk(
                            compilation,
                            htmlPluginData.plugin.options,
                            htmlPluginData.outputName,
                            callback
                        );
                    });
                }
            }
        });
    }
    else {
        // webpack 3 support
        compiler.plugin('compilation', function (compilation) {
            compilation.plugin('html-webpack-plugin-after-emit', function (htmlPluginData, callback) {
                self.writeAssetToDisk(compilation, htmlPluginData.plugin.options, htmlPluginData.outputName, callback);
            });
        });
    }
};

/**
 * Writes an asset to disk
 */
HtmlWebpackHarddiskPlugin.prototype.writeAssetToDisk = function (
    compilation,
    htmlWebpackPluginOptions,
    webpackHtmlFilename,
    callback
) {
    // Skip if the plugin configuration didn't set `alwaysWriteToDisk` to true
    if (!htmlWebpackPluginOptions.alwaysWriteToDisk) {
        return callback(null);
    }
    // Prepare the folder
    let fullPath = path.resolve(this.outputPath || compilation.compiler.outputPath, webpackHtmlFilename);
    let directory = path.dirname(fullPath);
    mkdirp(directory, function (err) {
        if (err) {
            return callback(err);
        }
        // Write to disk
        fs.writeFile(fullPath, compilation.assets[webpackHtmlFilename].source(), function (err) {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
};

module.exports = HtmlWebpackHarddiskPlugin;
