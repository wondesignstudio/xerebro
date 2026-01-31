[Project] XEREBRO 통합 제품 기획서 (PRD)

Version: 3.2.0 (Final Polish: 거래 장부 복구 및 환불 정책 추가)

Status: Ready for Dev

Author: PM Group (Approved by Dongjun)

Last Updated: 2024.05.21

1. Executive Summary (개요)

1.1. 제품 정의

**XEREBRO(세레브로)**는 IT 개발자 및 1인 사업자를 위한 '지능형 세일즈 파이프라인 솔루션'이다.
웹 전체의 방대한 데이터 속에서 잠재 고객을 정밀하게 발굴(Scout)하여 최적의 영업 멘트를 제안하고, 사용자의 피드백을 반영해 정교하게 다듬은 뒤, 맥락 기반 랜딩 페이지(Context-Aware Landing)로 유입시켜 계약까지 연결한다.

1.2. 핵심 가치 (Core Value)

AI Co-pilot Drafting: 댓글을 자동으로 달지 않는다. AI가 1차 초안을 제안하고, 사용자와의 대화를 통해 가장 자연스러운 영업 멘트를 완성한다.

Context-Aware Landing: 유입된 고객의 니즈(급함/저가/고품질)에 맞춰 랜딩 페이지의 헤드라인과 챗봇 오프닝이 자동으로 변한다.

Adaptive Security: 사용자 경험을 해치지 않는 '보이지 않는 방패'로 경쟁사의 어뷰징과 스팸 DB를 원천 차단한다.

2. Design Guidelines & UX Philosophy

"No Gradients, Just Hierarchy." 화려한 장식 요소를 배제하고, 정보의 위계와 가독성에 집중한 Modern Korean B2B SaaS 스타일을 지향한다.

2.1. Visual Concept

Color Palette (Solid & Semantic):

Primary: #3B82F6 (Vivid Blue) - 명확한 Action 유도.

Background: #F9FAFB (Cool Gray 50) - 눈이 편안한 옅은 회색 배경.

Surface: #FFFFFF (White) - 카드 UI 및 컨텐츠 영역.

Text Primary: #111827 (Gray 900) - 본문.

Text Secondary: #6B7280 (Gray 500) - 메타 정보.

Alert/Urgent: #EF4444 (Red) - 긴급 리드.

Typography:

Font Family: Pretendard Variable.

Scale: 14px (본문), 16px (입력), 12px (캡션).

Shape:

Radius: 6px (버튼), 12px (카드).

Shadow: Shadow-sm (기본).

2.2. UX Principles

Split View First: 리스트와 상세 내용을 한 화면에서 처리 (좌측 리스트, 우측 상세).

Decision, Not Creation: "만드세요"가 아니라 "이 구조가 마음에 드시나요?"라고 묻는다.

Real-time Feedback: 입력과 동시에 미리보기(Preview)가 갱신되어야 한다.

3. Information Architecture (IA)

[Root: XEREBRO Admin]
├── 0. Authentication (Gate)
│    ├── Login / Sign up (Social Login First)
│    └── Legal Consent (Terms, Privacy)
│
├── 1. Dashboard
│    ├── Daily Quest (오늘의 무료 리드 5건 확인)
│    └── My Wallet (잔여 크레딧 및 이용 내역)
│
├── 2. Brand Identity (AI 학습 센터)
│    ├── Core Interview (업종/타겟/USP 설정)
│    └── Persona Tuning (AI 말투 조정)
│
├── 3. Lead Discovery (리드 발굴)
│    ├── [List] Daily Recommended Leads (대기 시 '탐색 중' 상태 및 알림 신청)
│    └── [Detail] AI Drafting Room ([신고하기] 버튼 추가)
│
├── 4. Context Links
│
├── 5. CRM & Inbox
│
├── 6. My Landing Page (Hosted Page Builder)
│    ├── [AI Architect] (업종별 최적 레이아웃 자동 생성)
│    └── [Smart Editor] (텍스트/이미지 수정 및 섹션 On/Off)
│
├── 7. Settings
│    ├── Billing (Pricing Page)
│    └── Security
│
└── [Hidden] Super Admin (운영자 전용)
└── User Management (사용자 조회, 크레딧 수동 지급, 악성 유저 차단)

4. User Flow (상세 시나리오)

4.1. Flow A: Authentication & Onboarding

[Sign Up] "3초 만에 시작하기" (Google/Kakao).

