/**
 * Promise which can be resolved or rejected from outer scope. 
 * Also, resolved, rejected value is cached for later use.
 */
class OpenPromise<T> extends Promise<T> {
    static readonly PENDING:string ='pending';
    static readonly FULFILED:string ='fulfiled';
    static readonly REJECTED:string ='rejected';
    
    private pWraper:{ state:string };
    private prev : this|undefined;
    private nResolve:((value?: T | PromiseLike<T>) => void)|undefined;
    private nReject:((value?: T | PromiseLike<T>) => void)|undefined
    private _resolved:T|PromiseLike<T>|undefined;
    private _rejected:any;
    private _index:number;
    
    /**
     * Returns new OpenPromise. 
     * @param executor
     */
    constructor( executor:((resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void)){
        let nresolve:((value?: T | PromiseLike<T>) => void)|undefined = undefined,
            nreject:((value?: T | PromiseLike<T>) => void)|undefined = undefined,
            pWraper:{ state:string } ={ state:OpenPromise.PENDING }
        ;
        super((resolve,reject)=>{
            nresolve = new Proxy(resolve, {
                apply(target, thisArg, argumentsList){
                    pWraper.state = OpenPromise.FULFILED;
                    return Reflect.apply(resolve, thisArg, argumentsList);
                }
            });

            nreject = new Proxy(reject, {
                apply(target, thisArg, argumentsList){
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
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, 
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): OpenPromise<TResult1 | TResult2>{
        const chained:this = super.then(onfulfilled, onrejected) as unknown as this;
        chained.previous = this;
        return chained as unknown as  OpenPromise<TResult1 | TResult2>;
    }

    /**
     * Returns OpenPromise. 
     * Calling resolve, reject function on chained promise will always be invoked to first pending promise.
     * @param onrejected function
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): OpenPromise<T | TResult>{
        const chained:this = super.catch(onrejected) as unknown as this;
        chained.previous = this;
        return chained as OpenPromise<T | TResult>;
    }

    /**
     * Resolves first pending Promise.
     * @param value resolved value.
     */
    resolve(value?:T|PromiseLike<T>):void{
        //move to pending point.
        if(this.pendPoint !== this){
            return this.pendPoint.resolve(value);
        }
        // dereference for garbage collection.
        this.prev = undefined;

        if(this.nResolve){
            this._resolved = value;
            this.nResolve(value);
        }
    }

    /**
     * Rejects first pending Promise.
     * @param cause reject cause.
     */
    reject(cause?:any):void{
        //move to pending point.
        if(this.pendPoint !== this){
            return this.pendPoint.reject(cause);
        }
        // dereference for garbage collection.
        this.prev = undefined;
        
        if(this.nReject){
            this._rejected = cause;
            this.nReject(cause);
        }
    }
    
    /**
     * Get fisrt non-chained Promise(begin of Chain)
     */
    get root():this{
        if(this.prev && this !== this.prev){
            return this.prev.root;
        }
        return this;
    }
    /**
     * Get first pending promise. 
     * If all Promise is resolved|rejected, returns current resolved|rejected  Promise.
     * Usally for internal hierachy call.
     */
    get pendPoint():this{
        if(this.prev && this.prev.state === OpenPromise.PENDING){
            return this.prev.pendPoint;
        }
        return this;
    }

    /**
     * Get prior Promise. Getting  previous Promise and resolving|rejecting it might leave
     * unresolved promise forever. Use it wisely.
     */
    get previous():this|undefined{
        return this.prev;
    }

    /**
     * Set prior Promise. Setting it by manually might leave  promise pending forever.
     * Internal use only.
     */
    set previous(prev:this|undefined){
        //skip if previous is already set.
        if(this.prev || prev === this)
            return;
        this.prev = prev;
        if(prev){
            this._index = prev.index + 1;
        }else{
            this._index = 0;
        }
    }

    /**
     * Get current state of Promise.
     */
    get state():string{
        return this.pWraper.state;
    }

    get index():number{
        return this._index;
    }

    /**
     * Returns resolved value.
     */
    get resolved():T|PromiseLike<T>|undefined{
        return this._resolved;
    }

    /**
     * Returns rejected cause.
     */
    get rejected():any{
        return this._rejected;
    }

    /**
     * Returns pending queue of promise.
     */
    get queue():Array<this>{
        let queue:Array<this>=[],
            current:this|undefined = this;
        while(current !== undefined){
            queue.unshift(current);
            current = current.previous;
        }
        return queue;
    }
}

export { OpenPromise};