/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file test entry file
 */

const rawArgs = process.argv.slice(2);
const [packagename, filename] = rawArgs;

let regx;
if (packagename) {
    regx = `.*(${packagename}|san-cli-(${packagename}))/.*\\.spec\\.js$`;
    if (filename) {
        regx = `.*(${packagename}|san-cli-(${packagename}))/.*${filename}\\.spec\\.js$`;
    }
}

const jestArgs = [
    '--runInBand',
    '--coverage',
    ...(regx ? [regx] : [])
];

console.log(`running jest with args: ${jestArgs.join(' ')}`);
/* eslint-disable jest/no-jest-import */
require('jest').run(jestArgs);



















