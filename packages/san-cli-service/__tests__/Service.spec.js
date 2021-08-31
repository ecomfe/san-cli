/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file Service test
 * @author yanyiting, Lohoyo
 */

const Service = require('../Service');
const path = require('path');

jest.unmock('fs-extra');
// jest.unmock('cosmiconfig');

describe('检查 webpack 配置', () => {
    const cwd = process.cwd();

    test('没有初始化就获取 webpack 配置', () => {
        const service = new Service();
        expect(() => service.getWebpackConfig({}))
            .toThrow('Service must call init() before calling getWebpackConfig().');
    });

    test('检查 npm start 时的 webpack 配置', done => {  // eslint-disable-line
        const service = new Service(cwd, {
            autoLoadConfigFile: false,
            projectOptions: {
                assetsDir: 'static',
                publicPath: '/',
                outputDir: 'output',
                filenameHashing: false,
                copy: [{from: 'template', to: 'template'}],
                pages: {
                    index: {
                        entry: cwd + '/src/pages/index/index.js',
                        template: __dirname + '/mock/index.tpl',
                        chunks: ['vendors']
                    }
                },
                css: {sourceMap: false, cssPreprocessor: 'sass'},
                alias: {
                    '@assets': cwd + '/src/assets',
                    '@components': cwd + '/src/components',
                    '@app': cwd + '/src/lib/App.js',
                    '@store': cwd + '/src/lib/Store.js'
                },
                sourceMap: false,
                devServer: {
                    watchContentBase: false,
                    hot: true,
                    hotOnly: false,
                    logLevel: 'silent',
                    clientLogLevel: 'silent',
                    overlay: {warnings: false, errors: true},
                    stats: 'errors-only',
                    inline: false,
                    lazy: false,
                    index: 'index.html',
                    watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
                    disableHostCheck: true,
                    compress: false,
                    host: '0.0.0.0',
                    port: 8899,
                    https: false
                },
                plugins: [
                    [
                        {
                            id: 'lhy3-plugin',
                            apply() {}
                        }
                    ]
                ],
                chainWebpack: config => config.resolve.alias.set('@', cwd + '/src'),
                configWebpack: {
                    resolve: {
                        extensions: ['.js', '.san', '.json', '.sass']
                    }
                }
            }
        });

        service.run().then(api => {
            const webpackConfig = api.getWebpackConfig();
            expect(webpackConfig).toMatchObject({
                mode: 'development',
                context: cwd + '',
                devtool: 'eval-cheap-module-source-map',
                output: {
                    path: path.join(cwd, '/output'),
                    filename: '[name].js',
                    publicPath: '/'
                },
                resolve: {
                    symlinks: false,
                    alias: {
                        'core-js': path.dirname(require.resolve('core-js')),
                        'regenerator-runtime': path.dirname(require.resolve('regenerator-runtime')),
                        'san': path.join(path.dirname(require.resolve('san', {paths: [cwd]})), 'san.spa.dev.js'),
                        '@assets': cwd + '/src/assets',
                        '@components': cwd + '/src/components',
                        '@app': cwd + '/src/lib/App.js',
                        '@store': cwd + '/src/lib/Store.js'
                    },
                    extensions: ['.js', '.san', '.json', '.sass'],
                    modules: [
                        'node_modules',
                        path.join(cwd, '/node_modules'),
                        path.join(cwd, '/packages/san-cli-config-webpack/node_modules')
                    ]
                },
                resolveLoader: {
                    modules: [
                        path.join(cwd, '/packages/san-cli-plugin-babel/node_modules'),
                        'node_modules',
                        path.join(cwd, '/node_modules'),
                        path.join(cwd, '/packages/san-cli-config-webpack/node_modules')
                    ]
                },
                entry: {index: [path.join(cwd, '/src/pages/index/index.js')]},
                devServer: {
                    watchContentBase: false,
                    hot: true,
                    hotOnly: false,
                    logLevel: 'silent',
                    clientLogLevel: 'silent',
                    overlay: {warnings: false, errors: true},
                    stats: 'errors-only',
                    inline: false,
                    lazy: false,
                    index: 'index.html',
                    watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
                    disableHostCheck: true,
                    compress: false,
                    host: '0.0.0.0',
                    port: 8899,
                    https: false
                }
            });
            service.run().then(() => {
                const loadEnv = jest.spyOn(service, 'loadEnv');
                // 通过是否调用了 loadEnv 来判断第二次 run 时是否又重新初始化了
                expect(loadEnv).not.toHaveBeenCalled();
                loadEnv.mockClear();
                done();
            });
        });
    });

    test('检查 npm run build 时的 webpack 配置', done => {  // eslint-disable-line
        const service = new Service(cwd, {
            autoLoadConfigFile: false,
            projectOptions: {
                assetsDir: 'static/san-cli',
                publicPath: 'https://s.bdstatic.com/',
                outputDir: 'output',
                filenameHashing: true,
                copy: {from: 'template', to: 'template'},
                pages: {
                    index: {
                        entry: cwd + '/src/pages/index/index.js',
                        template: cwd + '/pages.template.ejs'
                    }
                },
                css: {sourceMap: true, cssPreprocessor: 'less'},
                alias: {
                    '@assets': cwd + '/src/assets',
                    '@components': cwd + '/src/components',
                    '@app': cwd + '/src/lib/App.js',
                    '@store': cwd + '/src/lib/Store.js'
                },
                sourceMap: true,
                devServer: {
                    watchContentBase: false,
                    hot: true,
                    hotOnly: false,
                    logLevel: 'silent',
                    clientLogLevel: 'silent',
                    overlay: {warnings: false, errors: true},
                    stats: 'errors-only',
                    inline: false,
                    lazy: false,
                    index: 'index.html',
                    watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
                    disableHostCheck: true,
                    compress: false,
                    host: '0.0.0.0',
                    port: 8899,
                    https: false
                },
                configWebpack() {
                    return {
                        resolve: {
                            extensions: ['.js', '.css', '.less', '.san', 'ts']
                        }
                    };
                }
            }
        });

        service.run('build', {mode: 'production'}).then(api => {
            const webpackConfig = api.getWebpackConfig();
            expect(webpackConfig).toMatchObject({
                mode: 'production',
                context: cwd + '',
                devtool: 'source-map',
                output: {
                    path: path.join(cwd, '/output'),
                    filename: 'static/san-cli/js/[name].[contenthash:8].js',
                    publicPath: 'https://s.bdstatic.com/',
                    chunkFilename: 'static/san-cli/js/[name].[contenthash:8].js'
                },
                resolve: {
                    symlinks: false,
                    alias: {
                        'core-js': path.dirname(require.resolve('core-js')),
                        'regenerator-runtime': path.dirname(require.resolve('regenerator-runtime')),
                        'san': path.join(path.dirname(require.resolve('san', {paths: [cwd]})), 'san.spa.js'),
                        '@assets': cwd + '/src/assets',
                        '@components': cwd + '/src/components',
                        '@app': cwd + '/src/lib/App.js',
                        '@store': cwd + '/src/lib/Store.js'
                    },
                    extensions: ['.js', '.css', '.less', '.san', 'ts'],
                    modules: [
                        'node_modules',
                        path.join(cwd, '/node_modules'),
                        path.join(cwd, '/packages/san-cli-config-webpack/node_modules')
                    ]
                },
                resolveLoader: {
                    modules: [
                        path.join(cwd, '/packages/san-cli-plugin-babel/node_modules'),
                        'node_modules',
                        path.join(cwd, '/node_modules'),
                        path.join(cwd, '/packages/san-cli-config-webpack/node_modules')
                    ]
                },
                entry: {index: [path.join(cwd, '/src/pages/index/index.js')]},
                devServer: {
                    watchContentBase: false,
                    hot: true,
                    hotOnly: false,
                    logLevel: 'silent',
                    clientLogLevel: 'silent',
                    overlay: {warnings: false, errors: true},
                    stats: 'errors-only',
                    inline: false,
                    lazy: false,
                    index: 'index.html',
                    watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
                    disableHostCheck: true,
                    compress: false,
                    host: '0.0.0.0',
                    port: 8899,
                    https: false,
                }
            });
            done();
        });
    });
});

