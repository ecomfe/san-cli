/**
 * @file FolderExplorer组件
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import {Component} from 'san';
import {Button} from 'santd';
import 'santd/es/button/style';
import './index.less';

export default class FolderExplorer extends Component {

    static template = /* html */`
        <div class="folder-explorer">
            目录浏览
            <div class="content">
                当前目录: {{cwd}}
            </div>
            <div class="actions-bar">
                <s-button type="primary" icon="add">在此创建新目录</s-button>
            </div>
        </div>
    `;

    static components = {
        's-button': Button
    };
    initData() {
        return {
        };
    }

    attached() {
    }
}
