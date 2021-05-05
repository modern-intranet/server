const timeoutPromise = require("./utils/timeoutPromise");
const ACTIONS = require("./constants/actions");
const datesModel = require("./models/dates");

var socket;

function setupSocket(io) {
  io.on("connect", async (sk) => {
    // intranet connection
    sk.on(ACTIONS.I_AM_INTRANET, async () => {
      io.socketsLeave(ACTIONS.I_AM_INTRANET);
      sk.join(ACTIONS.I_AM_INTRANET);
      socket = sk;

      // debugging
      const intranetRooms = io.sockets.adapter.rooms.get(ACTIONS.I_AM_INTRANET);
      const roomSize = intranetRooms ? intranetRooms.size : 0;
      console.log(`Intranet room size is ${roomSize} ${roomSize ? "✓" : "⚠"}`);

      await validateCookie();
    });

    sk.on("forceDisconnect", () => {
      sk.disconnect();
    });

    sk.on("diconnect", () => {
      socket = null;
    });
  });
}

async function validateCookie() {
  if (!socket || !socket.connected) return false;
  return timeoutPromise(
    new Promise((resolve) => {
      let answered = false;
      socket.emit(ACTIONS.VALIDATE_COOKIE, null, (answer) => {
        if (!answered) {
          answered = true;
          resolve(answer);
        }
      });
    })
  );
}

async function getData(payload) {
  if (!socket || !socket.connected) return false;
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

async function setFood(payload) {
  if (!socket || !socket.connected) return false;
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

async function getList(payload) {
  if (!socket || !socket.connected) return false;
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

async function getListAll() {
  if (!socket || !socket.connected) return false;
  return timeoutPromise(
    new Promise((resolve) => {
      let answered = false;
      socket.emit(ACTIONS.GET_LIST_ALL, null, (answer) => {
        if (!answered) {
          answered = true;
          resolve(answer);
        }
      });
    })
  );
}

async function getListNext() {
  if (!socket || !socket.connected) return false;
  const date = await datesModel.getLast();
  return date ? getList({ date: date.id }) : getListAll();
}

module.exports = {
  setupSocket,
  validateCookie,
  getData,
  setFood,
  getList,
  getListNext,
  getListAll,
};