describe('constructor resolvePlugins _loadPlugin', () => {
    test('plugins有值，useBuiltInPlugin为true', () => {
        const service = new Service(__dirname + '/mock', {
            plugins: [
                // string格式
                './yyt-plugin.js',
                // obj格式
                {id: 'yyt1-plugin', apply: () => {}},
                // array格式两项，参数一obj
                [{id: 'yyt3-plugin', apply: () => {}}, {}],
                // array格式两项，参数一string
                ['./yyt2-plugin.js', {a: 1}],
                // 没有 id 的 plugin
                './lhy-plugin.js',
                // 函数格式
                () => {},
                // 没有 apply 函数的无效 plugin
                './lhy2-plugin.js',
                // 瞎传,
                {}
            ],
            useBuiltInPlugin: true,
            projectOptions: {
                outputDir: 'output'
            }
        });
        // 检测plugins新增的插件是否已加入进去
        expect(
            service.plugins.map(item => {
                if (Array.isArray(item)) {
                    return item[0].id;
                }
                return item && item.id;
            })
        ).toEqual([
            'base',
            'output',
            'extensions',
            'alias',
            'san',
            'fonts',
            'media',
            'image',
            'svg',
            'js',
            'html',
            'css',
            'optimization',
            'yyt-plugin',
            'yyt1-plugin',
            'yyt3-plugin',
            'yyt2-plugin',
            './lhy-plugin.js',
            'anonymous',
            undefined,
            undefined
        ]);
        // 检测对于加options的插件是否已加入进去
        expect(service.plugins.filter(item => Array.isArray(item))[1][1]).toEqual({a: 1});
        // 检测新增的projectOptions是否已加入进去
        expect(service._initProjectOptions).toEqual({outputDir: 'output'});
    });
    test('plugins为空，useBuiltInPlugin为true', () => {
        const service = new Service(__dirname + '/mock', {
            useBuiltInPlugin: true,
            projectOptions: {
                outputDir: 'output'
            }
        });
        // 检测plugins插件值是否正常
        expect(
            service.plugins.map(item => {
                if (Array.isArray(item)) {
                    return item[0].id;
                }
                return item.id;
            })
        ).toEqual([
            'base',
            'output',
            'extensions',
            'alias',
            'san',
            'fonts',
            'media',
            'image',
            'svg',
            'js',
            'html',
            'css',
            'optimization'
        ]);
    });
    test('useBuiltInPlugin为false', () => {
        const service = new Service(__dirname + '/mock', {
            useBuiltInPlugin: false,
            projectOptions: {
                outputDir: 'output'
            }
        });
        // 检测plugins插件值是否正常
        expect(service.plugins).toEqual([]);
    });
});

