"use client";

import { useState } from "react";
import { CredentialSection } from "@/components/credential-section";

type Award = {
  year: string;
  issuer?: string;
  name: string;
};

type AwardsSectionProps = {
  awards: Award[];
  initialYear?: string;
};

export function AwardsSection({ awards, initialYear }: AwardsSectionProps) {
  const years = Array.from(new Set(awards.map((award) => award.year))).sort((a, b) => Number(b) - Number(a));
  const [activeYear, setActiveYear] = useState(() => {
    if (initialYear && years.includes(initialYear)) {
      return initialYear;
    }

    return years[0] ?? "";
  });

  const visibleAwards = awards.filter((award) => award.year === activeYear);

  return (
    <CredentialSection
      id="awards"
      eyebrow="Award"
      title="수상"
      controls={
        <div className="section-switcher" role="tablist" aria-label="award year filter">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              role="tab"
              aria-selected={year === activeYear}
              aria-current={year === activeYear ? "true" : undefined}
              className={year === activeYear ? "section-switcher__button is-active" : "section-switcher__button"}
              onClick={() => setActiveYear(year)}
            >
              <span className="section-switcher__button-year">{year}</span>
              <span className="section-switcher__button-label">YEAR</span>
            </button>
          ))}
        </div>
      }
    >
      {visibleAwards.map((award) => (
        <article key={`${award.year}-${award.issuer ?? "award"}-${award.name}`} className="list-item">
          <div className="list-item-meta">{award.issuer ? <span>{award.issuer}</span> : null}</div>
          <strong>{award.name}</strong>
        </article>
      ))}
    </CredentialSection>
  );
}
