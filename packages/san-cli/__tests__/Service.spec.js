/**
 * @file Service test
 */

import Service from '../lib/Service';
import fse from 'fs-extra';

jest.unmock('fs-extra');
jest.unmock('cosmiconfig');

describe('constructor resolvePlugins _resolvePlugin', () => {
    test('plugins有值，useBuiltInPlugin为true', () => {
        const service = new Service(__dirname + '/mock', {
            plugins: [
                // string格式
                __dirname + '/mock/yyt-plugin.js',
                // obj格式
                {id: 'yyt1-plugin', apply: () => {}},
                // array格式两项，参数一obj
                [{id: 'yyt3-plugin', apply: () => {}}, {}],
                // array格式两项，参数一string
                [__dirname + '/mock/yyt2-plugin.js', {a: 1}]
            ],
            useBuiltInPlugin: true,
            projectOptions: {
                outputDir: 'output'
            },
            cli: () => {}
        });
        // 检测plugins新增的插件是否已加入进去
        expect(service.plugins.map(item => {
            if (Array.isArray(item)) {
                return item[0].id;
            }
            return item.id;
        })).toEqual([
            'built-in:base',
            'built-in:css',
            'built-in:app',
            'built-in:optimization',
            'built-in:babel',
            'yyt-plugin',
            'yyt1-plugin',
            'yyt3-plugin',
            'yyt2-plugin'
        ]);
        // 检测对于加options的插件是否已加入进去
        expect(service.plugins.filter(item => Array.isArray(item))[0][1]).toEqual({a: 1});
        // 检测新增的projectOptions是否已加入进去
        expect(service['_initProjectOptions']).toEqual({outputDir: 'output'});
    });
    test('plugins为空，useBuiltInPlugin为true', () => {
        const service = new Service(__dirname + '/mock', {
            useBuiltInPlugin: true,
            projectOptions: {
                outputDir: 'output'
            },
            cli: () => {}
        });
        // 检测plugins插件值是否正常
        expect(service.plugins.map(item => {
            if (Array.isArray(item)) {
                return item[0].id;
            }
            return item.id;
        })).toEqual([
            'built-in:base',
            'built-in:css',
            'built-in:app',
            'built-in:optimization',
            'built-in:babel'
        ]);
    });
    test('useBuiltInPlugin为false', () => {
        const service = new Service(__dirname + '/mock', {
            useBuiltInPlugin: false,
            projectOptions: {
                outputDir: 'output'
            },
            cli: () => {}
        });
        // 检测plugins插件值是否正常
        expect(service.plugins).toEqual([]);
    });
});

describe('loadEnv', () => {
    let service = null;
    beforeEach(() => {
        service = new Service(__dirname + '/mock');
    });
    test('有mode值', () => {
        service.loadEnv('production');
        expect(process.env.TEST_ENV_PRODUCTION_PATH).toBe('/home/work/env/production');
        expect(process.env.TEST_ENV_PRODUCTION_LOACAL_PATH).toBe('/home/work/env/production/local');
    });
    test('没有mode值', () => {
        service.loadEnv();
        expect(process.env.TEST_ENV_PATH).toBe('/home/work/env');
    });
    test('不存在某个.env文件', () => {
        service.loadEnv('development');
    });
});

