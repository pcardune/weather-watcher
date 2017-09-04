export class PromiseCallback {
  constructor(func) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      if (func) {
        func(resolve, reject);
      }
    });
  }
  then(...args) {
    return this.promise.then(...args);
  }
  catch(...args) {
    return this.promise.catch(...args);
  }
}
