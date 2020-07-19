/**
 * 事件总线$eventBus，可以理解为组件集中的消息订阅发布
 * 主要用于全局事件和跨组件通讯
 * @author jinzhan
 */

const listeners = new Map();

const $eventBus = {
    on(event, callback) {
        const callbacks = listeners.get(event) || [];
        callbacks.push(callback);
        listeners.set(event, callbacks);
        return () => this.off(callback);
    },
    off(callback) {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }
};

// # DEMO
//
// @订阅事件
// eventBus() {
//     return {
//         hello(data) {
//             console.log({data});
//         },
//         world(data) {
//             console.log(this.data.get('cwd'), {data});
//         }
//     };
// }
//
// @发布事件
// this.$bus('hello', {someData});
module.exports = {
    // 注入到san的声明周期inited方法中，这样方便跨组件拿到数据
    inited() {
        // 寻找组件中的eventBus方法
        // TODO: 静态方法无法获取到，只能弄成函数的形式，类似这样
        if (this.eventBus) {
            // 获取对象
            const bus = this.eventBus.call(this);
            const events = Object.keys(bus);
            for (const event of events) {
                $eventBus.on(event, bus[event].bind(this));
            }
        }
    },
    // emit方法
    // 为了不和san的emit有冲突，使用了$bus方法
    $bus(event, args) {
        const callbacks = listeners.get(event) || [];
        for (const callback of callbacks) {
            callback(args);
        }
    }
};
