/**
 * @file 容器组件
 * @author ksky521 <ksky521@gmail.com>
 */

import {Component} from 'san';
import './app.less';
import logo from '@assets/logo.svg';
export default class App extends Component {

    static template = `
    <div class="main">
        <img class="logo" src="\{\{logo}}"/>
        <h1>\{\{title}}</h1>
        <h2>Hello world, I am OK~</h2>
    </div>

    `;

    initData() {
        return {
            logo,
            title: 'San CLI'
        };
    }
}

