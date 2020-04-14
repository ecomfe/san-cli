/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 给 comand 命令添加 list 功能
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {listFactory: factory} = require('../../../lib/commandFactory');

module.exports = factory('commands');
