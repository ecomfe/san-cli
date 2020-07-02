/**
 * @file json对象query化
*/
export const searchParam = args => {
    let params = '';
    if (args === undefined || args === null) {
        return params;
    }
    for (let key in args) {
        if (key !== null && args[key] !== undefined && args.hasOwnProperty(key)) {
            params += params === '' ? '' : '&';
            params += key + '=' + encodeURIComponent(Object.prototype.toString.call(args[key]) === '[object Array]'
                ? JSON.stringify(args[key]) : args[key]);
        }
    }
    return params;
};