import './styles/index.less';
import {Component} from 'san';
import Content from './components/Content';
/* global $content, $toc, $navbar, $link, $sidebar, $config, $matter */
class Index extends Component {
    static template = /*html*/ `
        <div id="single">
            <content content="{{content}}" toc="{{toc}}"/>
        </div>
    `;
    static components = {
        content: Content
    };
    initData() {
        return {
            content: $content,
            toc: $toc
        };
    }
}

const app = new Index();
app.attach(document.getElementById('app'));
