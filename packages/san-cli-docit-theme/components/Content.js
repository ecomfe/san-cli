/**
 * @file content
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

import {Component} from 'san';

export default class Content extends Component {
    static template = /* html */ `
        <article id="content">
            <content/>
        </article>
    `;
    static components = {
        content: $Page
    };
}
