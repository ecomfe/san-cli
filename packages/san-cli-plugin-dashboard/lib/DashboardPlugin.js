/**
 * @file A Plugin for CLI UI Dashboard
 * Inspired by
 * https://github.com/FormidableLabs/webpack-dashboard/blob/7f99b31c5f00a7818d8129cb8a8fc6eb1b71799c/plugin/index.js
 * https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/webpack/DashboardPlugin.js
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const {getDebugLogger, error} = require('san-cli-utils/ttyLogger');
const {IpcMessenger} = require('san-cli-utils/ipc');
const {analyzeBundle} = require('./analyzeBundle');

const debug = getDebugLogger('cli:dashboard');

const ID = 'built-in:dashboard-plugin';
const ONE_SECOND = 1000;
const FILENAME_QUERY_REGEXP = /\?.*$/;

const ipc = new IpcMessenger();

function getTimeMessage(timer) {
    let time = Date.now() - timer;

    if (time >= ONE_SECOND) {
        time /= ONE_SECOND;
        time = Math.round(time);
        time += 's';
    }
    else {
        time += 'ms';
    }

    return ` (${time})`;
}

class DashboardPlugin {
    constructor(options) {
        this.type = options.type;
        const modernBuild = options.modernBuild || process.env.SAN_CLI_MODERN_BUILD;
        if (this.type === 'build' && modernBuild) {
            this.type = 'build-modern';
        }

        this.watching = false;
        this.autoDisconnect = !options.keepAlive;
    }

    cleanup() {
        this.sendData = null;
        if (this.autoDisconnect) {
            ipc.disconnect();
        }
    }

    apply(compiler) {
        let timer;

        let assetSources = new Map();

        if (!this.sendData) {
            this.sendData = data => {
                debug('IPC sending data:', data);
                ipc.send({
                    webpackDashboardData: {
                        type: this.type,
                        value: data
                    }
                });
            };
        }

        let sendData = this.sendData;

        // Progress status
        let progressTime = Date.now();
        const progressPlugin = new webpack.ProgressPlugin((percent, msg) => {
            // Debouncing
            const time = Date.now();
            if (time - progressTime > 300) {
                progressTime = time;
                sendData([
                    {
                        type: 'status',
                        value: 'Compiling'
                    },
                    {
                        type: 'progress',
                        value: percent
                    },
                    {
                        type: 'operations',
                        value: msg + getTimeMessage(timer)
                    }
                ]);

                debug(percent, msg);
            }

        });

        progressPlugin.apply(compiler);

        compiler.hooks.watchRun.tap(ID, c => {
            this.watching = true;
        });

        compiler.hooks.run.tap(ID, c => {
            this.watching = false;
        });

        compiler.hooks.compile.tap(ID, () => {
            timer = Date.now();

            sendData([
                {
                    type: 'status',
                    value: 'Compiling'
                },
                {
                    type: 'progress',
                    value: 0
                }
            ]);
        });

        compiler.hooks.invalid.tap(ID, () => {
            sendData([
                {
                    type: 'status',
                    value: 'Invalidated'
                },
                {
                    type: 'progress',
                    value: 0
                },
                {
                    type: 'operations',
                    value: 'idle'
                }
            ]);
        });

        compiler.hooks.failed.tap(ID, () => {
            sendData([
                {
                    type: 'status',
                    value: 'Failed'
                },
                {
                    type: 'operations',
                    value: `idle${getTimeMessage(timer)}`
                }
            ]);
        });

        compiler.hooks.afterEmit.tap(ID, compilation => {
            assetSources = new Map();
            // eslint-disable-next-line
            for (const name in compilation.assets) {
                const asset = compilation.assets[name];
                assetSources.set(name.replace(FILENAME_QUERY_REGEXP, ''), asset.source());
            }
        });

        compiler.hooks.done.tap(ID, stats => {
            let statsData = stats.toJson();
            // Sometimes all the information is located in `children` array
            if ((!statsData.assets || !statsData.assets.length) && statsData.children && statsData.children.length) {
                statsData = statsData.children[0];
            }

            const outputPath = compiler.options.output.path;
            statsData.assets.forEach(asset => {
                // Removing query part from filename (yes, somebody uses it for some reason and Webpack supports it)
                asset.name = asset.name.replace(FILENAME_QUERY_REGEXP, '');
                asset.fullPath = path.join(outputPath, asset.name);
            });
            // Analyze the assets and update sizes on assets and modules
            analyzeBundle(statsData, assetSources);

            const hasErrors = stats.hasErrors();

            sendData([
                {
                    type: 'status',
                    value: hasErrors ? 'Failed' : 'Success'
                },
                {
                    type: 'progress',
                    value: 1
                },
                {
                    type: 'operations',
                    value: `idle${getTimeMessage(timer)}`
                }
            ]);

            const statsRawFile = path.resolve(process.cwd(), `./node_modules/.stats-${this.type}-raw.json`);
            fs.writeJson(statsRawFile, stats.toJson());

            const statsFile = path.resolve(process.cwd(), `./node_modules/.stats-${this.type}.json`);

            fs.writeJson(statsFile, {
                errors: hasErrors,
                warnings: stats.hasWarnings(),
                data: statsData
            }).then(() => {
                sendData([
                    {
                        type: 'stats'
                    }
                ]);

                if (!this.watching) {
                    this.cleanup();
                }

            }).catch(err => {
                error(err);
            });
        });
    }
}

module.exports = DashboardPlugin;
