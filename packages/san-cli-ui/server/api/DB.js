/**
 * @file 对lowdb进行简单的封装，
 *       目的是减少set/get的.value()和.write()这层调用
 *
 * @author jinzhan
*/

class DB {
    /**
     * @param {Object} db lowddb的实例
     * @param {string} namespace 获取一个带命名空间的操作实例
    */
    constructor(db, namespace = '') {
        this.db = db;
        this.namespace = namespace;
    }
    get(key) {
        return this.db.get(this.namespace + key).value();
    }
    set(key, value) {
        this.db.set(this.namespace + key, value).write();
        return this;
    }
}

module.exports = DB;
