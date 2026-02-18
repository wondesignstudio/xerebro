# E2E (Playwright)

## 1) 브라우저 설치

```bash
npx playwright install chromium
```

## 2) 인증 상태 캡처 (소셜 로그인 1회)

```bash
npm run e2e:auth
```

- 브라우저에서 Google/Kakao 로그인 완료 후 `/dashboard` 또는 `/hosted-pages`로 이동하면
  `tests/e2e/.auth/user.json` 이 생성됩니다.
- `e2e:auth`는 기본적으로 시스템 Chrome 채널을 사용합니다
  (`PLAYWRIGHT_CHROMIUM_CHANNEL=chrome`).
  Google 보안 차단 이슈가 있으면 Kakao 대신 Google만 먼저 확인하고,
  Supabase provider 활성 상태를 점검하세요.

### Google 보안 차단 시 기존 Chrome 세션 export 방식

1) 터미널 A에서 앱 실행

```bash
npm run dev
```

2) 터미널 B에서 원격 디버깅 Chrome 실행 (별도 프로필 권장)

```bash
open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir="$HOME/.xerebro-e2e-profile"
```

3) 열린 Chrome에서 `http://localhost:3000/login` 접속 후 Google 로그인 완료
4) 터미널 C에서 auth state export

```bash
npm run e2e:auth:from-chrome
```

5) 이후 base64 출력

```bash
npm run e2e:auth:b64
```

## 3) E2E 실행

```bash
npm run e2e
```

- 현재 `npm run e2e`는 `tests/e2e/hosted-pages.spec.ts`만 실행합니다.
- 로컬에서 `tests/e2e/.auth/user.json`이 없으면 테스트는 skip 됩니다.
- CI에서는 `PLAYWRIGHT_AUTH_STATE_B64`가 없으면 E2E 단계가 skip 됩니다.

## CI 인증 상태 시크릿 준비

`npm run e2e:auth`로 만든 `tests/e2e/.auth/user.json`을 base64로 인코딩해
GitHub secret `PLAYWRIGHT_AUTH_STATE_B64`로 등록합니다.

```bash
npm run e2e:auth:b64
```

출력된 문자열을 GitHub Repository Settings > Secrets and variables > Actions >
`PLAYWRIGHT_AUTH_STATE_B64`에 그대로 붙여넣으면 CI에서 인증 E2E가 실행됩니다.

## 환경 변수

- `PLAYWRIGHT_BASE_URL` (기본값: `http://localhost:3000`)
- 선택: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - 설정 시 테스트가 끝난 후 생성한 `hosted_pages` 테스트 레코드를 자동 정리합니다.
