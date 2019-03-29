/**
 * @file inspect run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// eslint-disable-next-line fecs-valid-jsdoc
module.exports = (paths, args) => {
    const {mode = 'production', verbose} = args; // 默认是 production

    const context = process.cwd();
    const Service = require('../../lib/Service');
    const {toString} = require('webpack-chain');

    const service = new Service(context, {
        configFile: args.config
    });
    service.init(mode, {
        target: 'app',
        command: 'inspect'
    });

    const config = service.resolveWebpackConfig();
    let res;
    let hasUnnamedRule;
    if (args.rule) {
        res = config.module.rules.find(r => r.__ruleNames[0] === args.rule);
    } else if (args.plugin) {
        res = config.plugins.find(p => p.__pluginName === args.plugin);
    } else if (args.rules) {
        res = config.module.rules.map(r => {
            const name = r.__ruleNames ? r.__ruleNames[0] : 'Nameless Rule (*)';

            hasUnnamedRule = hasUnnamedRule || !r.__ruleNames;

            return name;
        });
    } else if (args.plugins) {
        res = config.plugins.map(p => p.__pluginName || p.constructor.name);
    } else if (paths.length > 1) {
        res = {};
        paths.forEach(path => {
            res[path] = get(config, path);
        });
    } else if (paths.length === 1) {
        res = get(config, paths[0]);
    } else {
        res = config;
    }

    const output = toString(res, {verbose});
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
