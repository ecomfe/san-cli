/**
 * 页面的 main.js
 * @file Created on Thu Nov 15 2018
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
import './styles/index.less';

import {defineComponent, Component} from 'san';
import {router} from 'san-router';
import getComponentClass from './CodeBox';
import compiler from './compiler';
import entries from '~entry';

const CodeBox = getComponentClass(false);
if (typeof entries === 'object') {
    const components = {};
    const template = [];

    Object.keys(entries).forEach(name => {
        // eslint-disable-next-line
        let {code, hasCode, text, content, sanComponent} = entries[name];
        text = compiler(text);
        if (hasCode && code) {
            code = `<pre><code class="language-html">${code.replace(/</g, '&lt;')}</code></pre>`;
        }
        if (hasCode && sanComponent) {
            router.add({
                rule: `/${name}`,
                Component: sanComponent instanceof Component ? sanComponent : defineComponent(sanComponent),
                target: 'body'
            });
        }

        let BoxComponent;
        if (hasCode) {
            BoxComponent = class extends CodeBox {
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

    router.add({
        rule: '/',
        Component: defineComponent({
            template: `<div id="app">${template.join('')}</div>`,
            components
        }),
        target: 'body'
    });
}

router.start();
