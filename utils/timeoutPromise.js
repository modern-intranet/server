function promiseTimeout(promise, ms = 5000) {
  const timeout = new Promise((resolve) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve({
        statusCode: -1,
        data: `Timeout in ${ms} ms`,
      });
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

module.exports = promiseTimeout;
