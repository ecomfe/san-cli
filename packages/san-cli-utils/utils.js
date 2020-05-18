/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 工具函数
 * @author ksky521
 */
const path = require('path');
const fs = require('fs');
exports.flatten = arr => (arr || []).reduce((prev, curr) => prev.concat(curr), []);
exports.isDirectoryAndNotCwd = p => {
    if (p && typeof p === 'string') {
        const abs = path.resolve(p);
        const cwd = process.cwd();
        if (cwd !== abs) {
            const stat = fs.statSync(abs);
            if (stat.isDirectory()) {
                return abs;
            }
        }
    }
    return false;
};

/**
 * 简单的模板字符串替换，类似es6 template String，处理一些占位问题
 *
 * @param {string} tmpl 字符串模板
 * @param {Object} data 模板需要的数据
 * @return {string} 返回处理后的字符串
 *
 * tmpl('My name is {{name}}', {name: 'Jinz'}); // 'My name is Jinz'
 */
exports.tmpl = (tmpl, data) => tmpl.replace(/\{\{(\w+)\}\}/g, (word, key) => data[key]);