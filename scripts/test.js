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
    regx = `packages/(${packagename}|san-cli-(${packagename}))/`;
    if (filename) {
        regx += `.*${filename}\\.spec\\.js$`;
    }
    else {
        regx += '.*\\.spec\\.js$';
    }
}

const jestArgs = ['--runInBand', '--detectOpenHandles', ...(regx ? [regx] : [])];

// eslint-disable-next-line no-console
console.log(`running jest with args: ${jestArgs.join(' ')}`);
/* eslint-disable jest/no-jest-import */
require('jest').run(jestArgs);
