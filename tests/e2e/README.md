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

## 3) E2E 실행

```bash
npm run e2e
```

- 현재 `npm run e2e`는 `tests/e2e/hosted-pages.spec.ts`만 실행합니다.
- `tests/e2e/.auth/user.json`이 없으면 테스트는 자동 skip 됩니다(CI 기본 동작).

## 환경 변수

- `PLAYWRIGHT_BASE_URL` (기본값: `http://localhost:3000`)
- 선택: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - 설정 시 테스트가 끝난 후 생성한 `hosted_pages` 테스트 레코드를 자동 정리합니다.