describe('loadEnv', () => {
    const service = new Service(__dirname + '/mock');
    afterEach(() => {
        delete process.env.TEST_ENV_PATH;
        delete process.env.TEST_ENV_PRODUCTION_PATH;
        delete process.env.TEST_ENV_PRODUCTION_LOACAL_PATH;
        delete process.env.TEST_ENV_DEVELOPMENT_PATH;
    });
    test('有 mode 值', () => {
        service.loadEnv('production');
        expect(process.env.TEST_ENV_PRODUCTION_PATH).toBe('/home/work/env/production');
        expect(process.env.TEST_ENV_PRODUCTION_LOACAL_PATH).toBe('/home/work/env/production/local');
        expect(process.env.TEST_ENV_PATH).toBe('/home/work/env');
    });
    test('没有 mode 值', () => {
        service.loadEnv();
        expect(process.env.TEST_ENV_PRODUCTION_PATH).toBeUndefined();
        expect(process.env.TEST_ENV_PATH).toBe('/home/work/env');
    });
    test('不存在 mode 对应的 .local 文件', () => {
        service.loadEnv('development');
        expect(process.env.TEST_ENV_DEVELOPMENT_PATH).toBe('/home/work/env/development');
        expect(process.env.TEST_ENV_PATH).toBe('/home/work/env');
    });
});

