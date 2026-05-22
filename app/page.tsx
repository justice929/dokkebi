import { ChatShell } from "@/components/chat-shell";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-dokkebi-ember">
          Dokkebi
        </h1>
        <p className="mt-2 text-sm text-dokkebi-mist">
          도깨비 — 서버에 남지 않는 휘발성 메신저
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Zero-data · 메모리 중계만 · 기록 없음
        </p>
      </header>
      <ChatShell />
    </main>
  );
}
