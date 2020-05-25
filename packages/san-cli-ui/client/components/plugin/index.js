/**
 * @file 插件
 * @author
 */

import {Component} from 'san';
import {Button, Spin, Icon} from 'santd';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Plugin extends Component {
    static template = /* html */`
        <div class="plugin">
            插件
        </div>
    `;

    static components = {
    };

    initData() {
        return {
        };
    }

    attached() {
    }
}
