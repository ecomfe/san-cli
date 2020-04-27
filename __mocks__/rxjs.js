/**
 * @file rxjs单测mock
 * @author yanyiting
 */

const rxjs = {
    Observable: jest.fn(async fn => {
        let result = {
            next: [],
            error: '',
            complete: false
        };
        const observer = {
            next: jest.fn(value => {result.next.push(value);}),
            error: jest.fn(value => {result.error = value;}),
            complete: jest.fn(() => {result.complete = true;})
        };
        await fn(observer);
        return Promise.resolve(result);
    })
};

module.exports = new Proxy(rxjs, {
    get: (target, property) => {
        if (property in target) {
            return target[property];
        }
        else {
            return jest.fn();
        }
    }
});
