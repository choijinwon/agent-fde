/** The former database endpoint is retired; the public form uses Netlify Forms. */
export async function POST() {
  return Response.json(
    { error: "문의 접수 방식이 변경되었습니다. 상담 페이지를 새로고침한 후 다시 신청해 주세요.", consultationUrl: "/consultation" },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
