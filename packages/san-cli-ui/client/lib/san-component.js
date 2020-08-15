/**
 * @file 重新定义san.Component组件
 *       向san组件进行扩展组件，注入默认的组件(如：santd)
 * @author jinzhan
*/

import {Component} from 'san';
import defaultComponents from './components';
import apolloClient from '@lib/apollo-client';
import mixin from '@lib/san-mixin';
import localization from '@lib/localization';
import events from '@lib/events';
import pluginAction from '@lib/plugin-action';

class SubComponent extends Component {
    constructor(options) {
        super(options);
        this.defaultComponents = defaultComponents;
    }

    get components() {
        const components = this.customComponents || {};
        return Object.assign(components, this.defaultComponents);
    }

    set components(comp) {
        this.customComponents = comp;
    }
};


// 注入全局方法
mixin(SubComponent, {
    // 导入语言包
    $t: localization,

    // TODO: 这里可以导入事件总线
    ...events,

    // 导入插件回调方法
    ...pluginAction,

    // 导入$apollo对象
    $apollo: apolloClient
});

export default SubComponent;
