"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timeout_1 = require("../lib/timeout");
const TEST = 'TEST';
const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';
let testStage1 = 'Test1 : Resolve inside promise.';
let test1 = new timeout_1.TimeoutPromise((resolve) => {
    console.info(testStage1, TEST);
    resolve('');
}, 10).then(result => {
    console.info(testStage1, SUCCESS, test1.state);
}, 10).catch(err => {
    console.error(testStage1, FAIL);
}, 10);
let testStage2 = 'Test2 : Reject by timeout ';
let test2 = new timeout_1.TimeoutPromise((resolve, reject) => {
    console.info(testStage2, TEST);
}, 10).then(result => {
    console.error(testStage2, FAIL);
}, 10).catch(err => {
    console.info(testStage2, SUCCESS, test2.state);
}, 10);
setTimeout(() => {
    console.log('done');
}, 1000);
