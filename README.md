# 최진원 · 업무 자동화 홈페이지

최진원의 개발 경력과 업종별 자동화 서비스를 소개하고, 프로젝트 상담을 접수하는 개인 홈페이지입니다. React와 TypeScript로 작성했으며, Vinext와 Cloudflare Workers·D1을 사용합니다.

[홈페이지 보기](https://forward-field-studio.abyys9114.chatgpt.site)

현재 호스팅 사이트는 **소유자만 볼 수 있는 비공개 상태**입니다. 전체 공개로 전환하면 검색엔진이 접근할 수 있으며, 검색 수집과 노출은 별도로 이루어집니다. 이 저장소에 소스를 올리는 것만으로 사이트가 자동 배포되지는 않습니다.

## 주요 기능

- 학원·교육, 병원·의원, 제조·생산 등 9개 분야의 개별 서비스 페이지
- **첫 상담 0원**, 실제 개발 범위와 비용은 상담 후 별도 안내
- 서비스 선택을 유지한 채 별도 상담 신청서로 이동
- PC·모바일 반응형 화면과 마우스·터치에 반응하는 종이 모티브의 3D 인터랙션
- 회사명·고객사명과 개인 주소·전화번호·생년을 제외한 경력 소개
- 페이지별 제목·설명·대표 주소(canonical), 공유 메타데이터, 구조화 데이터, 사이트맵
- D1에 상담 내역 저장, 중복 접수 방지와 요청 제한, 소유자 전용 문의함

서비스 화면의 업무 흐름은 적용 예시입니다. 결제·장바구니 기능은 없으며, 0원은 초기 상담 비용을 의미합니다.

## 페이지 구성

| 경로 | 내용 |
| --- | --- |
| `/` | 소개, 경력, 자동화 서비스와 진행 방식 |
| `/services` | 9개 분야 서비스 목록 |
| `/services/[slug]` | 업종별 업무 설명, 적용 예시와 상담 연결 |
| `/consultation` | 무료 초기 상담 신청서 |
| `/consultation?service=academy` | 선택한 분야가 반영된 상담 신청서 예시 |
| `/api/inquiries` | 상담 접수 API (`POST`) |
| `/admin` | 로그인과 관리자 이메일 확인 후 접근하는 문의함 |
| `/sitemap.xml` | 홈·서비스 목록·상세 페이지의 11개 검색 대상 URL |
| `/robots.txt` | 검색 수집 안내 |

상담 신청서와 관리자 화면은 검색 제외로 설정되어 있습니다.

| 분야 | 상세 경로 |
| --- | --- |
| 학원·교육 | `/services/academy` |
| 병원·의원 | `/services/hospital` |
| 제조·생산 | `/services/manufacturing` |
| 엑셀·회계 | `/services/excel-accounting` |
| 쇼핑몰·유통 | `/services/commerce` |
| 물류·재고 | `/services/logistics` |
| 매장·외식 | `/services/store` |
| 일반 사무·전문서비스 | `/services/office` |
| 그 밖의 다양한 업종 | `/services/custom` |

## 로컬 실행

Node.js **22.13.0 이상**과 npm이 필요합니다. 저장소를 내려받은 디렉터리에서 실행합니다.

```sh
npm ci
```

프로젝트 루트에 `.dev.vars`를 만들고 **로컬 테스트용 값만** 설정합니다. 아래 내용은 설명용 예시이며, 환경 파일은 저장소에 포함하지 않습니다.

```dotenv
ADMIN_EMAIL=seedy@sites.test
INQUIRY_RATE_LIMIT_SECRET=replace-with-your-own-local-random-secret
```

| 변수 | 역할 |
| --- | --- |
| `ADMIN_EMAIL` | 문의함 접근을 허용할 로그인 계정 이메일. 로컬 모의 로그인 계정은 `seedy@sites.test`입니다. |
| `INQUIRY_RATE_LIMIT_SECRET` | IP 기반 요청 제한 식별자를 만드는 서버 비밀키. 운영 환경에서는 별도의 충분히 긴 무작위 값을 사용합니다. |

먼저 빌드하여 로컬 D1 설정을 생성합니다.

```sh
npm run build
```

새 로컬 데이터베이스에 초기 마이그레이션을 한 번 적용합니다.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mushy_black_queen.sql
```

이 명령은 로컬 데이터베이스만 변경합니다. 이미 적용한 마이그레이션을 다시 실행하지 마세요. 스키마를 변경할 때는 `npm run db:generate`로 새 마이그레이션을 생성하고 순서대로 적용합니다.

```sh
npm run dev -- --hostname 127.0.0.1
```

기본 주소는 [http://127.0.0.1:5173](http://127.0.0.1:5173)입니다. 로컬 개발 서버에서 `/signin-with-chatgpt?return_to=/admin`에 접속하면 테스트 계정으로 문의함을 확인할 수 있습니다. 이 모의 로그인은 로컬 개발 전용이며, 운영 배포에는 포함되지 않습니다.

빌드 결과를 로컬 Worker로 확인하려면 `npm start`를 실행하고 표시되는 주소에 접속합니다. 이 명령은 사이트를 배포하거나 모의 로그인을 제공하지 않습니다.

## 상담 데이터와 운영

상담 신청은 Cloudflare D1에 저장되며, `/admin`에서 확인합니다. 관리자 접근은 로그인과 `ADMIN_EMAIL` 일치 여부를 서버에서 확인합니다. 운영 환경 변수는 호스팅 환경에서 별도로 설정해야 합니다.

홈페이지의 [abyys1004@naver.com](mailto:abyys1004@naver.com)은 직접 이메일 문의 링크입니다. **상담 폼에는 자동 이메일 발송이나 알림 기능이 연결되어 있지 않습니다.** 접수된 내용을 문의함에서 확인한 뒤 답변하는 방식입니다.

문의는 접수 후 1년간 보관하며, 만료된 데이터는 다음 접수 또는 문의함 조회 시 정리됩니다. 환경 파일, 비밀키, 실제 문의 데이터와 로컬 데이터베이스는 Git에 올리지 않습니다.

## 검증

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/inquiry-validation.test.mjs
npm run build
```

최종 제작 과정에서 다음을 확인했습니다.

- TypeScript 검사, 문의 검증 단위 테스트 7개와 운영 빌드 통과
- 검색 대상 11개 URL의 정상 응답, 고유 제목·설명·canonical, H1 하나와 유효한 JSON-LD 확인
- 사이트맵의 11개 URL, 상담·관리자 화면의 검색 제외, 존재하지 않는 서비스의 404 확인
- 모바일 360px에서 서비스 목록·상세·상담 폼의 업종 선택과 가로 넘침 여부 확인
- 가상 문의의 접수 성공과 로컬 관리자 문의함 저장 확인 후 테스트 데이터 삭제
- 호스팅 배포 성공과 실제 서비스 목록 화면 확인

검색 설정이 완료되어도 비공개 사이트는 검색엔진이 본문에 접근할 수 없습니다. 전체 공개 전환 후 검색 수집 여부를 확인해야 하며, 검색 순위나 노출을 보장하지 않습니다.

## 소스 안내

| 위치 | 내용 |
| --- | --- |
| `app/` | 페이지, 공통 화면과 상담 API |
| `lib/service-catalog.ts` | 9개 분야의 서비스 내용과 경로 |
| `lib/seo.ts` | 사이트 주소와 검색·공유 메타데이터 |
| `lib/inquiry-validation.ts` | 상담 입력 검증과 요청 정책 |
| `db/`, `drizzle/` | 데이터베이스 스키마와 마이그레이션 |
| `tests/` | 상담 검증 테스트 |

도메인을 변경하면 `lib/seo.ts`의 사이트 주소와 관련 호스팅 설정을 함께 확인하세요. 빌드·인증·실행 환경의 상세 설명은 [개발 환경 문서](docs/DEVELOPMENT.md)를 참고하세요. 라이선스는 [LICENSE](LICENSE)에 명시되어 있습니다.
