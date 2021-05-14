module.exports = {
    helpers: {
        if_or: (v1, v2, options) => {
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
            type: 'select',
            message: '选择模板引擎',
            choices: [
                {
                    title: '使用Smarty',
                    value: 'smarty'
                },
                {
                    title: '纯 HTML',
                    value: 'html'
                }
            ]
        },
        enableMatrix: {
            type: 'select',
            message: '是否启用matrix-loader？',
            choices: [
                {
                    title: '不启用 (默认)',
                    value: 'false'
                },
                {
                    title: '启用',
                    value: 'true'
                }
            ]
        }
    }
};
