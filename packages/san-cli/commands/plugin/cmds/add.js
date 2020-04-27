/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file add command
 * @author ksky521
 */

const {addFactory: factory} = require('../../../lib/commandFactory');

module.exports = factory('plugins', require('../validate'));
