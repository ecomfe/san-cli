/**
 * @file 深度get/get，类似?.运算符
 * @author jinzhan
*/

const deepGet = (obj, ...keys) => {
    const isMap = obj instanceof Map || obj instanceof WeakMap;
    if (isMap) {
        const Klass = obj instanceof Map ? Map : WeakMap;
        keys.reduce((cur, next) => (cur || new Klass()).get(next), obj);
    }
    else {
        keys.reduce((cur, next) => (cur || {})[next], obj);
    }
};

/**
 * 深度设置对象值
 *
 * @param {Object|Map|WeakMap} 要设置的对象
 * @param {Array|string} 支持类似'a.b.c'这样的字符串，或者数组['a', 'b']
*/
const deepSet = (obj, keys, val) => {
    if (!Array.isArray(keys)) {
        keys = keys.split('.');
    }
    const lastKey = keys.pop();
    const isMap = obj instanceof Map || obj instanceof WeakMap;
    if (isMap) {
        const Klass = obj instanceof Map ? Map : WeakMap;
        const target = keys.reduce((cur, next) => {
            let temp = cur.get(next);
            if (!temp) {
                temp = new Klass();
                cur.set(next, temp);
            }
            return temp;
        }, obj);
        target.set(lastKey, val);
    }
    else {
        const target = keys.reduce((cur, next) => (cur[next] || (cur[next] = {})), obj);
        target[lastKey] = val;
    }
    return obj;
};

module.exports = {
    deepGet,
    deepSet
};
