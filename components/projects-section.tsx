"use client";

import { useEffect, useState } from "react";
import { MarkdownViewer } from "@/components/markdown-viewer";

type ProjectDetail = {
  title: string;
  body: string;
};

type ProjectMedia = {
  src: string;
  alt: string;
};

type Project = {
  title: string;
  subtitle: string;
  meta: {
    period: string;
    role: string;
    stack: string[];
    team: string;
    code: string;
  };
  summary: string;
  details: ProjectDetail[];
  media?: ProjectMedia[];
};

type ProjectsSectionProps = {
  projects: Project[];
};

function formatTeam(team: string) {
  return team
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" · ");
}

function buildMarkdown(project: Project) {
  const sections = [
    `# ${project.title}`,
    `### ${project.subtitle}`,
    "",
    `- 기간 :: ${project.meta.period}`,
    `- 역할 :: ${project.meta.role}`,
    `- 기술 스택 :: ${project.meta.stack.join(", ")}`,
    `- 팀 :: ${formatTeam(project.meta.team)}`,
    `- 소스 코드 :: ${project.meta.code}`,
    "",
    project.summary,
    "",
    ...project.details.flatMap((detail) => [`## ${detail.title}`, "", detail.body, ""]),
  ];

  return sections.join("\n").trim();
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!activeProject) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProject]);

  return (
    <>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article
            key={project.title}
            className="project-card project-card--summary"
            role="button"
            tabIndex={0}
            onClick={() => setActiveProject(project)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveProject(project);
              }
            }}
          >
            <div className="project-card__header">
              <div className="project-card__title">
                <p className="eyebrow">{String(index + 1).padStart(2, "0")}</p>
                <h3>{project.title}</h3>
                <p className="project-subtitle">{project.subtitle}</p>
              </div>
            </div>

            <div className="project-meta-grid project-meta-grid--compact">
              <div>
                <span>Period</span>
                <strong>{project.meta.period}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{project.meta.role}</strong>
              </div>
              <div>
                <span>Team</span>
                <strong>{formatTeam(project.meta.team)}</strong>
              </div>
            </div>

            <p className="project-summary">{project.summary}</p>

            <div className="tag-cloud tag-cloud--project">
              {project.meta.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {activeProject ? (
        <div className="project-modal" role="presentation" onClick={() => setActiveProject(null)}>
          <div
            className="project-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="project-modal__header">
              <button type="button" className="button button-secondary" onClick={() => setActiveProject(null)}>
                닫기
              </button>
            </div>

            <div className="project-modal__layout">
              <aside className="project-modal__sidebar">
                <div className="project-modal__title">
                  <p className="eyebrow">{activeProject.title}</p>
                  <h3 id="project-modal-title">{activeProject.subtitle}</h3>
                </div>

                <p className="project-summary project-summary--modal">{activeProject.summary}</p>

                <div className="project-meta-grid project-meta-grid--modal">
                  <div>
                    <span>Period</span>
                    <strong>{activeProject.meta.period}</strong>
                  </div>
                  <div>
                    <span>Role</span>
                    <strong>{activeProject.meta.role}</strong>
                  </div>
                  <div>
                    <span>Team</span>
                    <strong>{formatTeam(activeProject.meta.team)}</strong>
                  </div>
                  <div>
                    <span>Source</span>
                    <a className="project-source-link" href={activeProject.meta.code} target="_blank" rel="noreferrer">
                      {activeProject.meta.code}
                    </a>
                  </div>
                </div>

                <div className="tag-cloud tag-cloud--project tag-cloud--modal">
                  {activeProject.meta.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>

                {activeProject.media && activeProject.media.length > 0 ? (
                  <div className="project-media-stack">
                    {activeProject.media.map((media) => (
                      <figure key={`${media.src}-${media.alt}`} className="project-media-card">
                        <img src={media.src} alt={media.alt} />
                      </figure>
                    ))}
                  </div>
                ) : null}
              </aside>

              <div className="project-modal__body">
                <div className="project-markdown-frame">
                  <MarkdownViewer markdown={buildMarkdown(activeProject)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
