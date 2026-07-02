type TimelineItem = {
  year: string;
  title: string;
  body: string;
};

type TimelineProps = {
  items: TimelineItem[];
};

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <article key={`${item.year}-${item.title}`} className="timeline-item">
          <span>{item.year}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
