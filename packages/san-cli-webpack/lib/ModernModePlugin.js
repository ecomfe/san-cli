/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file modern mode 插件，参考 Vue-cli 实现，增加 hwp 4.x 支持
 * inspired by https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/webpack/ModernModePlugin.js
 */
const fs = require('fs-extra');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
/* eslint-disable max-len,quotes */
const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`;
/* eslint-enable max-len,quotes */
class ModernModePlugin {
    constructor({targetDir, isModernBuild}) {
        this.targetDir = targetDir;
        this.isModernBuild = isModernBuild;
    }
    apply(compiler) {
        if (!this.isModernBuild) {
            this.applyLegacy(compiler);
        } else {
            this.applyModern(compiler);
        }
    }
    applyLegacy(compiler) {
        const ID = 'san-cli-legacy-bundle';
        compiler.hooks.compilation.tap(ID, compilation => {
            compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, async (data, cb) => {
                // get stats, write to disk
                await fs.ensureDir(this.targetDir);
                const htmlName = path.basename(data.plugin.options.filename);
                // Watch out for output files in sub directories
                const htmlPath = path.dirname(data.plugin.options.filename);
                const tempFilename = path.join(this.targetDir, htmlPath, `legacy-assets-${htmlName}.json`);
                await fs.mkdirp(path.dirname(tempFilename));
                await fs.writeFile(tempFilename, JSON.stringify(data.body));
                cb();
            });
        });
    }
    applyModern(compiler) {
        const ID = 'san-cli-modern-bundle';
        compiler.hooks.compilation.tap(ID, compilation => {
            const alterAssetTags = this.alterAssetTags.bind(this);
            const afterHTMLProcessing = this.afterHTMLProcessing.bind(this);

            if (HtmlWebpackPlugin.getHooks) {
                // 我们支持v4
                HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(ID, alterAssetTags);
                HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(ID, alterAssetTags);
            } else {
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, alterAssetTags);
                compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, afterHTMLProcessing);
            }
        });
    }
    async alterAssetTags(data, cb) {
        // use <script type="module"> for modern assets
        data.body.forEach(tag => {
            if (tag.tagName === 'script' && tag.attributes) {
                tag.attributes.type = 'module';
            }
        });
        // use <link rel="modulepreload"> instead of <link rel="preload">
        // for modern assets
        data.head.forEach(tag => {
            if (tag.tagName === 'link' && tag.attributes.rel === 'preload' && tag.attributes.as === 'script') {
                tag.attributes.rel = 'modulepreload';
            }
        });
        // inject links for legacy assets as <script nomodule>
        const htmlName = path.basename(data.plugin.options.filename);
        // Watch out for output files in sub directories
        const htmlPath = path.dirname(data.plugin.options.filename);
        const tempFilename = path.join(this.targetDir, htmlPath, `legacy-assets-${htmlName}.json`);
        const legacyAssets = JSON.parse(await fs.readFile(tempFilename, 'utf-8')).filter(
            a => a.tagName === 'script' && a.attributes
        );
        legacyAssets.forEach(a => {
            a.attributes.nomodule = '';
        });
        // inject inline Safari 10 nomodule fix
        data.body.push({
            tagName: 'script',
            closeTag: true,
            innerHTML: safariFix
        });
        data.body.push(...legacyAssets);
        await fs.remove(tempFilename);
        cb();
    }
    afterHTMLProcessing(data) {
        data.html = data.html.replace(/\snomodule="">/g, ' nomodule>');
        return data;
    }
}
ModernModePlugin.safariFix = safariFix;
module.exports = ModernModePlugin;
