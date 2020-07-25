/**
 * @file 重新定义san.Component组件
 *       向san组件进行扩展组件，注入默认的组件(如：santd)
 * @author jinzhan
*/

import {Component} from 'san';
import defaultComponents from './components';
import createClient from '@lib/apollo-client';
import mixin from '@lib/san-mixin';
import localization from '@lib/localization';
// import eventBus from '@lib/event-bus';
import pluginAction from '@lib/plugin-action';

class SuperComponent extends Component {
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

// 调试模式使用package.json中定义的APP_GRAPHQL_ENDPOINT
// eslint-disable-next-line no-undef
const graphqlEndpoint = APP_GRAPHQL_ENDPOINT || `ws://${location.host}/graphql`;

// 注入全局方法
mixin(SuperComponent, {
    // 导入语言包
    $t: localization,

    // TODO: 这里可以导入事件总线
    // ...eventBus

    // 导入插件回调方法
    ...pluginAction,

    // 导入$apollo对象
    $apollo: createClient(graphqlEndpoint),
});

export default SuperComponent;