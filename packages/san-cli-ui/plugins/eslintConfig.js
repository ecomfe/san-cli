/**
 * @file eslint 的配置
 * @author Lohoyo<liuhuyue@baidu.com>
 */

module.exports = api => {
    api.registerConfig({
        id: 'san.eslintrc',
        name: 'ESLint configuration',
        description: 'config.eslintrc.description',
        link: 'https://eslint.org',
        files: {
            eslint: {
                js: ['.eslintrc.js'],
                json: ['.eslintrc', '.eslintrc.json'],
                yaml: ['.eslintrc.yaml', '.eslintrc.yml'],
                // 会从 `package.json` 读取
                package: 'eslintConfig'
            },
        },
        icon: 'https://b.bdstatic.com/searchbox/icms/searchbox/img/eslint-logo.png',
        // TODO: 实现 onRead
        onRead: ({data}) => ({
            prompts: [
                {

                }
            ]
        }),
    });
};
