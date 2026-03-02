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

### CI용 빠른 경로 (production 로그인 세션 기준)

```bash
open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir="$HOME/.xerebro-e2e-profile"
# 위 Chrome에서 https://xerebro.me/login 로그인
npm run e2e:auth:from-chrome:prod
npm run e2e:auth:b64:copy
```

`e2e:auth:from-chrome:prod`는 `xerebro.me` 로그인 세션의 Supabase auth cookie를
`localhost` 테스트 오리진으로 자동 매핑해서 저장합니다.
`e2e:auth:b64:copy`는 실패 시 즉시 에러를 내고, 성공 시 길이를 출력합니다.

## 3) E2E 실행

```bash
npm run e2e
```

- 현재 `npm run e2e`는 `tests/e2e/hosted-pages.spec.ts`만 실행합니다.
- 로컬에서 `tests/e2e/.auth/user.json`이 없으면 테스트는 skip 됩니다.
- CI에서는 `PLAYWRIGHT_AUTH_STATE_B64`가 없으면 quality job이 실패합니다(인증 E2E 필수).

## CI 인증 상태 시크릿 준비

`npm run e2e:auth`로 만든 `tests/e2e/.auth/user.json`을 base64로 인코딩해
GitHub secret `PLAYWRIGHT_AUTH_STATE_B64`로 등록합니다.

```bash
npm run e2e:auth:b64
```

출력된 문자열을 GitHub Repository Settings > Secrets and variables > Actions >
`PLAYWRIGHT_AUTH_STATE_B64`에 그대로 붙여넣으면 CI에서 인증 E2E가 실행됩니다.
Secret이 비어 있으면 CI quality job은 실패합니다.

중요: CI E2E는 `http://localhost:3000` 기준으로 실행됩니다.
따라서 secret용 auth state도 `http://localhost:3000/login`에서 로그인한 세션으로 생성해야 합니다.
다만 `e2e:auth:from-chrome:prod`를 쓰면 production 로그인 세션으로도 localhost 호환 auth state를 생성할 수 있습니다.
또한 CI global setup에서 `xerebro.me` Supabase auth cookie를 localhost로 자동 매핑해 오리진 불일치 실패를 완화합니다.

## `e2e:auth:from-chrome` 실패 시 점검

- `ECONNREFUSED 127.0.0.1:9222`가 나오면, Chrome이 원격 디버깅 모드로 실행되지 않은 상태입니다.
- 아래 순서로 다시 실행:

```bash
npm run dev
open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir="$HOME/.xerebro-e2e-profile"
npm run e2e:auth:from-chrome
```

- 기본값 변경:
  - `PLAYWRIGHT_CDP_ENDPOINT` (기본: `http://127.0.0.1:9222`)
  - `PLAYWRIGHT_AUTH_ORIGIN` (기본: `http://localhost:3000`)

## 환경 변수

- `PLAYWRIGHT_BASE_URL` (기본값: `http://localhost:3000`)
- 선택: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - 설정 시 테스트가 끝난 후 생성한 `hosted_pages` 테스트 레코드를 자동 정리합니다.
