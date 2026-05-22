"use client";

import { io, type Socket } from "socket.io-client";
import {
  SOCKET_EVENTS,
  type IncomingMessage,
  type OutgoingMessage,
  type SendAck,
} from "./socket-events";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) socket.disconnect();
}

export function joinRoom(roomId: string): void {
  connectSocket().emit(SOCKET_EVENTS.ROOM_JOIN, roomId);
}

export function leaveRoom(roomId: string): void {
  getSocket().emit(SOCKET_EVENTS.ROOM_LEAVE, roomId);
}

export function sendMessage(
  payload: OutgoingMessage,
  onAck?: (ack: SendAck) => void
): void {
  connectSocket().emit(SOCKET_EVENTS.MESSAGE_SEND, payload, onAck);
}

export function onMessage(
  handler: (msg: IncomingMessage) => void
): () => void {
  const s = connectSocket();
  s.on(SOCKET_EVENTS.MESSAGE_RECEIVE, handler);
  return () => {
    s.off(SOCKET_EVENTS.MESSAGE_RECEIVE, handler);
  };
}
