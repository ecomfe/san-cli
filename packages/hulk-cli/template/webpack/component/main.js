/**
 * 页面的 main.js
 * @file Created on Thu Nov 15 2018
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

import './styles/index.less';
import {defineComponent} from 'san';
import getComponentClass from './CodeBox';
import compiler from './compiler';
import entries from '~entry';

const CodeBox = getComponentClass();

const components = {};
const template = [];
if (Array.isArray(entries) && entries.length) {
    entries
        .map(({code, hasCode, text, sanComponent}) => {
            // eslint-disable-line
            if (hasCode && code) {
                code = `<pre><code class="language-html">${code.replace(/</g, '&lt;')}</code></pre>`;
            }

            text = compiler(text);
            if (hasCode) {
                return class extends CodeBox {
                    static components = {
                        'code-preview': sanComponent
                    };
                    initData() {
                        return {
                            text,
                            code,
                            isExpand: false
                        };
                    }
                };
            } else {
                const MarkdownBox = defineComponent({
                    template: `<section class="markdown">${text}</section>`
                });
                return MarkdownBox;
            }
        })
        .forEach((instance, i) => {
            components[`ui-${i}`] = instance;
            template.push(`<ui-${i}/>`);
        });
} else if (typeof entries === 'object') {
    Object.keys(entries).forEach(name => {
        let {code, hasCode, text, sanComponent} = entries[name];
        if (hasCode && code) {
            code = `<pre><code class="language-html">${code.replace(/</g, '&lt;')}</code></pre>`;
        }

        text = compiler(text);
        let BoxComponent;
        if (hasCode) {
            BoxComponent = class extends CodeBox {
                static components = {
                    'code-preview': sanComponent
                };
                initData() {
                    return {
                        text,
                        code,
                        isExpand: false
                    };
                }
            };
        } else {
            BoxComponent = defineComponent({
                template: `<section class="markdown">${text}</section>`
            });
        }
        components[name] = BoxComponent;
        template.push(`<${name}/>`);
    });
}

const AppC = defineComponent({
    template: `<div id="app">${template.join('')}</div>`,
    components
});

const app = new AppC();
app.attach(document.body);
