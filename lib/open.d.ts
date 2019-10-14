/**
 * Promise which can be resolved or rejected from outer scope.
 * Also, resolved, rejected value is cached for later use.
 */
declare class OpenPromise<T> extends Promise<T> {
    static readonly PENDING: string;
    static readonly FULFILED: string;
    static readonly REJECTED: string;
    private pWraper;
    private prev;
    private nResolve;
    private nReject;
    private _resolved;
    private _rejected;
    private _index;
    /**
     * Returns new OpenPromise.
     * @param executor
     */
    constructor(executor: ((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void));
    /**
     * Returns new OpenPromise. Calling resolve, reject function on chained promise will always be invoked to first pending promise.
     * @param onfulfilled function
     * @param onrejected function
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): OpenPromise<TResult1 | TResult2>;
    /**
     * Returns OpenPromise.
     * Calling resolve, reject function on chained promise will always be invoked to first pending promise.
     * @param onrejected function
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): OpenPromise<T | TResult>;
    /**
     * Resolves first pending Promise.
     * @param value resolved value.
     */
    resolve(value?: T | PromiseLike<T>): void;
    /**
     * Rejects first pending Promise.
     * @param cause reject cause.
     */
    reject(cause?: any): void;
    /**
     * Get fisrt non-chained Promise(begin of Chain)
     */
    readonly root: this;
    /**
     * Get first pending promise.
     * If all Promise is resolved|rejected, returns current resolved|rejected  Promise.
     * Usally for internal hierachy call.
     */
    readonly pendPoint: this;
    /**
     * Get prior Promise. Getting  previous Promise and resolving|rejecting it might leave
     * unresolved promise forever. Use it wisely.
     */
    /**
    * Set prior Promise. Setting it by manually might leave  promise pending forever.
    * Internal use only.
    */
    previous: this | undefined;
    /**
     * Get current state of Promise.
     */
    readonly state: string;
    readonly index: number;
    /**
     * Returns resolved value.
     */
    readonly resolved: T | PromiseLike<T> | undefined;
    /**
     * Returns rejected cause.
     */
    readonly rejected: any;
    /**
     * Returns pending queue of promise.
     */
    readonly queue: Array<this>;
}
export { OpenPromise };