describe('loadProjectOptions', () => {
    let service = null;
    beforeEach(() => {
        service = new Service(__dirname + '/mock');
    });
    test('可查到的文件路径', async () => {
        const config = await service.loadProjectOptions('./mock/san.config.js');
        // 检测san.config.js中的配置项是否保留还在
        expect(config.templateDir).toBe('template');
        // 检测与./options中的默认配置项做merge的情况是否符合预期
        expect(config.devServer).toEqual({
            contentBase: 'output',
            port: 9003,
            clientLogLevel: 'info',
            overlay: {warnings: false, errors: true},
            hot: true,
            noInfo: true,
            stats: 'errors-only',
            inline: false,
            lazy: false,
            quiet: true,
            index: 'index.html',
            watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
            disableHostCheck: true,
            compress: false,
            host: '0.0.0.0',
            https: false
        });
        // 检测是否加了css配置项
        expect(config.css).toEqual({
            postcss: undefined
        });
        // 检测是否加了browserslist配置项
        expect(config.browserslist).toEqual([
            '> 1.2% in cn',
            'last 2 versions',
            'iOS >=8',
            'android>4.4',
            'not bb>0',
            'not ff>0',
            'not ie>0',
            'not ie_mob>0'
        ]);
    });
    test('不可查到的文件路径，但是工程中存在san.config.js', async () => {
        const config = await service.loadProjectOptions();
        // 会去自动查找项目中的san.config.js，查验一下是否找到了并返回正确的配置项
        expect(config.templateDir).toBe('template');
    });
    // test('不可查到的文件路径，并且工程中也没有san.config.js文件', async () => {
    //     fse.moveSync(__dirname + '/mock/san.config.js', __dirname + '/mock/yyt.config.js');
    //     const config = await service.loadProjectOptions('./mock/san.config.js');
    //     // 为默认选项
    //     expect(config.build).toEqual({});
    //     // 检测是否加了browserslist配置项
    //     expect(config.browserslist).toEqual([
    //         '> 1.2% in cn',
    //         'last 2 versions',
    //         'iOS >=8',
    //         'android>4.4',
    //         'not bb>0',
    //         'not ff>0',
    //         'not ie>0',
    //         'not ie_mob>0'
    //     ]);
    //     fse.moveSync(__dirname + '/mock/yyt.config.js', __dirname + '/mock/san.config.js');
    // });
});

describe('initPlugin', () => {
    let service = null;
    beforeEach(() => {
        service = new Service(__dirname + '/mock');
    });
    const expectfunc = (api) => {
        expect(typeof api.registerCommand).toBe('function');
        expect(typeof api.registerCommandFlag).toBe('function');
        expect(typeof api.registerCommandFlag).toBe('function');
        expect(typeof api.addPlugin).toBe('function');
        expect(typeof api.resolveChainableWebpackConfig).toBe('function');
        expect(typeof api.resolveWebpackConfig).toBe('function');
        expect(typeof api.getProjectOptions).toBe('function');
        expect(typeof api.getCwd).toBe('function');
        expect(typeof api.getVersion).toBe('function');
    };
    test('参数为两项数组[{id: xxx, apply: () => {}}, {}]', () => {
        service.initPlugin([{
            id: 'yyt-plugin',
            apply: (api, projectOptions, options) => {
                expectfunc(api);
                expect(options).toEqual({a: 1, b: 2});
            }
        }, {
            a: 1,
            b: 2
        }]);
    });
    test('参数为一项数组[{id: xxx, apply: () => {}}]', () => {
        service.initPlugin([{
            id: 'yyt-plugin',
            apply: (api, projectOptions, options) => {
                expectfunc(api);
            }
        }]);
    });
    test('参数对象{id: xxx, apply: () => {}}', () => {
        service.initPlugin([{
            id: 'yyt-plugin',
            apply: (api, projectOptions, options) => {
                expectfunc(api);
            }
        }]);
    });
});

describe('registerCommand', () => {
    let service = null;
    beforeEach(() => {
        service = new Service(__dirname + '/mock');
    });
    test('name为string，yargsModule为obj', () => {
        service.registerCommand('yyt [component]', {
            builder: {},
            description: 'yyt description',
            handler(argv) {},
            middlewares: []
        });
        expect(service.registeredCommands.get('yyt').description).toBe('yyt description');
    });
    test('name为string，yargsModule为function', () => {
        service.registerCommand('yyt [component]', argv => {});
        expect(service.registeredCommands.get('yyt').description).toBeFalsy();
    });
    test('只有name值（只有第一个参数）', () => {
        service.registerCommand({
            command: 'yyt [component]',
            builder: {},
            description: 'yyt only name description',
            handler(argv) {},
            middlewares: []
        });
        expect(service.registeredCommands.get('yyt').description).toBe('yyt only name description');
    });
});

describe('registerCommandFlag', () => {
    let service = null;
    beforeEach(() => {
        service = new Service(__dirname + '/mock');
    });
    test('', () => {
        service.registerCommandFlag('yyt', {a: 1}, argv => {});
        // 检测flag是否已注册上
        expect(service.registeredCommandFlags.get('yyt')).toEqual({a: 1});
        // 检测新增的handler是否已注册上
        expect(service.registeredCommandHandlers.get('yyt').length).toBe(1);
    });
});
