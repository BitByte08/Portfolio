type ProjectCardProps = {
  title: string;
  category: string;
  summary: string;
  outcome: string;
  stack: string[];
};

export function ProjectCard({ title, category, summary, outcome, stack }: ProjectCardProps) {
  return (
    <article className="project-card">
      <p className="project-category">{category}</p>
      <h3>{title}</h3>
      <p>{summary}</p>
      <p className="project-outcome">{outcome}</p>
      <ul className="tag-row">
        {stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
