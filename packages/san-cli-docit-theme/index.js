import './styles/index.less';
import {Component} from 'san';
import Content from './components/Content';
/* global $content, $toc, $navbar, $link, $sidebar, $config, $matter */
class Index extends Component {
    static template = /*html*/ `
        <div id="site">
            <header id="header">
                <a href="{{config.rootUrl}}" class="logo">{{config.siteName}}</a>
                {{navbarHtml | raw}}
            </header>
            <aside id="sidebar">
                {{sidebarHtml | raw}}
            </aside>
            <content content="{{content}}" toc="{{toc}}"/>
        </div>
    `;
    static components = {
        content: Content
    };
    initData() {
        return {
            config: $config,
            content: $content,
            toc: $toc,
            sidebarHtml: $sidebar,
            navbarHtml: $navbar
        };
    }
}

const app = new Index();
app.attach(document.getElementById('app'));
