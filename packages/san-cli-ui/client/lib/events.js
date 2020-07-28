/**
 * @file 事件总线用于全局事件和跨组件通信
 *       可以理解为组件集中的消息订阅发布
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
// $events() {
//     return {
//         hello(data) {
//             console.log({data});
//         },
//         world(data) {
//             console.log(this.data.get('cwd'), {data});
//         }
//     };
// }

// @发布事件
// this.$emit('hello', {someData});
module.exports = {
    /**
     * 注入到san的声明周期inited方法中，这样方便跨组件拿到数据
     * TODO: 静态方法无法获取到，只能弄成函数的形式，类似这样
    */
    inited() {
        // 寻找组件中的$events方法
        if (this.$events) {
            // 获取对象
            const $events = this.$events.call(this);
            const events = Object.keys($events);
            for (const event of events) {
                $eventBus.on(event, $events[event].bind(this));
            }
        }
    },
    /**
     * 用于发布事件，注意不要和san的emit方法混淆了
     *
     * @param {string} event 事件名称
     * @param {Object} args 会调函数的参数
    */
    $emit(event, args) {
        const callbacks = listeners.get(event) || [];
        for (const callback of callbacks) {
            callback(args);
        }
    },

    /**
     * 手动注入
     *
     * @param {string} event 事件名称
     * @param {Function} callback 跨组件调用的回调方法，要注意this指向问题
    */
    $on(event, callback) {
        $eventBus.on(event, callback.bind(this));
    }
};
