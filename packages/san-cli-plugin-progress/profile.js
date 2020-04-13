/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file webpackbar profile reporter
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const Profiler = require('./lib/Profiler');
const {chalkColor} = require('@baidu/san-cli-utils/color');
const {chalk} = require('@baidu/san-cli-utils/ttyLogger');
const figures = require('figures');
module.exports = {
    progress(context) {
        if (!context.state.profiler) {
            context.state.profiler = new Profiler();
        }

        context.state.profiler.onRequest(context.state.request);
    },

    done(context) {
        if (context.state.profiler) {
            context.state.profile = context.state.profiler.getFormattedStats();
            delete context.state.profiler;
        }
    },

    allDone(context) {
        let str = '';

        for (const state of context.statesArray) {
            const color = chalkColor(state.color);

            if (state.profile) {
                // prettier-ignore
                /* eslint-disable max-len */
                str += color(`\n  ${figures.pointer + figures.pointer} Profile results for ${chalk.bold(state.name)}\n`) + `${state.profile}\n`;
                /* eslint-enable max-len */
                delete state.profile;
            }
        }

        process.stderr.write(str);
    }
};
