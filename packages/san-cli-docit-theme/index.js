import './styles/index.less';
import {Component} from 'san';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Content from './components/Content';

class Index extends Component {
    static template = /*html*/ `
        <div id="site">
            <header/>
            <sidebar/>
            <content content="{{content}}" toc="{{toc}}"/>
        </div>
    `;
    static components = {
        header: Header,
        sidebar: Sidebar,
        content: Content
    };
    initData() {
        return {
            content: $content,
            toc: $toc
        }
    }
    attached() {
        [].slice.call(document.querySelectorAll('#sidebar a'), 0).find(anode => {
            if (anode.href === location.href) {
                anode.parentNode.classList.add('active');
                return true;
            }
            return false;
        });
    }
}

const app = new Index();
app.attach(document.getElementById('app'));
