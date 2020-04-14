/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file formatStats
 * modified from https://github.com/nuxt/webpackbar/blob/master/src/profiler/format.js
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const prettyTime = require('pretty-time');
const ConsoleTable = require('tty-table');

const {chalk} = require('@baidu/san-cli-utils/ttyLogger');
const {textBold} = require('@baidu/san-cli-utils/randomColor');

const MAX_ITEM_TIME = 300;
const MAX_TOTAL_TIME = 30 * 1e3;
function startCase(str) {
    return str[0].toUpperCase() + str.substr(1);
}
const DB = {
    loader: {
        get: loader => startCase(loader)
    },
    ext: {
        get: ext => `${ext} files`,
        san: 'San Single File components',
        js: 'JavaScript files',
        sass: 'SASS files',
        scss: 'SASS files',
        unknown: 'Unknown files'
    }
};

function getDescription(category, keyword) {
    const db = DB[category];
    if (!db) {
        return startCase(keyword);
    }

    if (db[keyword]) {
        return db[keyword];
    }

    if (db.get) {
        return db.get(keyword);
    }

    return '-';
}
module.exports = function formatStats(allStats) {
    const lines = [];

    Object.keys(allStats).forEach(category => {
        const stats = allStats[category];

        let totalRequests = 0;
        const totalTime = [0, 0];

        const data = [];
        let maxHeaderWidth = 16;
        Object.keys(stats).forEach(item => {
            const stat = stats[item];

            totalRequests += stat.count || 0;

            const description = getDescription(category, item);

            totalTime[0] += stat.time[0];
            totalTime[1] += stat.time[1];

            const avgTime = [stat.time[0] / stat.count, stat.time[1] / stat.count];
            // 计算宽度
            maxHeaderWidth = Math.max(item.length, maxHeaderWidth);
            data.push([
                item,
                stat.count || '-',
                prettyTime(stat.time),
                avgTime > MAX_ITEM_TIME ? chalk.bgRed(prettyTime(avgTime)) : prettyTime(avgTime),
                description
            ]);
        });
        data.push([
            'TOTAL',
            totalRequests,
            totalTime > MAX_TOTAL_TIME ? chalk.bgRed(prettyTime(totalTime)) : prettyTime(totalTime),
            '',
            ''
        ]);
        const table = new ConsoleTable(
            [
                {value: startCase(category), align: 'right', width: Math.max(maxHeaderWidth, 16)},
                {
                    value: 'Requests',
                    align: 'center',
                    width: 16
                },
                {value: 'Time', align: 'center', width: 12},
                {value: 'Time/Request', align: 'center', width: 16},
                {value: 'Description', align: 'center', width: 30}
            ],
            data,
            {
                borderColor: 'blue'
            }
        );

        /* eslint-disable fecs-max-calls-in-template */
        lines.push(`\n  Stats by ${textBold(startCase(category))}` + table.render());
        /* eslint-enable fecs-max-calls-in-template */
    });

    return `${lines.join('\n')}\n`;
};
