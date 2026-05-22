"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  onMessage,
  sendMessage,
} from "@/lib/socket-client";
import { createEphemeralId } from "@/lib/ephemeral-id";
import type { IncomingMessage } from "@/lib/socket-events";

type LocalMessage = IncomingMessage & { self?: boolean };

const DEFAULT_ROOM = "lobby";

export function ChatShell() {
  const [roomId, setRoomId] = useState(DEFAULT_ROOM);
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const handleJoin = useCallback(() => {
    const trimmed = roomId.trim();
    if (!trimmed) return;
    if (joinedRoom) leaveRoom(joinedRoom);
    connectSocket();
    joinRoom(trimmed);
    setJoinedRoom(trimmed);
    setMessages([]);
  }, [roomId, joinedRoom]);

  const handleLeave = useCallback(() => {
    if (joinedRoom) leaveRoom(joinedRoom);
    disconnectSocket();
    setJoinedRoom(null);
    setMessages([]);
  }, [joinedRoom]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !joinedRoom) return;

    const messageId = createEphemeralId();
    sendMessage({ roomId: joinedRoom, text, messageId }, (ack) => {
      if (ack.ok) {
        setMessages((prev) => [
          ...prev,
          { messageId, text, at: Date.now(), self: true },
        ]);
        setInput("");
      }
    });
  }, [input, joinedRoom]);

  return (
    <section className="w-full max-w-md rounded-xl border border-dokkebi-ghost bg-dokkebi-ghost/40 p-4 shadow-lg backdrop-blur">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={!!joinedRoom}
          placeholder="room id"
          className="flex-1 rounded-lg border border-gray-700 bg-dokkebi-void px-3 py-2 text-sm outline-none focus:border-dokkebi-ember disabled:opacity-50"
          maxLength={64}
        />
        {!joinedRoom ? (
          <button
            type="button"
            onClick={handleJoin}
            className="rounded-lg bg-dokkebi-ember px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            입장
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLeave}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm hover:bg-gray-800"
          >
            퇴장
          </button>
        )}
      </div>

      {joinedRoom && (
        <p className="mb-2 text-xs text-dokkebi-mist">
          연결됨: <span className="font-mono text-dokkebi-ember">{joinedRoom}</span>
          {" · "}
          메시지는 이 기기 메모리에만 잠시 표시됩니다
        </p>
      )}

      <div
        ref={listRef}
        className="mb-4 h-48 overflow-y-auto rounded-lg border border-gray-800 bg-dokkebi-void p-3 text-sm"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-600">대화가 없습니다</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => (
              <li
                key={m.messageId}
                className={m.self ? "text-right text-dokkebi-ember" : "text-left"}
              >
                <span className="font-mono text-xs text-gray-600">
                  {new Date(m.at).toLocaleTimeString()}
                </span>
                <p className="mt-0.5 break-words">{m.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!joinedRoom}
          placeholder={joinedRoom ? "메시지 입력..." : "방에 입장하세요"}
          className="flex-1 rounded-lg border border-gray-700 bg-dokkebi-void px-3 py-2 text-sm outline-none focus:border-dokkebi-ember disabled:opacity-50"
          maxLength={4096}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!joinedRoom || !input.trim()}
          className="rounded-lg bg-dokkebi-ember px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </section>
  );
}
