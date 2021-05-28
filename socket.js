const logger = require("./utils/winston");
const timeoutPromise = require("./utils/timeoutPromise");

/* Must be synchronized with internal */
const SOCKET_ACTION = {
  I_AM_INTRANET: "iAmIntranet",
  VALIDATE_COOKIE: "validateCookie",
  GET_DATA: "getData",
  SET_FOOD: "setFood",
  GET_LIST: "getList",
  GET_LIST_ALL: "getListAll",
};

let socket;

/**
 * Setup socket.io
 */
function setupSocket(io) {
  io.on("connect", async (_socket) => {
    /* Internal server connected */
    _socket.on(SOCKET_ACTION.I_AM_INTRANET, async () => {
      _socket.join(SOCKET_ACTION.I_AM_INTRANET);
      socket = _socket;

      const intranetRooms = io.sockets.adapter.rooms.get(
        SOCKET_ACTION.I_AM_INTRANET
      );

      if (intranetRooms && intranetRooms.size > 1) {
        logger.info(`[Socket] Internal clients is ${intranetRooms.size}`);
      }
    });

    _socket.on("forceDisconnect", () => {
      _socket.disconnect();
    });

    _socket.on("diconnect", () => {
      socket = null;
    });
  });

  logger.info(`[Socket] Initializing`);
}

/**
 * Check if socket variable is still valid
 */
function validateSocket() {
  if (!socket || !socket.connected) {
    return false;
  }
  return true;
}

/**
 * Validate cookie of internal server
 */
async function validateCookie(payload) {
  if (!validateSocket()) return false;

  return timeoutPromise(
    new Promise((resolve) => {
      let answered = false;
      socket.emit(SOCKET_ACTION.VALIDATE_COOKIE, payload, (answer) => {
        if (!answered) {
          answered = true;
          resolve(answer);
        }
      });
    })
  );
}

/**
 * Get menu data of a date
 */
async function getData(payload) {
  if (!validateSocket()) return false;

  return timeoutPromise(
    new Promise((resolve) => {
      let answered = false;
      socket.emit(SOCKET_ACTION.GET_DATA, payload, (answer) => {
        if (!answered) {
          answered = true;
          resolve(answer);
        }
      });
    })
  );
}

/**
 * Order food
 */
async function setFood(payload) {
  if (!validateSocket()) return false;

  return timeoutPromise(
    new Promise((resolve) => {
      let answered = false;
      socket.emit(SOCKET_ACTION.SET_FOOD, payload, (answer) => {
        if (!answered) {
          answered = true;
          resolve(answer);
        }
      });
    })
  );
}

/**
 * Get list of ordered of a date
 */
async function getList(payload) {
  if (!validateSocket()) return false;

  return timeoutPromise(
    new Promise((resolve) => {
      let answered = false;
      socket.emit(SOCKET_ACTION.GET_LIST, payload, (answer) => {
        if (!answered) {
          answered = true;
          resolve(answer);
        }
      });
    })
  );
}

/**
 * Get list of ordered of all date (500 records)
 */
async function getListAll(payload) {
  if (!validateSocket()) return false;

  return timeoutPromise(
    new Promise((resolve) => {
      let answered = false;
      socket.emit(SOCKET_ACTION.GET_LIST_ALL, payload, (answer) => {
        if (!answered) {
          answered = true;
          resolve(answer);
        }
      });
    })
  );
}

module.exports = {
  setupSocket,
  validateCookie,
  getData,
  setFood,
  getList,
  getListAll,
};
