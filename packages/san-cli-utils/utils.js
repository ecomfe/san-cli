/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 工具函数
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.flatten = arr => (arr || []).reduce((prev, curr) => prev.concat(curr), []);
