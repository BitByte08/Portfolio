import type { ReactNode } from "react";

type CredentialSectionProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  controls?: ReactNode;
  id?: string;
};

export function CredentialSection({ eyebrow, title, children, controls, id }: CredentialSectionProps) {
  return (
    <article className="section-block section-block--tight credential-section" id={id}>
      <div className={controls ? "section-head section-head--split credential-section__head" : "section-head"}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {controls ? <div className="credential-section__controls">{controls}</div> : null}
      </div>
      <div className="credential-list">{children}</div>
    </article>
  );
}
