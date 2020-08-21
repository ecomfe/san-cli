/**
 * @file 重新定义san.Component组件
 *       向san组件进行扩展组件，注入默认的组件(如：santd)
 * @author jinzhan
*/

import {Component} from 'san';
import defaultComponents from './components';
import mixin from '@lib/san-mixin';
import events from './mixins/events';
import apollo from './mixins/apollo';
import sharedData from './mixins/shared-data';
import pluginAction from './mixins/plugin-action';
import localization from './mixins/localization';


export default class SubComponent extends Component {
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
}


// 注入全局方法
mixin(SubComponent, {
    // 导入语言包: this.$t
    ...localization,

    /**
     * 导入事件总线:
     *  this.$emit
     *  this.$on
    */
    ...events,

    /**
     * 导入插件回调方法:
     *  this.$callPluginAction
     *  this.$onPluginActionCalled
     *  this.$onPluginActionResolved
    */
    ...pluginAction,

    // 导入$apollo对象: this.$apollo
    ...apollo,

    /**
     * 导入sharedData相关得方法
     *  ($getProjectId)
     *  $getSharedData
     *  $watchSharedData
     *  $setSharedData
    */
    ...sharedData
});
