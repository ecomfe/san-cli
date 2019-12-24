import './styles/index.less';
import {Component} from 'san';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Content from './components/Content';
/* global $Page */
class Index extends Component {
    static template = /*html*/ `
        <div id="site">
            <header/>
            <sidebar/>
            <content/>
        </div>
    `;

    static components = {
        header: Header,
        sidebar: Sidebar,
        content: Content
    };
    attached() {
        [].slice.call(document.querySelectorAll('#sidebar a'), 0).map(anode => {
            if (anode.href === location.href) {
                anode.parentNode.classList.add('active');
            }
        });
    }
}

const app = new Index();
app.attach(document.getElementById('app'));
// 添加 title
if ($Page.$matter && $Page.$matter.title) {
    document.title = $Page.$matter.title;
}
