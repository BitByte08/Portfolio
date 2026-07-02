export default function NotFound() {
  return (
    <main className="shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div className="hero-copy" style={{ maxWidth: 720 }}>
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="hero-summary">요청한 경로가 없거나 아직 연결되지 않았습니다. 홈으로 돌아가 다시 확인하세요.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="/">
            홈으로
          </a>
        </div>
      </div>
    </main>
  );
}
