/**
 * Tiny, dependency-free markdown → HTML converter.
 * Supports: ## / ### headings, **bold**, *italic*, [links](url),
 * ![images](url), `code`, ``` code blocks, > quotes, - lists, 1. lists.
 * Strings that already contain HTML pass through untouched.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-2xl my-4" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(md: string): string {
  if (/<(p|h[1-6]|ul|ol|div|section)\b/i.test(md)) return md; // already HTML

  const lines = escapeHtml(md).split(/\r?\n/);
  const out: string[] = [];
  let inCode = false;
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        out.push("</code></pre>");
        inCode = false;
      } else {
        closeList();
        out.push('<pre class="bg-navy-900 text-neon-300 rounded-2xl p-5 text-sm overflow-x-auto my-4"><code>');
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }

    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const quote = line.match(/^>\s?(.*)/);
    const ul = line.match(/^[-*]\s+(.*)/);
    const ol = line.match(/^\d+\.\s+(.*)/);

    if (h2) {
      closeList();
      out.push(`<h2>${inline(h2[1])}</h2>`);
    } else if (h3) {
      closeList();
      out.push(`<h3>${inline(h3[1])}</h3>`);
    } else if (quote) {
      closeList();
      out.push(`<blockquote><p>${inline(quote[1])}</p></blockquote>`);
    } else if (ul) {
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
    } else if (ol) {
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

/** Returns { html (with heading ids), toc }. */
export function prepareArticle(content: string): {
  html: string;
  toc: { id: string; text: string }[];
} {
  let html = markdownToHtml(content);
  const toc: { id: string; text: string }[] = [];
  html = html.replace(/<h2(?:\s[^>]*)?>(.*?)<\/h2>/gi, (_m, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html, toc };
}
