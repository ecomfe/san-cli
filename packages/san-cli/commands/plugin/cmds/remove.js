/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 给 command 命令添加 remove 功能
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {removeFactory: factory} = require('../../../lib/commandFactory');

module.exports = factory('plugins', require('../validate'));
