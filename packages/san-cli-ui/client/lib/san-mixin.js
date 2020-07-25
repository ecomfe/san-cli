/**
 * @file 往san的组件中添加全局方法（注意：san dev下会引起控制台的warning）
 * @author jinzhan
 */

export default (Component, mixins) => {
    const keys = Object.keys(mixins);
    for (const key of keys) {
        const original = Component.prototype[key];
        const mixin = mixins[key];
        switch (key) {
            // 处理initData数据
            case 'initData':
                Component.prototype[key] = function () {
                    const originalData = original ? original.call(this) : {};
                    // initData mixin可以是对象类型，也可以是函数
                    const mixinData = typeof mixin === 'function' ? mixin.call(this) : mixin;
                    return Object.assign(mixinData, originalData);
                };
                break;

            // 处理生命周期钩子
            // @see san生命周期: https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F
            case 'compiled':
            case 'inited':
            case 'created':
            case 'attached':
            case 'detached':
            case 'disposed':
            case 'updated':
                Component.prototype[key] = function () {
                    mixin.call(this);
                    original && original.call(this);
                };
                break;

            // 处理组件成员对象
            case 'components':
                // 忽略：static方法不能被mixin，详见./san-component.js
                break;
            case 'filters':
            case 'computed':
            case 'messages':
                Component.prototype[key] = Object.assign(mixin, original);
                break;

                // eventBus事件总线注入，TODO: ouch~, 此路不通
                // case '$bus':
                //     Object.defineProperty(Component.prototype, 'eventBus', {
                //         set(map) {
                //             console.log(map);
                //             return map;
                //         }
                //     });
                // break;

                // 无法被继承的属性和自定义方法，和default走同样的逻辑
                // case 'template':
                // case 'trimWhitespace':
                // case 'delimiters':
                //    Component.prototype[key] = original || mixin;
                // break;

            // 自定义方法
            default:
                Component.prototype[key] = original || mixin;
        }
    }
    return Component;
};
