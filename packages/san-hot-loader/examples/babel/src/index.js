/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file index.js
 * @author clark-t
 */

// 引入 san 但完全不使用其 api 定义组件时，不会被识别为 san 组件

var san = require('san');

var App = require('./components/app');
App = App.__esModule ? App.default : App;

var app = new App();
app.attach(document.body);

console.log('Index Loaded');

