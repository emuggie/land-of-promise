import { OpenPromise } from "./open";
/**
 * Extended from OpenPromise
 * , TimeoutPromise has timeout feature which rejects pending Promise after given miliseconds.
 */
declare class TimeoutPromise<T> extends OpenPromise<T> {
    /**
     * Default timeout in miliseconds.
     */
    static timeout: number;
    private timerHandle;
    /**
     *
     * @param executor
     * @param timeout timeout in miliseconds.
     */
    constructor(executor: ((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void), timeout?: number);
    /**
     *
     * @param onfulfilled
     * @param onrejected onrejected function or timeout miliseconds. for supporting simlplified
     * @param timeout timeout in miliseconds.
     * @example new TimeoutPromise().then((result)=>{},1000).catch((err)=>{},10)
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null | number, timeout?: number): TimeoutPromise<TResult1 | TResult2>;
    /**
     *
     * @param onrejected
     * @param timeout
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null, timeout?: number): TimeoutPromise<T | TResult>;
    /**
     * Resolves promise.
     * @param value
     */
    resolve(value?: any): void;
    /**
     * Rejects promise.
     * @param cause
     */
    reject(cause?: any): void;
    /**
     * Removes existing timeout and set new Timeout.
     * @param timeout timeout miliseconds
     */
    setTimeout(timeout: number | undefined): this;
    /**
     * Removes existing timeout.
     */
    removeTimeout(): void;
    /**
     * Timeout function which will be called when timeout occurs.
     * Reject promise by default.
     * @param timeout
     */
    onTimeout(timeout: number): void;
}
export { TimeoutPromise };
