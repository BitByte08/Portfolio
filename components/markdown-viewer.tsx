type MarkdownViewerProps = {
  markdown: string;
};

type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]?.trimEnd() ?? "";

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ kind: "heading", level: 3, text: line.slice(4).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ kind: "heading", level: 2, text: line.slice(3).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ kind: "heading", level: 1, text: line.slice(2).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];

      while (index < lines.length && lines[index]?.trimStart().startsWith("- ")) {
        items.push(lines[index].trimStart().slice(2).trim());
        index += 1;
      }

      blocks.push({ kind: "list", items });
      continue;
    }

    const paragraphLines: string[] = [line.trim()];
    index += 1;

    while (index < lines.length) {
      const nextLine = lines[index]?.trimEnd() ?? "";
      const nextTrimmed = nextLine.trim();

      if (nextTrimmed === "" || nextTrimmed.startsWith("#") || nextTrimmed.startsWith("- ")) {
        break;
      }

      paragraphLines.push(nextTrimmed);
      index += 1;
    }

    blocks.push({ kind: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function renderInline(text: string) {
  const parts: Array<string | { bold: string }> = [];
  const boldPattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;

  for (const match of text.matchAll(boldPattern)) {
    const [fullMatch, boldText] = match;
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    parts.push({ bold: boldText });
    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) =>
    typeof part === "string" ? (
      <span key={`${index}-${part}`}>{part}</span>
    ) : (
      <strong key={`${index}-${part.bold}`}>{part.bold}</strong>
    ),
  );
}

export function MarkdownViewer({ markdown }: MarkdownViewerProps) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="markdown-viewer">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          if (block.level === 1) {
            return <h1 key={index}>{renderInline(block.text)}</h1>;
          }

          if (block.level === 2) {
            return <h2 key={index}>{renderInline(block.text)}</h2>;
          }

          return <h3 key={index}>{renderInline(block.text)}</h3>;
        }

        if (block.kind === "list") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
