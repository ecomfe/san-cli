/**
 * @file rxjs单测mock
 */

const Observable = jest.fn(async fn => {
    let result = {
        next: [],
        error: '',
        complete: false
    };
    const observer = {
        next: jest.fn(value => {result.next.push(value)}),
        error: jest.fn(value => {result.error = value}),
        complete: jest.fn(() => {result.complete = true})
    };
    await fn(observer);
    return Promise.resolve(result);
});

exports.Observable = Observable;