describe('loadProjectOptions', () => {
    const service = new Service(__dirname + '/mock');
    test('可查到的文件路径', async () => {
        const config = await service.loadProjectOptions('san.config.js');
        // 检测san.config.js中的配置项是否保留还在
        expect(config.templateDir).toBe('the-template-dir');
        // 检测与./options中的默认配置项做merge的情况是否符合预期
        expect(config.devServer).toEqual({
            contentBase: 'output',
            port: 9003,
            logLevel: 'silent',
            clientLogLevel: 'silent',
            overlay: {warnings: false, errors: true},
            stats: 'errors-only',
            inline: false,
            lazy: false,
            index: 'index.html',
            watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
            disableHostCheck: true,
            compress: false,
            host: '0.0.0.0',
            watchContentBase: false,
            hot: true,
            hotOnly: false,
            https: false
        });
        // 检测是否加了css配置项
        expect(config.css).toBeUndefined();
    });
    test('不可查到的文件路径', () => {
        const warn = jest.spyOn(service.logger, 'warn');
        service.loadProjectOptions('san.config.json');
        expect(warn).toHaveBeenCalledWith('config file `san.config.json` is not exists!');
        warn.mockClear();
    });
    test('不可查到的文件路径，但是工程中存在 san.config.js', () => {
        const config = service.loadProjectOptions();
        // 会去自动查找项目中的san.config.js，查验一下是否找到了并返回正确的配置项
        expect(config.templateDir).toBe('the-template-dir');
    });
    test('配置文件的格式不对，正常导出了对象', () => {
        const config = service.loadProjectOptions('san.config2.js');
        expect(typeof config).toBe('object');
    });
    test('配置文件的配置字段的的值的格式错误', () => {
        expect(() => service.init('production', 'san.config3.js'))
            .toThrow('ValidationError: "pages" must be of type object');
    });
});

describe('initPlugin', () => {
    const service = new Service(__dirname + '/mock');
    const expectfunc = api => {
        expect(typeof api.addPlugin).toBe('function');
        expect(typeof api.chainWebpack).toBe('function');
        expect(typeof api.getWebpackChainConfig).toBe('function');
        expect(typeof api.getWebpackConfig).toBe('function');
        expect(typeof api.getProjectOptions).toBe('function');
        expect(typeof api.getCwd).toBe('function');
    };
    test('参数为两项数组[{id: xxx, apply: () => {}}, {}]', () => {
        service.initPlugin([
            {
                id: 'yyt-plugin',
                apply: (api, projectOptions, options) => {
                    expectfunc(api);
                    expect(options).toEqual({a: 1, b: 2});
                }
            },
            {
                a: 1,
                b: 2
            }
        ]);
    });
    test('参数为一项数组[{id: xxx, apply: () => {}}]', () => {
        service.initPlugin([
            {
                id: 'yyt-plugin',
                apply: (api, projectOptions, options) => {
                    expectfunc(api);
                }
            }
        ]);
    });
    test('参数对象{id: xxx, apply: () => {}}', () => {
        service.initPlugin([
            {
                id: 'yyt-plugin',
                apply: (api, projectOptions, options) => {
                    expectfunc(api);
                }
            }
        ]);
    });
});
