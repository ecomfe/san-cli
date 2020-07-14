/**
 * 内容的flush节流方法
 * @author jinzhan
*/
module.exports = (action, {maxTime = 300, maxSize = 50} = {}) => {
    let queue = '';
    let size = 0;
    let time = Date.now();
    let timer;

    const flush = () => {
        clearTimeout(timer);
        if (!size) {
            return;
        }
        action(queue);
        queue = '';
        size = 0;
        time = Date.now();
    };

    const add = string => {
        queue += string;
        size++;
        if (size === maxSize || Date.now() > time + maxTime) {
            flush();
        }
        else {
            clearTimeout(timer);
            timer = setTimeout(flush, maxTime);
        }
    };

    return {
        add,
        flush
    };
};

