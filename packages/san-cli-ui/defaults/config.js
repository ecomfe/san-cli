/**
 * @file config
 * @author
 */

module.exports = api => {
    api.describeConfig({
        id: 'san.san-cli',
        name: 'San CLI',
        description: 'san-cli.description',
        link: 'https://ecomfe.github.io/san-cli/#/config',
        files: {
            san: {
                js: ['san.config.js']
            }
        },
        // icon: '/public/san-cli.png',
        onRead: ({data}) => ({
            prompts: [
                {
                    name: 'publicPath',
                    type: 'input',
                    default: '/',
                    value: data.san && data.san.publicPath,
                    message: 'san-cli.publicPath.label',
                    description: 'san-cli.publicPath.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'outputDir',
                    type: 'input',
                    default: 'dist',
                    value: data.san && data.san.outputDir,
                    validate: input => !!input,
                    message: 'san-cli.outputDir.label',
                    description: 'san-cli.outputDir.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'assetsDir',
                    type: 'input',
                    default: '',
                    value: data.san && data.san.assetsDir,
                    message: 'san-cli.assetsDir.label',
                    description: 'san-cli.assetsDir.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'pages',
                    type: 'input',
                    default: {},
                    value: data.san && data.san.pages,
                    message: 'san-cli.pages.label',
                    description: 'san-cli.pages.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'copy',
                    type: 'input',
                    default: false,
                    value: data.san && data.san.copy,
                    message: 'san-cli.copy.label',
                    description: 'san-cli.copy.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'sourceMap',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.sourceMap,
                    message: 'san-cli.sourceMap.label',
                    description: 'san-cli.sourceMap.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'filenameHashing',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.filenameHashing,
                    message: 'san-cli.filenameHashing.label',
                    description: 'san-cli.filenameHashing.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'largeAssetSize',
                    type: 'input',
                    default: 4e3,
                    value: data.san && data.san.largeAssetSize,
                    message: 'san-cli.largeAssetSize.label',
                    description: 'san-cli.largeAssetSize.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.sourceMap',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.sourceMap,
                    message: 'san-cli.css.sourceMap.label',
                    description: 'san-cli.css.sourceMap.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.cssPreprocessor',
                    type: 'input',
                    default: 'less',
                    value: data.san && data.san.css && data.san.css.cssPreprocessor,
                    message: 'san-cli.css.cssPreprocessor.label',
                    description: 'san-cli.css.cssPreprocessor.description',
                    group: 'san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.extract',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.extract,
                    message: 'san-cli.css.extract.label',
                    description: 'san-cli.css.extract.description',
                    group: 'san-cli.groups.css',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.requireModuleExtension',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.requireModuleExtension,
                    message: 'san-cli.css.requireModuleExtension.label',
                    description: 'san-cli.css.requireModuleExtension.description',
                    group: 'san-cli.groups.css',
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
