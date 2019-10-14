"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Promise which can be resolved or rejected from outer scope.
 * Also, resolved, rejected value is cached for later use.
 */
class OpenPromise extends Promise {
    /**
     * Returns new OpenPromise.
     * @param executor
     */
    constructor(executor) {
        let nresolve = undefined, nreject = undefined, pWraper = { state: OpenPromise.PENDING };
        super((resolve, reject) => {
            nresolve = new Proxy(resolve, {
                apply(target, thisArg, argumentsList) {
                    pWraper.state = OpenPromise.FULFILED;
                    return Reflect.apply(resolve, thisArg, argumentsList);
                }
            });
            nreject = new Proxy(reject, {
                apply(target, thisArg, argumentsList) {
                    pWraper.state = OpenPromise.REJECTED;
                    return Reflect.apply(reject, thisArg, argumentsList);
                }
            });
            executor(nresolve, nreject);
        });
        this.nResolve = nresolve;
        this.nReject = nreject;
        this.pWraper = pWraper;
        this._index = 0;
    }
    /**
     * Returns new OpenPromise. Calling resolve, reject function on chained promise will always be invoked to first pending promise.
     * @param onfulfilled function
     * @param onrejected function
     */
    then(onfulfilled, onrejected) {
        const chained = super.then(onfulfilled, onrejected);
        chained.previous = this;
        return chained;
    }
    /**
     * Returns OpenPromise.
     * Calling resolve, reject function on chained promise will always be invoked to first pending promise.
     * @param onrejected function
     */
    catch(onrejected) {
        const chained = super.catch(onrejected);
        chained.previous = this;
        return chained;
    }
    /**
     * Resolves first pending Promise.
     * @param value resolved value.
     */
    resolve(value) {
        //move to pending point.
        if (this.pendPoint !== this) {
            return this.pendPoint.resolve(value);
        }
        // dereference for garbage collection.
        this.prev = undefined;
        if (this.nResolve) {
            this._resolved = value;
            this.nResolve(value);
        }
    }
    /**
     * Rejects first pending Promise.
     * @param cause reject cause.
     */
    reject(cause) {
        //move to pending point.
        if (this.pendPoint !== this) {
            return this.pendPoint.reject(cause);
        }
        // dereference for garbage collection.
        this.prev = undefined;
        if (this.nReject) {
            this._rejected = cause;
            this.nReject(cause);
        }
    }
    /**
     * Get fisrt non-chained Promise(begin of Chain)
     */
    get root() {
        if (this.prev && this !== this.prev) {
            return this.prev.root;
        }
        return this;
    }
    /**
     * Get first pending promise.
     * If all Promise is resolved|rejected, returns current resolved|rejected  Promise.
     * Usally for internal hierachy call.
     */
    get pendPoint() {
        if (this.prev && this.prev.state === OpenPromise.PENDING) {
            return this.prev.pendPoint;
        }
        return this;
    }
    /**
     * Get prior Promise. Getting  previous Promise and resolving|rejecting it might leave
     * unresolved promise forever. Use it wisely.
     */
    get previous() {
        return this.prev;
    }
    /**
     * Set prior Promise. Setting it by manually might leave  promise pending forever.
     * Internal use only.
     */
    set previous(prev) {
        //skip if previous is already set.
        if (this.prev || prev === this)
            return;
        this.prev = prev;
        if (prev) {
            this._index = prev.index + 1;
        }
        else {
            this._index = 0;
        }
    }
    /**
     * Get current state of Promise.
     */
    get state() {
        return this.pWraper.state;
    }
    get index() {
        return this._index;
    }
    /**
     * Returns resolved value.
     */
    get resolved() {
        return this._resolved;
    }
    /**
     * Returns rejected cause.
     */
    get rejected() {
        return this._rejected;
    }
    /**
     * Returns pending queue of promise.
     */
    get queue() {
        let queue = [], current = this;
        while (current !== undefined) {
            queue.unshift(current);
            current = current.previous;
        }
        return queue;
    }
}
OpenPromise.PENDING = 'pending';
OpenPromise.FULFILED = 'fulfiled';
OpenPromise.REJECTED = 'rejected';
exports.OpenPromise = OpenPromise;
