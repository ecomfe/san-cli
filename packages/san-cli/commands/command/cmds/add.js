/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file add command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {addFactory: factory} = require('../../../lib/commandFactory');

module.exports = factory('commands', require('../validate'));
