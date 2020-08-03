/**
 * @file config
 * @author zttonly
 */

module.exports = api => {
    api.registerConfig({
        id: 'san.san-cli',
        name: 'San CLI',
        description: 'config.san-cli.description',
        link: 'https://ecomfe.github.io/san-cli/#/config',
        files: {
            san: {
                js: ['san.config.js']
            }
        },
        icon: 'https://baidu.github.io/san/img/logo2.png',
        onRead: ({data}) => ({
            prompts: [
                {
                    name: 'publicPath',
                    type: 'input',
                    default: '/',
                    value: data.san && data.san.publicPath,
                    message: 'config.san-cli.publicPath.label',
                    description: 'config.san-cli.publicPath.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'outputDir',
                    type: 'input',
                    default: 'dist',
                    value: data.san && data.san.outputDir,
                    validate: input => !!input,
                    message: 'config.san-cli.outputDir.label',
                    description: 'config.san-cli.outputDir.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'assetsDir',
                    type: 'input',
                    default: '',
                    value: data.san && data.san.assetsDir,
                    message: 'config.san-cli.assetsDir.label',
                    description: 'config.san-cli.assetsDir.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'pages',
                    type: 'input',
                    default: {},
                    value: data.san && data.san.pages,
                    message: 'config.san-cli.pages.label',
                    description: 'config.san-cli.pages.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'copy',
                    type: 'input',
                    default: false,
                    value: data.san && data.san.copy,
                    message: 'config.san-cli.copy.label',
                    description: 'config.san-cli.copy.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'sourceMap',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.sourceMap,
                    message: 'config.san-cli.sourceMap.label',
                    description: 'config.san-cli.sourceMap.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'filenameHashing',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.filenameHashing,
                    message: 'config.san-cli.filenameHashing.label',
                    description: 'config.san-cli.filenameHashing.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'largeAssetSize',
                    type: 'input',
                    default: 4e3,
                    value: data.san && data.san.largeAssetSize,
                    message: 'config.san-cli.largeAssetSize.label',
                    description: 'config.san-cli.largeAssetSize.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.sourceMap',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.sourceMap,
                    message: 'config.san-cli.css.sourceMap.label',
                    description: 'config.san-cli.css.sourceMap.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.cssPreprocessor',
                    type: 'input',
                    default: 'less',
                    value: data.san && data.san.css && data.san.css.cssPreprocessor,
                    message: 'config.san-cli.css.cssPreprocessor.label',
                    description: 'config.san-cli.css.cssPreprocessor.description',
                    group: 'config.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.extract',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.extract,
                    message: 'config.san-cli.css.extract.label',
                    description: 'config.san-cli.css.extract.description',
                    group: 'config.san-cli.groups.css',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.requireModuleExtension',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.requireModuleExtension,
                    message: 'config.san-cli.css.requireModuleExtension.label',
                    description: 'config.san-cli.css.requireModuleExtension.description',
                    group: 'config.san-cli.groups.css',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                }
            ]
        }),
        onWrite: async ({api, prompts}) => {
            const sanData = {};
            for (const prompt of prompts) {
                sanData[prompt.id] = await api.getAnswer(prompt.id);
            }
            api.setData('san', sanData);
        }
    });
};
