module.exports = {
    helpers: {
        /* eslint-disable fecs-camelcase */
        if_or: (v1, v2, options) => {
            /* eslint-enable fecs-camelcase */
            if (v1 || v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    },
    filters: {
        '**/test.js': 'tplEngine!=="html"'
    },
    prompts: {
        tplEngine: {
            type: 'list',
            message: '选择模板引擎',
            choices: [
                {
                    name: '使用Smarty',
                    value: 'smarty',
                    short: 'Smarty'
                },
                {
                    name: '纯 HTML',
                    value: 'html',
                    short: 'HTML'
                }
            ]
        },
        enableMatrix: {
            type: 'list',
            message: '是否启用matrix-loader？',
            choices: [
                {
                    name: '不启用 (默认)',
                    value: 'false'
                },
                {
                    name: '启用',
                    value: 'true'
                }
            ]
        }
    }
};
