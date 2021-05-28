function promiseTimeout(promise, ms = 5000) {
  const timeout = new Promise((resolve) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve(false);
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

module.exports = promiseTimeout;
