/**
 * @file header
 * @author ksky521
 */

import {Component} from 'san';
import navHtml from '@navbar';
import sitedata from '@sitedata';
export default class Header extends Component {
    static template = /* html */ `
        <header id="header">
            <a href="/" class="logo">{{sitedata.title}}</a>
            {{nav | raw}}
        </header>
    `;
    initData() {
        return {
            nav: navHtml,
            sitedata: sitedata || {
                title: 'San Docit'
            }
        };
    }
}
