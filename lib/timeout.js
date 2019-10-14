"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const open_1 = require("./open");
/**
 * Extended from OpenPromise
 * , TimeoutPromise has timeout feature which rejects pending Promise after given miliseconds.
 */
class TimeoutPromise extends open_1.OpenPromise {
    /**
     *
     * @param executor
     * @param timeout timeout in miliseconds.
     */
    constructor(executor, timeout = TimeoutPromise.timeout) {
        super(executor);
        this.setTimeout(timeout);
    }
    /**
     *
     * @param onfulfilled
     * @param onrejected onrejected function or timeout miliseconds. for supporting simlplified
     * @param timeout timeout in miliseconds.
     * @example new TimeoutPromise().then((result)=>{},1000).catch((err)=>{},10)
     */
    then(onfulfilled, onrejected, timeout = TimeoutPromise.timeout) {
        if (typeof onrejected === 'number') {
            timeout = onrejected;
            onrejected = null;
        }
        let nextChain, proxyHandler = {
            apply(target, thisArg, argumentsList) {
                if (nextChain) {
                    nextChain.setTimeout(timeout);
                }
                return Reflect.apply(target, thisArg, argumentsList);
            }
        };
        if (onfulfilled)
            onfulfilled = new Proxy(onfulfilled, proxyHandler);
        if (onrejected)
            onrejected = new Proxy(onrejected, proxyHandler);
        nextChain = super.then(onfulfilled, onrejected);
        nextChain.removeTimeout();
        return nextChain;
    }
    /**
     *
     * @param onrejected
     * @param timeout
     */
    catch(onrejected, timeout = TimeoutPromise.timeout) {
        let nextChain, proxyHandler = {
            apply(target, thisArg, argumentsList) {
                if (nextChain) {
                    nextChain.setTimeout(timeout);
                }
                return Reflect.apply(target, thisArg, argumentsList);
            }
        };
        if (onrejected)
            onrejected = new Proxy(onrejected, proxyHandler);
        nextChain = super.catch(onrejected);
        nextChain.removeTimeout();
        return nextChain;
    }
    /**
     * Resolves promise.
     * @param value
     */
    resolve(value) {
        if (this.pendPoint !== this) {
            return this.pendPoint.resolve(value);
        }
        this.removeTimeout();
        super.resolve(value);
    }
    /**
     * Rejects promise.
     * @param cause
     */
    reject(cause) {
        if (this.pendPoint !== this) {
            return this.pendPoint.reject(cause);
        }
        this.removeTimeout();
        super.reject(cause);
    }
    /**
     * Removes existing timeout and set new Timeout.
     * @param timeout timeout miliseconds
     */
    setTimeout(timeout) {
        this.removeTimeout();
        this.timerHandle = setTimeout(this.onTimeout.bind(this), timeout, timeout);
        return this;
    }
    /**
     * Removes existing timeout.
     */
    removeTimeout() {
        if (this.timerHandle) {
            clearTimeout(this.timerHandle);
            this.timerHandle = undefined;
        }
    }
    /**
     * Timeout function which will be called when timeout occurs.
     * Reject promise by default.
     * @param timeout
     */
    onTimeout(timeout) {
        this.reject(`${this.constructor.name} Timeout : ${timeout}`);
    }
}
/**
 * Default timeout in miliseconds.
 */
TimeoutPromise.timeout = 60 * 1000;
exports.TimeoutPromise = TimeoutPromise;
