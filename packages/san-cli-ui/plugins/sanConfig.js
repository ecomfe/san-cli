/**
 * @file config
 * @author zttonly
 */

module.exports = api => {
    const iconUrl = (process.env.SAN_CLI_UI_DEV ? `http://localhost:${process.env.SAN_APP_GRAPHQL_PORT}` : '')
        + '/public/san.svg';
    api.registerConfig({
        id: 'san.san-cli',
        name: 'San CLI',
        description: 'configuration.san-cli.description',
        link: 'https://ecomfe.github.io/san-cli/#/config',
        files: {
            san: {
                js: ['san.config.js']
            }
        },
        icon: iconUrl,
        onRead: ({data}) => ({
            prompts: [
                {
                    name: 'publicPath',
                    type: 'input',
                    default: '/',
                    value: data.san && data.san.publicPath,
                    message: 'configuration.san-cli.publicPath.label',
                    description: 'configuration.san-cli.publicPath.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'outputDir',
                    type: 'input',
                    default: 'dist',
                    value: data.san && data.san.outputDir,
                    validate: input => !!input,
                    message: 'configuration.san-cli.outputDir.label',
                    description: 'configuration.san-cli.outputDir.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'assetsDir',
                    type: 'input',
                    default: '',
                    value: data.san && data.san.assetsDir,
                    message: 'configuration.san-cli.assetsDir.label',
                    description: 'configuration.san-cli.assetsDir.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'pages',
                    type: 'input',
                    default: {},
                    value: data.san && data.san.pages,
                    message: 'configuration.san-cli.pages.label',
                    description: 'configuration.san-cli.pages.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'copy',
                    type: 'input',
                    default: {},
                    value: data.san && data.san.copy,
                    message: 'configuration.san-cli.copy.label',
                    description: 'configuration.san-cli.copy.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'sourceMap',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.sourceMap,
                    message: 'configuration.san-cli.sourceMap.label',
                    description: 'configuration.san-cli.sourceMap.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'filenameHashing',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.filenameHashing,
                    message: 'configuration.san-cli.filenameHashing.label',
                    description: 'configuration.san-cli.filenameHashing.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'largeAssetSize',
                    type: 'input',
                    default: 4e3,
                    value: data.san && data.san.largeAssetSize,
                    message: 'configuration.san-cli.largeAssetSize.label',
                    description: 'configuration.san-cli.largeAssetSize.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.sourceMap',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.sourceMap,
                    message: 'configuration.san-cli.css.sourceMap.label',
                    description: 'configuration.san-cli.css.sourceMap.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.cssPreprocessor',
                    type: 'input',
                    default: 'less',
                    value: data.san && data.san.css && data.san.css.cssPreprocessor,
                    message: 'configuration.san-cli.css.cssPreprocessor.label',
                    description: 'configuration.san-cli.css.cssPreprocessor.description',
                    group: 'configuration.san-cli.groups.general',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.extract',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.extract,
                    message: 'configuration.san-cli.css.extract.label',
                    description: 'configuration.san-cli.css.extract.description',
                    group: 'configuration.san-cli.groups.css',
                    link: 'https://ecomfe.github.io/san-cli/#/config'
                },
                {
                    name: 'css.requireModuleExtension',
                    type: 'confirm',
                    default: true,
                    value: data.san && data.san.css && data.san.css.requireModuleExtension,
                    message: 'configuration.san-cli.css.requireModuleExtension.label',
                    description: 'configuration.san-cli.css.requireModuleExtension.description',
                    group: 'configuration.san-cli.groups.css',
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
