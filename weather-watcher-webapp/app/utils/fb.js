async function getFB() {
  if (window.FB) {
    return window.FB;
  }
  return new Promise((resolve, reject) => {
    window.afterFBLoaded = resolve;
  });
}

function wrap(functionName) {
  return async (...args) => {
    const FB = await getFB();
    return FB[functionName](...args);
  };
}

const AsyncFB = {
  AppEvents: {},
};

['logPageView', 'logEvent'].forEach(fname => {
  AsyncFB.AppEvents[fname] = wrap(fname);
});

export default AsyncFB;
