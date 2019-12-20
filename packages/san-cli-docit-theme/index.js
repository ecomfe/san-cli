import './styles/index.less';
import {Component} from 'san';

class Index extends Component {
    static template = /*html*/ `
        <div id="site">
            <content/>
        </div>
    `;

    static components = {
        content: $Page
    };
}
console.log($Page.$headers, $Page.$matter);

// import sidebar from '@sidebar';

// console.log('sidebar',sidebar)

const app = new Index();
app.attach(document.getElementById('app'));
