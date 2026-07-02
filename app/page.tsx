import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/portfolio";
import { AwardsSection } from "@/components/awards-section";
import { CredentialSection } from "@/components/credential-section";
import { ProjectsSection } from "@/components/projects-section";

type HomeProps = {
  searchParams?: Promise<{
    awardYear?: string | string[];
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();

  return {
    title: data.site.headline,
    description: data.site.summary,
    openGraph: {
      title: data.site.headline,
      description: data.site.summary,
      images: ["/og-image.svg"],
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const data = await getPortfolioData();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedAwardYear =
    typeof resolvedSearchParams?.awardYear === "string" ? resolvedSearchParams.awardYear : undefined;

  return (
    <main className="portfolio-shell" id="top">
      <header className="portfolio-header">
        <a className="portfolio-brand" href="#top">
          Portfolio
        </a>
        <nav className="portfolio-nav" aria-label="section navigation">
          <a href="#stack">Tech Stack</a>
          <a href="#projects">Projects</a>
          <a href="#awards">Award</a>
          <a href="#certificates">Certificates</a>
        </nav>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Portfolio</p>
          <h1>{data.site.headline}</h1>
          <p className="hero-summary">{data.site.summary}</p>

          <div className="hero-actions">
            <a className="button button-primary" href="#projects">
              Projects
            </a>
            <a className="button button-secondary" href="#stack">
              Tech Stack
            </a>
          </div>
        </div>

        <aside className="hero-rail" aria-label="profile and contact">
          <section className="rail-section">
            <p className="rail-label">Profile</p>
            <strong className="rail-name">{data.site.name}</strong>
          </section>

          <section className="rail-section">
            <p className="rail-label">Contact</p>
            <div className="contact-list">
              {data.intro.contact
                .filter((item) => item.label !== "github")
                .map((item) => (
                  <div key={item.label} className="contact-row">
                    <span>{item.label === "phone" ? "연락처" : item.label === "email" ? "이메일" : item.label}</span>
                    {item.href ? <a href={item.href}>{item.value}</a> : <span>{item.value}</span>}
                  </div>
                ))}
              <div className="contact-row">
                <span>위치</span>
                <span>{data.site.location}</span>
              </div>
            </div>
          </section>

          <section className="rail-section">
            <p className="rail-label">학력</p>
            <div className="education-stack">
              <div className="education-item">
                <span>{data.site.education.period}</span>
                <strong>
                  {data.site.education.school} ({data.site.education.major})
                </strong>
              </div>
            </div>
          </section>

          <section className="rail-section">
            <p className="rail-label">Links</p>
            <div className="link-row">
              {data.site.links.map((link) => (
                <a
                  key={link.label}
                  className="pill-link"
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-head">
          <p className="eyebrow">Try, Challenge</p>
          <h2>작업 기준</h2>
        </div>
        <div className="statement-grid">
          {data.intro.challenge.map((item, index) => (
            <article key={item.title} className="statement-card">
              <span className="statement-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block" id="stack">
        <div className="section-head">
          <p className="eyebrow">Tech Stack</p>
          <h2>기술스택</h2>
        </div>

        <div className="stack-grid">
          {data.techStack.map((group) => (
            <article key={group.name} className="stack-card">
              <h3>{group.name}</h3>
              <div className="tag-cloud">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <AwardsSection awards={data.awards} initialYear={requestedAwardYear} />

        <CredentialSection eyebrow="Certificate" title="자격" id="certificates">
          {data.certificates.map((certificate) => (
            <article key={certificate} className="list-item list-item--certificate">
              <strong>{certificate}</strong>
            </article>
          ))}
        </CredentialSection>
      </section>

      <section className="section-block section-block--tight" id="projects">
        <div className="section-head section-head--split">
          <div>
            <p className="eyebrow">Projects</p>
            <h2>주요 프로젝트</h2>
          </div>
        </div>

        <ProjectsSection projects={data.projects} />
      </section>
    </main>
  );
}
