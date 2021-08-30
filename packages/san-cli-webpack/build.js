/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file webpack build
 * @author ksky521
 */

const webpack = require('webpack');
const EventEmitter = require('events').EventEmitter;
const {getWebpackErrorInfoFromStats, formatConfig} = require('./utils');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const debug = getDebugLogger('webpack:build');

module.exports = class Build extends EventEmitter {
    constructor(webpackConfig) {
        super();
        this.init(webpackConfig);
    }
    init(webpackConfig) {
        debug('start');
        const {
            config,
            isWatch,
            watchOptions
        } = formatConfig(webpackConfig);

        this.isWatch = isWatch;
        this.watchOptions = watchOptions;
        this.compiler = webpack(config);
    }

    getCompiler() {
        return this.compiler;
    }
    run() {
        // 只run一次
        if (this.inited) {
            return;
        }
        this.inited = true;

        const callback = (err, mulStats) => {
            this.emit('complete', {stats: mulStats});
            if (err || mulStats.hasErrors()) {
                debug(err);
                let errorInfo;
                if (mulStats.hasErrors()) {
                    errorInfo = mulStats.toJson();
                    debug(errorInfo.errors);
                }

                this.emit('fail', getWebpackErrorInfoFromStats(err, mulStats));
                if (this.isWatch) {
                    debug(err || errorInfo.errorInfo);
                    process.exit(1);
                }
                return;
            }
            this.emit('success', {stats: mulStats, isWatch: this.isWatch});
        };

        if (this.isWatch) {
            return this.compiler.watch(this.watchOptions || {}, callback);
        }
        try {
            this.compiler.run(callback);
        }
        catch (e) {
            this.emit('fail', {err: e, type: 'run'});
        }
    }
};
