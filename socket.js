const timeoutPromise = require("./utils/timeoutPromise");
const ACTIONS = require("./constants/actions");
const datesModel = require("./models/dates");

var io;
var socket;

/**
 * Setup socket.io
 */
function setupSocket(_io) {
  io = _io;

  /* Internal server connected */
  io.on("connect", async (_socket) => {
    _socket.on(ACTIONS.I_AM_INTRANET, async () => {
      io.socketsLeave(ACTIONS.I_AM_INTRANET);
      _socket.join(ACTIONS.I_AM_INTRANET);
      socket = _socket;

      /* Debugging intranet clients */
      const intranetRooms = io.sockets.adapter.rooms.get(ACTIONS.I_AM_INTRANET);
      const roomSize = intranetRooms ? intranetRooms.size : 0;
      console.log(`Intranet clients is ${roomSize} ${roomSize ? "✓" : "⚠"}`);
    });

    _socket.on("forceDisconnect", () => {
      _socket.disconnect();
    });

    _socket.on("diconnect", () => {
      socket = null;
    });
  });

  console.log("Initialize socket.io");
}

/**
 * Check if socket variable is still valid
 */
function validateSocket() {
  if (!socket || !socket.connected) {
    console.log("[Socket] Leave all intranet clients");
    if (io) io.socketsLeave(ACTIONS.I_AM_INTRANET);
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
      socket.emit(ACTIONS.VALIDATE_COOKIE, payload, (answer) => {
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
      socket.emit(ACTIONS.GET_DATA, payload, (answer) => {
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
      socket.emit(ACTIONS.SET_FOOD, payload, (answer) => {
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
      socket.emit(ACTIONS.GET_LIST, payload, (answer) => {
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
      socket.emit(ACTIONS.GET_LIST_ALL, payload, (answer) => {
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
