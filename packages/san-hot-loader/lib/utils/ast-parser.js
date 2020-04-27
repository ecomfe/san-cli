/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file ast-parser.js
 * @author clark-t
 */

const babel = require('@babel/core');
const proposalClassProperties = require('@babel/plugin-proposal-class-properties');
const path = require('path');

module.exports = function (source, {resourcePath}) {
    return babel.parse(source, {
        sourceType: 'module',
        filename: path.basename(resourcePath),
        plugins: [
            proposalClassProperties
        ]
    });
};
