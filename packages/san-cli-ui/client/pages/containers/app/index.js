/**
 * @file 项目容器组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {logo, CWD} from '../../const';
import {Link} from 'san-router';
import {Button} from 'santd';
import 'santd/es/button/style';
import './index.less';

export default class App extends Component {

    static template = /* html */`
        <div class="app" style="height: {{height}}px">
            <img class="logo" src="{{logo}}"/>
            <h1 class="title">{{title}}</h1>
            <div class="btn-group">
                <r-link to="/project/select">
                    <s-button type="primary">select san project</s-button>
                </r-link>
                <r-link to="/project/create">
                    <s-button type="primary">create san project</s-button>
                </r-link>
            </div>
        </div>
    `;
    static components = {
        'r-link': Link,
        's-button': Button
    };
    apollo = {
        apolloData: 'a'
    }
    initData() {
        return {
            logo,
            title: 'San CLI',
            cwd: '~',
            height: window.screen.availHeight
        };
    }

    attached() {
        // simple query demo
        this.$apollo.query(CWD)
            .then(data => {
                this.data.set('cwd', data.data.cwd);
            })
            .catch(error => console.error(error));
    }
}

