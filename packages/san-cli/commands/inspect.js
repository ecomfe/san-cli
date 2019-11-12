exports.command = 'inspect [paths...]';
exports.description = '检查内置 webpack 配置';
exports.builder = {
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
};

exports.handler = argv => {};
