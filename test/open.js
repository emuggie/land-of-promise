"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const open_1 = require("../lib/open");
const TEST = 'TEST';
const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';
let testStage1 = 'Test1 : Resolve inside promise.';
let test1 = new open_1.OpenPromise((resolve) => {
    console.info(testStage1, TEST);
    resolve('');
}).then(result => {
    console.info(testStage1, SUCCESS, test1.state);
}).catch(err => {
    console.error(testStage1, FAIL);
});
console.log(test1.queue);
let testStage2 = 'Test2 : Reject inside promise.';
let test2 = new open_1.OpenPromise((resolve, reject) => {
    console.info(testStage2, TEST);
    reject('reject');
}).then(result => {
    console.error(testStage2, FAIL);
}).catch(err => {
    console.info(testStage2, SUCCESS, test2.state);
});
console.log(test2.queue);
let testStage3 = 'Test3 : Resolve outside promise.';
let test3 = new open_1.OpenPromise((resolve, reject) => {
    console.info(testStage3, TEST);
}).then(result => {
    console.info(testStage3, SUCCESS);
}).catch(err => {
    console.error(testStage3, FAIL, err);
});
test3.resolve('test');
let testStage4 = 'Test4 : Reject outside promise.';
let test4 = new open_1.OpenPromise((resolve, reject) => {
    console.info(testStage4, TEST);
}).then(result => {
    console.error(testStage4, FAIL);
}).catch(err => {
    console.info(testStage4, SUCCESS, test4.state);
    console.info(test1.state, test2.state, test3.state, test4.state);
});
test4.reject('test');