[Legal Consent] 필수 약관 동의.

[Onboarding Chat] AI 인터뷰 진행 ("어떤 비즈니스를 하시나요?").

[Abuse Check] 재가입 여부 확인 및 크레딧 초기화.

4.2. Flow B: Outbound (발굴 및 멘트 작성)

[Notification] 브라우저 푸시/이메일로 "리드 발굴 완료" 알림.

[Review] 리드 카드 클릭 -> 크레딧 차감 (Transaction 기록).

[Validation] 만약 리드 내용이 부적절(스팸 등)할 경우, [신고하기] 버튼 클릭. -> 크레딧 자동 환불 및 리드 삭제.

[AI Draft] AI 제안 초안 확인.

[Refinement] 채팅으로 수정 요청 ("좀 더 친근하게").

[Finalize] [복사하기] 클릭 및 해당 커뮤니티로 이동하여 전송.

4.3. Flow C: Inbound (랜딩 및 보안 필터링)

[Landing] 고객이 xerebro.bio/my-brand 접속.

[Security Check] Adaptive Shield 동작 (Honeypot, IP Check).

[Context] "급하신가요?" 챗봇 툴팁 노출.

[Capture] 상담 신청 폼 제출.

[Verification] AI 스팸 검증 후 CRM 저장.

4.4. Flow D: Lifecycle & Page Building

[Cold Start] 가입 직후 탐색 대기 시간 발생 (5분).

[Async Notification] "탐색 중입니다. 완료되면 알려드릴게요."

[Productive Waiting] "기다리는 동안 랜딩 페이지를 확인해보세요." -> 빌더 이동.

[AI Architect] 업종 맞춤형 페이지 구조 자동 생성.

[Smart Editor] 사이드바 에디터로 텍스트 수정 및 실시간 미리보기 확인.

[Completion] 페이지 게시 완료. 탐색 완료 알림 도착 시 대시보드 복귀.

[Payment Failure] 결제 실패 시 붉은색 경고 배너(D-14) 노출.

[Grace Period] 14일간 정상 작동, 이후 비공개 전환.

[Data Expiration] 30일 후 데이터 영구 삭제 (사전 경고 발송).

5. Functional Requirements (기능 명세서)

5.1. Authentication & Security

ID

Feature Name

Description

Acceptance Criteria

REQ-32

Social Login

Supabase Auth (Google/Kakao)

원클릭 가입.

REQ-33

Consent Log

약관 동의 이력 저장

필수 미동의 시 가입 불가.

REQ-34

Re-signup Policy

재가입 어뷰징 방지

30일 내 재가입 시 혜택 제한.

5.2. Lead Discovery & AI Editor

ID

Feature Name

Description

Acceptance Criteria

REQ-01

Daily Lead Curation

AI 점수 기반 상위 5건 노출

초과 조회 시 유료 안내.

REQ-02

AI Conversational Editor

채팅형 멘트 수정 인터페이스

자연어 지시 반영.

REQ-03

One-Click Copy

멘트/링크 복사

복사 시 상태 변경.

REQ-04

Report & Refund

부적절한 리드 신고 시 크레딧 복구 로직

신고 사유 선택 -> 승인 시 Wallets에 +1 및 Transactions에 환불 기록.

REQ-28

Async Process Bridge

대기 시간 중 타 기능 유도

Empty State 방지.

5.3. Adaptive Security & Lifecycle

ID

Feature Name

Description

Acceptance Criteria

REQ-21

Honeypot Field

봇 탐지용 숨겨진 필드

값 입력 시 차단.

REQ-22

AI Spam Filter

텍스트 내용 기반 스팸 차단

무의미한 문자열 차단.

REQ-29

Payment Warning Banner

결제 실패 시 상단 고정 배너

D-Day 카운트다운.

REQ-30

Grace Period Logic

14일 유예 기간 적용

14일 후 자동 비공개.

REQ-31

Data Hard Delete

30일 후 영구 삭제

사전 알림 필수.

5.4. Hosted Page: AI Architect & Editor

ID

Feature Name

Description

Acceptance Criteria

REQ-35

AI Layout Generation

업종별 섹션 구성 자동화

IT(포폴 위주), 시공(사례 위주).

REQ-36

Section Toggle

섹션 On/Off 스위치

즉시 반영.

REQ-37

Smart Editor UI

사이드바 입력 폼 + 실시간 미리보기

