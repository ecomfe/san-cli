/**
 * @file content
 * @author ksky521
 */

import {Component} from 'san';
export default class Content extends Component {
    static template = /* html */ `
        <article id="content">
            <content/>
            <aside class="toc">{{toc.html|raw}}</aside>
        </article>
    `;
    getComponentType(aNode) {
        if (aNode.tagName === 'content') {
            return this.data.get('content');
        }
    }
}
