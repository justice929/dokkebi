/**
 * Dokkebi relay server — Zero-data philosophy
 *
 * - No database, no file storage, no message history
 * - Socket.io room membership exists only in process memory
 * - Messages are forwarded once and never retained on the server
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const MAX_ROOM_ID_LENGTH = 64;
const MAX_MESSAGE_LENGTH = 4096;

/** @param {unknown} roomId */
function isValidRoomId(roomId) {
  return (
    typeof roomId === "string" &&
    roomId.length > 0 &&
    roomId.length <= MAX_ROOM_ID_LENGTH &&
    /^[a-zA-Z0-9_-]+$/.test(roomId)
  );
}

/** @param {unknown} payload */
function isValidMessagePayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  const { roomId, text, messageId } = payload;
  return (
    isValidRoomId(roomId) &&
    typeof text === "string" &&
    text.length > 0 &&
    text.length <= MAX_MESSAGE_LENGTH &&
    typeof messageId === "string" &&
    messageId.length > 0 &&
    messageId.length <= 128
  );
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  const io = new Server(httpServer, {
    connectionStateRecovery: false,
    maxHttpBufferSize: 1e6,
    pingTimeout: 20000,
  });

  io.on("connection", (socket) => {
    socket.on("room:join", (roomId) => {
      if (!isValidRoomId(roomId)) return;
      socket.join(roomId);
    });

    socket.on("room:leave", (roomId) => {
      if (!isValidRoomId(roomId)) return;
      socket.leave(roomId);
    });

    socket.on("message:send", (payload, ack) => {
      if (!isValidMessagePayload(payload)) {
        if (typeof ack === "function") ack({ ok: false });
        return;
      }

      const { roomId, text, messageId } = payload;

      if (!socket.rooms.has(roomId)) {
        if (typeof ack === "function") ack({ ok: false });
        return;
      }

      socket.to(roomId).emit("message:receive", {
        messageId,
        text,
        at: Date.now(),
      });

      if (typeof ack === "function") ack({ ok: true });
    });
  });

  httpServer.listen(port, hostname, () => {
    if (dev) {
      process.stdout.write(
        `Dokkebi relay (memory-only) http://${hostname}:${port}\n`
      );
    }
  });
});
