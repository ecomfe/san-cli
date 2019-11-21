/**
 * @file san config for profile
 */

module.exports = {
    enableMatrix: {{enableMatrix}},
    // 这是多页面配置
    pages:{
        {{#if_eq tplEngine "smarty"}}
        index: {
            entry: './src/pages/index/index.js',
            template: './template/index/index.tpl',
            filename: 'index/index.tpl'
        }
        {{/if_eq}}
        {{#if_eq tplEngine "html"}}
        index: {
            entry: './src/pages/index/index.js',
            template: './pages.template.ejs',
            filename: 'index/index.html'
        }
        {{/if_eq}}
    }
};
