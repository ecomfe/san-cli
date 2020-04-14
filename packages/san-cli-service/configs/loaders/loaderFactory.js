/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file loader 包裹函数，将参数规范好，loader 直接用
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = (loaderFn, defaultOptions = {}) => (options = {}, projectOptions = {}, api) =>
    loaderFn(Object.assign(defaultOptions, options), projectOptions, api);
