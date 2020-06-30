/**
 * @file ConfigDetail组件
 * @author zttonly
 */

import {Component} from 'san';
import {Icon, Radio} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/radio/style';
import './index.less';

export default class ConfigDetail extends Component {

    static template = /* html */`
        <div class="config-detail">
            <s-radiogroup on-change="handleSizeChange" name="size">
                <s-radiobutton s-for="tab in configuration.tabs">{{tab.label}}</s-radiobutton>
            </s-radiogroup>
            <prompts-list
                prompts="{=visiblePrompts=}"
                on-answer="answerPrompt"
            />
        </div>
    `;
    initData() {
        return {
            name: '',
            description: '',
            link: '',
            selected: false
        };
    }

    static components = {
        's-icon': Icon,
        's-radiogroup': Radio.Group,
        's-radiobutton': Radio.Button
    }
    attached() {
    }
}
