# land of Promise
Extended promises with ES6. Implemented with Typescript.

## Contents
- OpenPromise
- TimeoutPromise

## OpenPromise
OpenPromise is Promise extended class which has following features.
- Resolvalbe, rejectable from outside of Promise.
- Resolved value, rejected cause, status are accessable from outside.
- Pending Promise of chain, full chain, root of Promise are accessable.

### Resolve, reject from outside.
```javascript
const promise = new OpenPromise((resolve, reject)=>{
  ...some code...
}).then( resolved => {
  ...som code...
});

promise.resolve('resolve from outside!');
```

### Resolved value, rejected cause, status
```javascript
const promise = new OpenPromise((resolve, reject)=>{
  ...some code...
});

promise.resolved;
promise.rejected;
promise.status;
```

## TimeoutPromie
Extended from OpenPromise, TimeoutPromise has additional following features.
- Rejected after given time if Promise is neither resolved nor rejected.
- Timeout occurs based on time of execution.

### Timeout
```javascript
const promise = new TimeoutPromise((resolve,reject)=>{
  //Timeout rejection after 1000 miliseconds
}, 1000).then(resolved => {
  // Timeout rejection after 2000 miliseconds.
}, 2000);

```

