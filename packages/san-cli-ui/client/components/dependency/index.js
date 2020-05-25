/**
 * @file 依赖
 * @author
 */

import {Component} from 'san';
import {Button, Spin, Icon} from 'santd';
import 'santd/es/input/style';
import 'santd/es/button/style';
import 'santd/es/spin/style';
import './index.less';

export default class Dependency extends Component {
    static template = /* html */`
        <div class="dependency">
            依赖
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
