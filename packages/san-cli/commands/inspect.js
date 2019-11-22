/**
 * @file inspect
 * @author yanyiting <yanyiting@baidu.com>
 */

const command = (exports.command = 'inspect [paths...]');
const description = (exports.description = '检查内置 webpack 配置');
const builder = (exports.builder = {
    rule: {
        alias: 'ruleName',
        type: 'string',
        describe: '根据 module 规则名称输出配置'
    },
    rules: {
        type: 'boolean',
        default: false,
        describe: '显示所有 module 规则'
    },
    plugins: {
        type: 'boolean',
        default: false,
        describe: '显示所有插件名称'
    },
    plugin: {
        alias: 'pluginName',
        type: 'string',
        describe: '根据插件名称输出配置'
    }
});

const inspectPlugin = {
    id: 'san-cli-command-inspect',
    apply(api, projectOptions) {
        // 注册命令
        api.registerCommand(command, {
            builder,
            description,
            handler: () => {}
        });
    }
};

exports.handler = async argv => {
    const {toString} = require('webpack-chain');
    const getService = require('../lib/getServiceInstance');
    const service = getService(argv, inspectPlugin);
    await service.run('inspect', argv);

    const config = service.resolveWebpackConfig();
    let res;
    let hasUnnamedRule;

    console.log(argv.paths);
    if (argv.rule) {
        res = config.module.rules.find(r => r.__ruleNames[0] === argv.rule);
    }
    else if (argv.plugin) {
        res = config.plugins.find(p => p.__pluginName === argv.plugin);
    }
    else if (argv.rules) {
        res = config.module.rules.map(r => {
            const name = r.__ruleNames ? r.__ruleNames[0] : 'Nameless Rule (*)';

            hasUnnamedRule = hasUnnamedRule || !r.__ruleNames;

            return name;
        });
    }
    else if (argv.plugins) {
        res = config.plugins.map(p => p.__pluginName || p.constructor.name);
    }
    else if (argv.paths.length > 1) {
        res = {};
        argv.paths.forEach(path => {
            res[path] = get(config, path);
        });
    }
    else if (argv.paths.length === 1) {
        res = get(config, argv.paths[0]);
    }
    else {
        res = config;
    }

    const output = toString(res);
    console.log(output);
};

function get(target, path) {
    const fields = path.split('.');
    let obj = target;
    const l = fields.length;
    for (let i = 0; i < l - 1; i++) {
        const key = fields[i];
        if (!obj[key]) {
            return undefined;
        }
        obj = obj[key];
    }
    return obj[fields[l - 1]];
}
