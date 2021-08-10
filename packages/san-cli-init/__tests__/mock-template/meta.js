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
        },
        demo: {
            type: 'confirm',
            message: '安装demo示例？'
        },
        demoType: {
            when: 'demo',
            type: 'list',
            message: '选择示例代码类型：',
            choices: [
                {
                    title: 'san-store (推荐)',  // 兼容 prompts
                    name: 'san-store (推荐)',
                    value: 'store',
                    short: 'san-store'
                },
                {
                    title: 'normal',    // 兼容 prompts
                    name: 'normal',
                    value: 'normal',
                    short: 'normal'
                }
            ]
        }
    }
};
