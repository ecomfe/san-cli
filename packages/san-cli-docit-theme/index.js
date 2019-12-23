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
            <content/>
        </div>
    `;

    static components = {
        header: Header,
        sidebar: Sidebar,
        content: Content
    };
}

const app = new Index();
app.attach(document.getElementById('app'));
