/** Shared Socket.io event names — client and server must stay in sync */

export const SOCKET_EVENTS = {
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVE: "message:receive",
} as const;

export type OutgoingMessage = {
  roomId: string;
  text: string;
  messageId: string;
};

export type IncomingMessage = {
  messageId: string;
  text: string;
  at: number;
};

export type SendAck = { ok: boolean };
