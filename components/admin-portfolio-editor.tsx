"use client";

import { useEffect, useMemo, useState } from "react";

import type { PortfolioData } from "@/lib/portfolio";

type PortfolioDocument = {
  data: PortfolioData;
  updatedAt: string;
};

type LoadState = "idle" | "loading" | "ready" | "saving" | "error";

const STORAGE_KEY = "portfolio-admin-session";
const API_BASE_URL = "/api";

type AdminSession = {
  adminToken: string;
};

function safeParsePortfolio(json: string): { ok: true; value: PortfolioData } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(json) as PortfolioData };
  } catch {
    return { ok: false, error: "JSON 문서 형식이 올바르지 않습니다." };
  }
}

function mapLoadError(status: number) {
  if (status === 401 || status === 403) {
    return "Cloudflare Access 인증이 필요합니다.";
  }

  return "문서를 불러오지 못했습니다.";
}

function mapSaveError(status: number) {
  if (status === 401 || status === 403) {
    return "Cloudflare Access 인증이 필요합니다.";
  }

  return "저장에 실패했습니다.";
}

export function AdminPortfolioEditor() {
  const [adminToken, setAdminToken] = useState("dev-admin");
  const [draft, setDraft] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("Access 세션을 확인한 뒤 문서를 불러오세요.");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLocalPreview, setIsLocalPreview] = useState(false);

  useEffect(() => {
    setIsLocalPreview(
      window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "::1",
    );

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const session = JSON.parse(raw) as Partial<AdminSession>;

      if (typeof session.adminToken === "string" && session.adminToken.length > 0) {
        setAdminToken(session.adminToken);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const parsedDraft = useMemo(() => safeParsePortfolio(draft), [draft]);
  const stats = useMemo(() => {
    if (!parsedDraft.ok) {
      return null;
    }

    return {
      projectCount: parsedDraft.value.projects.length,
      awardCount: parsedDraft.value.awards.length,
      certificateCount: parsedDraft.value.certificates.length,
      stackGroups: parsedDraft.value.techStack.length,
    };
  }, [parsedDraft]);

  async function fetchDocument() {
    setLoadState("loading");
    setMessage(isLocalPreview ? "로컬 토큰으로 문서를 불러오는 중입니다." : "Cloudflare Access를 통해 문서를 불러오는 중입니다.");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/portfolio`, {
        credentials: "include",
        headers: {
          "x-admin-token": adminToken,
        },
      });

      if (!response.ok) {
        throw new Error(mapLoadError(response.status));
      }

      const document = (await response.json()) as PortfolioDocument;
      setDraft(JSON.stringify(document.data, null, 2));
      setUpdatedAt(document.updatedAt);
      setIsUnlocked(true);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ adminToken } satisfies AdminSession));
      setLoadState("ready");
      setMessage("문서를 불러왔습니다. 수정 후 저장하세요.");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "문서를 불러오지 못했습니다.");
    }
  }

  async function saveDocument() {
    const parsed = safeParsePortfolio(draft);

    if (!parsed.ok) {
      setLoadState("error");
      setMessage(parsed.error);
      return;
    }

    setLoadState("saving");
    setMessage("문서를 저장하는 중입니다.");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/portfolio`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(parsed.value),
      });

      if (!response.ok) {
        throw new Error(mapSaveError(response.status));
      }

      const document = (await response.json()) as PortfolioDocument;
      setDraft(JSON.stringify(document.data, null, 2));
      setUpdatedAt(document.updatedAt);
      setIsUnlocked(true);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ adminToken } satisfies AdminSession));
      setLoadState("ready");
      setMessage("저장이 완료되었습니다.");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  }

  return (
    <div className="admin-panel-grid">
      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Portfolio editor</h2>
          </div>
          <span className={`admin-status admin-status--${loadState}`}>{loadState}</span>
        </div>

        <p className="admin-copy">
          Cloudflare Access로 인증된 뒤 포트폴리오 문서를 불러오면 편집할 수 있습니다. 화면에는 편집에 필요한 정보만 보여줍니다.
        </p>

        <div className="admin-field-grid">
          {isLocalPreview ? (
            <label className="admin-field">
              <span>Local dev token</span>
              <input
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
                placeholder="dev-admin"
                spellCheck={false}
              />
              <p className="admin-note">프로덕션에서는 Cloudflare Access가 인증을 담당합니다.</p>
            </label>
          ) : (
            <div className="admin-field admin-field--info">
              <span>Access</span>
              <strong>Cloudflare Access 세션으로 인증됩니다.</strong>
              <p className="admin-note">별도 로그인 폼은 없습니다. 보호된 관리자 경로로 진입한 뒤 문서를 불러오세요.</p>
            </div>
          )}
        </div>

        <div className="admin-actions">
          <button type="button" className="button button-primary" onClick={() => void fetchDocument()}>
            {isLocalPreview ? "문서 불러오기" : "문서 불러오기"}
          </button>
          <button type="button" className="button button-secondary" onClick={() => void saveDocument()} disabled={loadState === "saving" || !isUnlocked}>
            저장
          </button>
        </div>

        <div className="admin-metadata">
          <div>
            <span>Status</span>
            <strong>{message}</strong>
          </div>
          <div>
            <span>Last updated</span>
            <strong>{updatedAt ?? "not loaded"}</strong>
          </div>
        </div>

        {!isUnlocked ? (
          <p className="admin-note">아직 문서를 불러오지 않았습니다. 인증 후 데이터를 표시합니다.</p>
        ) : null}

        {isUnlocked ? (
          stats ? (
            <div className="admin-stat-grid" aria-label="document summary">
              <div>
                <span>Projects</span>
                <strong>{stats.projectCount}</strong>
              </div>
              <div>
                <span>Awards</span>
                <strong>{stats.awardCount}</strong>
              </div>
              <div>
                <span>Certificates</span>
                <strong>{stats.certificateCount}</strong>
              </div>
              <div>
                <span>Stack groups</span>
                <strong>{stats.stackGroups}</strong>
              </div>
            </div>
          ) : (
            <p className="admin-error">문서가 유효한 JSON이 아니어서 요약을 만들 수 없습니다.</p>
          )
        ) : null}
      </section>

      {isUnlocked ? (
        <section className="admin-panel admin-panel--editor">
          <div className="admin-panel__header">
            <div>
              <p className="eyebrow">Document</p>
              <h2>JSON source</h2>
            </div>
            <span className="admin-status admin-status--ready">editable</span>
          </div>

          <textarea
            className="admin-editor"
            value={draft}
            spellCheck={false}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Portfolio JSON editor"
          />

          {!parsedDraft.ok ? <p className="admin-error">{parsedDraft.error}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
