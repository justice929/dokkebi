# Dokkebl (도깨비)

**Zero-data** 휘발성 보안 메신저 — 서버에 대화 기록을 남기지 않습니다.

## 철학

- 메시지는 Socket.io를 통해 **메모리에서만 일회성 중계**
- DB, 파일, 메시지 본문 로깅 없음
- 연결 종료 시 서버 측 방 멤버십도 소멸

## 기술 스택

- Next.js 15 (App Router)
- Socket.io (커스텀 `server.js` 중계)
- Tailwind CSS

## 폴더 구조

```
├── app/                 # Next.js 페이지
├── components/          # UI 컴포넌트
├── lib/                 # 소켓 클라이언트, 이벤트 상수
├── server.js            # Next + Socket.io 메모리 중계 서버
├── package.json
└── tailwind.config.ts
```

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 room id로 입장합니다.

## 프로덕션

```bash
npm run build
set NODE_ENV=production&& npm start
```

(PowerShell: `$env:NODE_ENV="production"; npm start`)
