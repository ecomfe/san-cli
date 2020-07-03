/**
 * @file 配置详情组件
 * @author zttonly
 */

import {Component} from 'san';
import {layoutOneThird} from '@lib/const';
import {Icon, Radio, Button} from 'santd';
import 'santd/es/icon/style';
import 'santd/es/radio/style';
import 'santd/es/button/style';
import './index.less';
import PromptsList from '../prompts-form';

export default class ConfigDetail extends Component {

    static template = /* html */`
        <div class="config-detail">
            <div class="tabs" s-if="config.tabs && config.tabs.length > 0">
                <s-radiogroup s-if="config.tabs.length > 1" on-change="handleSizeChange" name="size">
                    <s-radiobutton s-for="tab in config.tabs">{{tab.label}}</s-radiobutton>
                </s-radiogroup>
                <c-prompts s-ref="configForm"
                    form-item-layout="{{formItemLayout}}"
                    hide-submit-btn="{{true}}"
                    prompts="{=prompts=}"
                    on-submit="onSubmit"
                />
            </div>
            <div class="actions-bar">
                <s-button class="more" size="large">{{$t('config.actions.more')}}</s-button>
                <s-button class="cancel" size="large">{{$t('config.actions.cancel')}}</s-button>
                <s-button s-if="hasPromptsChanged" type="primary" class="refresh" size="large">
                    {{$t('config.actions.refresh')}}
                </s-button>
                <s-button s-else type="primary" class="save" size="large">{{$t('config.actions.save')}}</s-button>
            </div>
        </div>
    `;

    static computed = {
        hasPromptsChanged() {
            let tabsChangeMap = this.data.get('tabsChangeMap');
            return Object.values(tabsChangeMap).every(val => val);
        },
        prompts() {
            let currentTab = this.data.get('currentTab');
            let tabs = this.data.get('config.tabs');
            return tabs ? tabs[currentTab].prompts.filter(p => p.visible) : [];
        }
    };

    initData() {
        return {
            config: {},
            tabsChangeMap: {},
            currentTab: 0,
            selected: false,
            formItemLayout: layoutOneThird
        };
    }

    static components = {
        's-icon': Icon,
        's-radiogroup': Radio.Group,
        's-radiobutton': Radio.Button,
        's-button': Button,
        'c-prompts': PromptsList
    }
    attached() {
        let tabs = this.data.get('config.tabs') || [];
        let tabsChangeMap = tabs.reduce((res, tab) => {
            res[tab.id] = false;
            return res;
        }, {});
        this.data.set('tabsChangeMap', tabsChangeMap);
    }
    submit(data) {
        this.data.set('formData', data);
        this.ref('configForm').handleSubmit();
    }
    onSubmit(data) {
        console.log(data);
    }
}
