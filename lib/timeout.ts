import { OpenPromise } from "./open";

/**
 * Extended from OpenPromise
 * , TimeoutPromise has timeout feature which rejects pending Promise after given miliseconds.
 */
class TimeoutPromise<T> extends OpenPromise<T> {
    /**
     * Default timeout in miliseconds.
     */
    static timeout:number = 60*1000;

    private timerHandle:number|undefined;

    /**
     * 
     * @param executor 
     * @param timeout timeout in miliseconds.
     */
    constructor(executor:((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void), timeout:number=TimeoutPromise.timeout){
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
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, 
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null | number,
        timeout:number=TimeoutPromise.timeout): TimeoutPromise<TResult1 | TResult2>{

        if(typeof onrejected === 'number'){
            timeout = onrejected;
            onrejected = null;
        }

        let nextChain:this,
            proxyHandler:any = {
            apply(target:any, thisArg:any, argumentsList:any){
                if(nextChain){
                    nextChain.setTimeout(timeout);
                }
                return Reflect.apply(target, thisArg, argumentsList);
            }
        };

        if(onfulfilled)
            onfulfilled = new Proxy(onfulfilled, proxyHandler);

        if(onrejected)
            onrejected = new Proxy(onrejected, proxyHandler);
            
        nextChain = super.then(onfulfilled, onrejected) as unknown as this;
        nextChain.removeTimeout();
        return nextChain as unknown as  TimeoutPromise<TResult1 | TResult2>;
    }

    /**
     * 
     * @param onrejected 
     * @param timeout 
     */
    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
        timeout:number=TimeoutPromise.timeout): TimeoutPromise<T | TResult>{
            let nextChain:this,
            proxyHandler:any = {
            apply(target:any, thisArg:any, argumentsList:any){
                if(nextChain){
                    nextChain.setTimeout(timeout);
                }
                return Reflect.apply(target, thisArg, argumentsList);
            }
        };
        if(onrejected)
            onrejected = new Proxy(onrejected, proxyHandler);
        nextChain = super.catch(onrejected) as unknown as this;
        nextChain.removeTimeout();
        return nextChain as TimeoutPromise<T | TResult>;
    }
    /**
     * Resolves promise.
     * @param value 
     */
    resolve(value?:any):void{
        if(this.pendPoint !== this){
            return this.pendPoint.resolve(value);
        }
        this.removeTimeout();
        super.resolve(value);
    }
    /**
     * Rejects promise.
     * @param cause 
     */
    reject(cause?:any):void{
        if(this.pendPoint !== this){
            return this.pendPoint.reject(cause);
        }
        this.removeTimeout();
        super.reject(cause);
    }

    /**
     * Removes existing timeout and set new Timeout.
     * @param timeout timeout miliseconds 
     */
    setTimeout(timeout:number|undefined):this{
        this.removeTimeout();
        this.timerHandle = setTimeout(this.onTimeout.bind(this), timeout, timeout);
        return this;
    }

    /**
     * Removes existing timeout.
     */
    removeTimeout():void{
        if(this.timerHandle){
            clearTimeout(this.timerHandle);
            this.timerHandle = undefined;
        }
    }
    /**
     * Timeout function which will be called when timeout occurs.
     * Reject promise by default.
     * @param timeout 
     */
    onTimeout(timeout:number){
        this.reject(`${this.constructor.name} Timeout : ${timeout}`);
    }
}
export { TimeoutPromise };
