# 워크오토 (WORKAUTO) · 업무 자동화 홈페이지

워크오토의 업종별 자동화 서비스와 개발자 최진원의 경력을 소개하고, 프로젝트 상담을 접수하는 홈페이지입니다. Next.js, React, TypeScript로 구성하며 Netlify에 배포합니다.

[홈페이지](https://workauto.co.kr) · [상담 문의함](https://app.netlify.com/projects/agent-fde/forms)

Netlify에 공개 배포했습니다. 상담 문의함은 해당 Netlify 프로젝트에 권한이 있는 계정으로 로그인해야 열 수 있습니다. GitHub `main` 브랜치와 배포 연결을 구성했습니다.

## 주요 기능

- 9개 분야의 개별 서비스 페이지와 업종이 미리 선택되는 상담 신청서
- **첫 상담 0원**, 실제 개발 범위와 비용은 상담 후 별도 안내
- PC·모바일 반응형 화면, 마우스·터치에 반응하는 종이 모티브의 3D 인터랙션
- 회사명·고객사명과 개인 주소·전화번호·생년을 제외한 경력 소개
- 페이지별 제목·설명·canonical, 공유 메타데이터, 구조화 데이터와 사이트맵
- Netlify Forms에 상담 내역 저장, Netlify 대시보드에서 접수 내역 관리

서비스 화면의 업무 흐름은 적용 예시입니다. 결제·장바구니 기능은 없으며, 0원은 초기 상담 비용을 의미합니다.

## 페이지 구성

| 경로 | 내용 |
| --- | --- |
| `/` | 소개, 경력, 자동화 서비스와 진행 방식 |
| `/services` | 9개 분야 서비스 목록 |
| `/services/[slug]` | 업종별 업무 설명, 적용 예시와 상담 연결 |
| `/consultation` | 무료 초기 상담 신청서 |
| `/consultation?service=academy` | 선택한 분야가 반영된 상담 신청서 예시 |
| `/__forms.html` | Netlify의 폼 감지 및 상담 AJAX 제출 대상 |
| `/admin` | Netlify Forms 대시보드 이용 안내 |
| `/sitemap.xml` | 홈·서비스 목록·상세 페이지의 11개 검색 대상 URL |
| `/robots.txt` | 검색 수집 안내 |

상담 신청서와 관리자 안내 화면은 검색 제외로 설정합니다. 실제 접수 내역은 Netlify에 로그인한 뒤 권한이 있는 사이트의 Forms 메뉴에서 확인합니다.

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

## 로컬 실행과 빌드

Node.js **22.13.0 이상**과 npm이 필요합니다. 프로젝트 디렉터리에서 실행합니다.

```sh
npm ci
npm run dev
```

개발 서버는 [http://127.0.0.1:3000](http://127.0.0.1:3000)에서 실행합니다. 별도의 데이터베이스 초기화나 서버 비밀키 설정은 필요하지 않습니다. 로컬 서버는 화면 개발용이며, Netlify Forms의 실제 저장은 Netlify 배포 환경에서 확인합니다.

```sh
npm run build
npm start
```

`npm run build`는 `next build`, `npm start`는 `next start`를 실행합니다. Netlify용 `netlify.toml`의 설정은 빌드 명령 `npm run build`, 게시 디렉터리 `.next`, Node.js 22입니다.

## 상담 데이터와 운영

상담 폼은 `automation-consultation`이라는 이름으로 Netlify Forms에 등록하며, `/__forms.html`에 AJAX 방식으로 제출합니다. 운영자는 Netlify 사이트의 **Forms** 메뉴에서 내용을 확인하고 답변합니다. 기존 Sites의 D1 데이터베이스와 ChatGPT 로그인은 Netlify 버전에서 사용하지 않습니다.

홈페이지의 [abyys1004@naver.com](mailto:abyys1004@naver.com)은 직접 이메일 문의 링크입니다. **자동 이메일 발송이나 알림은 아직 연결하지 않았습니다.** Netlify Forms의 알림 설정은 별도로 구성할 수 있습니다.

접수 데이터의 보관과 삭제는 운영자가 Netlify 대시보드에서 관리합니다. 이전 Sites 버전의 자동 삭제 처리 방식은 적용되지 않습니다. 실제 문의 내용, 계정 인증 정보와 비밀값은 Git에 포함하지 않습니다.

## 사이트 주소와 검색 설정

검색용 대표 주소는 `lib/seo.ts`의 `SITE_URL`에 `https://workauto.co.kr`로 고정합니다. 로컬 또는 미리보기 빌드의 주소가 검색용 대표 주소에 섞이지 않도록 환경변수 `URL`을 사용하지 않습니다.

`lib/seo.ts`에서 이 주소를 기반으로 canonical, 공유 URL, 구조화 데이터와 사이트맵 주소를 구성합니다. 도메인 변경 후에는 다시 빌드·배포하고 각 URL이 새 주소를 가리키는지 확인합니다.

`netlify.toml`에서 기존 `agent-fde.netlify.app` 주소를 경로와 쿼리를 유지한 채 새 도메인으로 301 이동합니다. Google Search Console의 `workauto.co.kr` 도메인 속성에 제출할 사이트맵은 `https://workauto.co.kr/sitemap.xml`입니다. 업종별 검색 제목과 설명은 `lib/service-catalog.ts`에서 관리합니다. 관리자 안내 페이지는 검색 로봇이 `noindex`를 읽을 수 있도록 robots.txt로 차단하지 않습니다.

검색엔진은 접근 가능한 배포 페이지를 수집할 수 있습니다. 배포 후 사이트맵과 검색 수집 상태를 확인해야 하며, 검색 순위나 노출을 보장하지 않습니다.

## 검증 현황

현재 Netlify 배포에서 다음을 확인했습니다.

- Next.js 운영 빌드·TypeScript 검사 및 테스트 10개 통과
- 11개 검색 대상 페이지의 정상 응답·고유 제목·설명·대표 주소·구조화 데이터 확인
- 사이트맵과 robots.txt의 대표 도메인 주소, 상담 페이지 noindex, 없는 서비스 404 확인
- 모바일 360px 메뉴 이동과 서비스 목록 표시, 가로 넘침 없음 확인
- 실제 상담 화면에서 테스트 접수 후 Netlify Forms 저장 확인 및 테스트 데이터 삭제

```sh
npm test
npm run build
```

## 소스 안내

| 위치 | 내용 |
| --- | --- |
| `app/` | 페이지와 공통 화면 |
| `lib/service-catalog.ts` | 9개 분야의 서비스 내용과 경로 |
| `lib/seo.ts` | 사이트 주소와 검색·공유 메타데이터 |
| `public/__forms.html` | Netlify Forms가 감지할 정적 폼 |
| `netlify.toml` | Netlify 빌드·배포 설정 |

[기존 개발 환경 문서](docs/DEVELOPMENT.md)는 **Sites·Vinext·D1을 사용하던 이전 버전의 참고 자료**입니다. 현재 Netlify 실행 방법은 이 README를 따릅니다. 라이선스는 [LICENSE](LICENSE)에 명시되어 있습니다.
