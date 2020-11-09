import {Component} from 'san';
const SAN_DOCIT = window.SAN_DOCIT;
/* global $content, $toc, $navbar, $link, $sidebar, $config, $matter */
class Index extends Component {
    static template = `
    <div id="site">
        <header id="header">
            <a href="{{config.rootUrl}}" class="logo">{{config.siteName}}</a>
            {{navbar | raw}}
        </header>
        <aside id="sidebar">
            {{sidebar | raw}}
        </aside>
        <article id="content">
            {{content | raw}}
            <aside class="toc">{{toc.html | raw}}</aside>
        </article>
    </div>
    `;
    initData() {
        return {
            config: SAN_DOCIT.config,
            content: SAN_DOCIT.content,
            toc: SAN_DOCIT.toc,
            sidebar: SAN_DOCIT.sidebar,
            navbar: SAN_DOCIT.navbar
        };
    }
}

const app = new Index();
app.attach(document.getElementById('app'));