MVP: 사이드바 폼 우선 구현.

REQ-38

OG Tag Optimization

공유 미리보기 자동 설정

카톡/슬랙 썸네일 확인.

5.5. Pricing & Ledger (Payment-Ready)

ID

Feature Name

Description

Acceptance Criteria

REQ-24

Ledger System

크레딧 차감 로직

PG 없이 DB 조작 가능.

REQ-25

Plan Enforcement

등급별 기능 제어

Pro 즉시 활성.

REQ-39

3-Column Pricing UI

Free/Pro/Credit 구분 UI

모바일 반응형.

6. Technical Architecture & Stack

6.1. Tech Stack

Frontend: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI.

Backend: Next.js Server Actions, Supabase (PostgreSQL, Auth).

AI Engine: OpenAI GPT-4o.

Page Engine: JSON-based Layout Engine.

System Email: Resend or SendGrid (안정적인 시스템 알림 발송용).

6.2. Data Schema (Complete)

-- 1. Users
TABLE users {
  id: uuid (PK)
  email: varchar
  provider: varchar
  current_plan: enum ('free', 'pro') DEFAULT 'free'
  terms_agreed_at: timestamp
  marketing_agreed: boolean
  last_left_at: timestamp
  is_super_admin: boolean DEFAULT false
  created_at: timestamp DEFAULT now()
}

-- 2. Wallets (현재 잔액)
TABLE wallets {
  user_id: uuid (PK, FK)
  free_credits: int DEFAULT 5
  subscription_credits: int DEFAULT 0
  purchased_credits: int DEFAULT 0
  last_daily_reset: timestamp
}

-- 3. Transactions (거래 장부 - NEW)
TABLE transactions {
  id: uuid (PK)
  user_id: uuid (FK)
  amount: int -- 차감(-), 충전(+)
  type: enum ('daily_reset', 'lead_view', 'lead_refund', 'manual_topup', 'payment_charge')
  description: text -- ex: "스타트업 리드 열람", "리드 신고 환불"
  related_lead_id: uuid -- (Optional) 어떤 리드 때문에 발생했는지 추적
  created_at: timestamp DEFAULT now()
}

-- 4. Leads
TABLE leads {
  id: uuid (PK)
  source_channel: varchar
  original_url: text
  content_summary: text
  ai_intent: enum
  ai_urgency_score: int
  status: enum ('new', 'contacted', 'converted', 'reported') -- reported 상태 추가
  created_at: timestamp
}

-- 5. Context Links
TABLE context_links {
  id: uuid (PK)
  lead_id: uuid (FK)
  slug: varchar (Unique)
  target_message: text
  click_count: int
  is_active: boolean
}

-- 6. Hosted Pages
TABLE hosted_pages {
  id: uuid (PK)
  user_id: uuid (FK)
  slug: varchar (Unique)
  layout_config: jsonb
  theme_color: varchar
  og_image_url: text
  is_published: boolean
  updated_at: timestamp
}


7. QA Test Cases (TC)

7.1. Authentication & Admin

[Social Login] Google/Kakao 로그인 정상 작동 확인.

[Super Admin] 특정 계정에 is_super_admin 부여 후 어드민 페이지 접속 가능 여부 확인.

7.2. Lifecycle & Billing

[Cold Start] 가입 후 대기 시간 동안 페이지 빌더 유입 확인.

[Payment Fail] 상태 변경 시 경고 배너 노출 및 14일 유예 기간 동작 확인.

[Credit Deduction] 리드 클릭 시 Wallet 잔액 감소 및 Transaction 테이블에 로그(Log) 생성 확인.

[Refund] 리드 신고 시 Credit이 +1 되고, 환불 내역이 Transaction에 남는지 확인.

7.3. Page Builder

[AI Architect] 업종 선택에 따른 레이아웃 자동 구성 확인.

[Editor] 텍스트 수정 시 미리보기에 실시간 반영 확인.

[Publish] 게시 후 외부 링크(xerebro.bio/user) 접속 정상 확인.

8. Development Phasing Strategy

Phase 1: The Engine (Core Logic)

Admin Dashboard, AI Scout, AI Editor, Authentication.

Transaction Ledger System (장부).

Phase 2: The Conversion (Hosted Page)

Hosted Page Builder (AI Architect), Context Link, CRM.

Phase 3: The Scale (Biz & Security)

Adaptive Security, Lifecycle UI, Payment UI, Email System.