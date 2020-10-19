/**
 * @file eslint 的配置
 * @author Lohoyo, zttonly
 */

const {cosmiconfigSync} = require('cosmiconfig');

function getEslintPrompts(data) {
    const eslintPrompts = [];
    const rules = data.eslint.rules;
    for (const ruleName in rules) {
        if (typeof rules[ruleName] === 'number') {
            eslintPrompts.push({
                // 名字里有 / 或 - 时，san 会报错，所以转成了对应的 Unicode
                name: ruleName.replace(/\//g, '47').replace(/-/g, '45'),
                type: 'list',
                message: ruleName,
                value: rules[ruleName],
                choices: [
                    {
                        name: '关闭',
                        value: 0
                    },
                    {
                        name: '警告',
                        value: 1
                    },
                    {
                        name: '错误',
                        value: 2
                    }
                ]
            });
        }
    }
    return eslintPrompts;
}

module.exports = api => {
    // 如果项目没有 eslint 的相关配置，就不加载 eslint 插件
    const explorerSync = cosmiconfigSync('eslint', {
        stopDir: api.cwd
    });
    if (!explorerSync.search()) {
        return;
    }
    const iconUrl = (process.env.SAN_CLI_UI_DEV ? `http://localhost:${process.env.SAN_APP_GRAPHQL_PORT}` : '')
        + '/public/eslint.png';
    api.registerConfig({
        id: 'san.eslintrc',
        name: 'ESLint configuration',
        description: 'configuration.eslint.description',
        link: 'https://eslint.org',
        files: {
            eslint: {
                js: ['.eslintrc.js'],
                json: ['.eslintrc', '.eslintrc.json'],
                yaml: ['.eslintrc.yaml', '.eslintrc.yml'],
                // 会从 `package.json` 读取
                package: 'eslintConfig'
            }
        },
        icon: iconUrl,
        onRead: ({data}) => ({
            prompts: getEslintPrompts(data)
        }),
        onWrite: async ({api, prompts}) => {
            // 更新 ESLint 规则
            const result = {};
            for (const prompt of prompts) {
                result[
                    `rules.${prompt.id.replace(/47/g, '/').replace(/45/g, '-')}`
                ] = await api.getAnswer(prompt.id, JSON.parse);
            }
            api.setData('eslint', result);
        }
    });
};
