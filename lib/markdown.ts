/**
 * Lightweight markdown → HTML converter for Bandit blog posts.
 * Handles: headings, bold, italic, inline code, code blocks,
 * blockquotes, unordered/ordered lists, tables, horizontal rules,
 * checkboxes, and links/images.
 */
export function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Fenced code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const inner = match.slice(3, -3).replace(/^\w+\n/, "");
    return `<pre class="bg-[#111] border border-white/10 rounded-xl p-4 overflow-x-auto my-5 text-sm text-green-300 font-mono"><code>${inner}</code></pre>`;
  });

  // Tables (GFM)
  html = html.replace(/(\|.+\|\n)+/g, (table) => {
    const rows = table.trim().split("\n");
    const headerCells = rows[0].split("|").filter((c) => c.trim());
    const bodyRows = rows.slice(2);
    const thead = `<tr>${headerCells.map((c) => `<th class="px-4 py-2 text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">${c.trim()}</th>`).join("")}</tr>`;
    const tbody = bodyRows
      .map((row) => {
        const cells = row.split("|").filter((c) => c.trim());
        return `<tr class="border-b border-white/5 hover:bg-white/3">${cells.map((c) => `<td class="px-4 py-2.5 text-sm text-gray-300">${c.trim()}</td>`).join("")}</tr>`;
      })
      .join("");
    return `<div class="overflow-x-auto my-6"><table class="w-full text-left bg-[#111] border border-white/10 rounded-xl"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
  });

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, (_, content) =>
    `<blockquote class="border-l-4 border-[#39FF14]/40 pl-4 my-4 text-gray-400 italic">${content}</blockquote>`
  );

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-white/10 my-8" />');

  // Headings
  html = html.replace(/^### (.+)$/gm, (_, t) => `<h3 class="text-lg font-bold text-white mt-8 mb-3">${inlineMarkdown(t)}</h3>`);
  html = html.replace(/^## (.+)$/gm, (_, t) => `<h2 class="text-2xl font-black text-white mt-10 mb-4">${inlineMarkdown(t)}</h2>`);
  html = html.replace(/^# (.+)$/gm, (_, t) => `<h1 class="text-3xl font-black text-white mt-4 mb-6">${inlineMarkdown(t)}</h1>`);

  // Checkbox lists (must come before unordered lists)
  html = html.replace(/^- \[x\] (.+)$/gm, (_, t) =>
    `<li class="flex items-start gap-2 my-1"><span class="mt-0.5 text-[#39FF14]">✓</span><span class="text-gray-300 text-sm">${inlineMarkdown(t)}</span></li>`
  );
  html = html.replace(/^- \[ \] (.+)$/gm, (_, t) =>
    `<li class="flex items-start gap-2 my-1"><span class="mt-0.5 text-gray-600">☐</span><span class="text-gray-300 text-sm">${inlineMarkdown(t)}</span></li>`
  );

  // Unordered lists — group consecutive items
  html = html.replace(/(^- .+\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => {
      const content = line.replace(/^- /, "");
      // Already converted checkboxes will start with <li
      if (content.startsWith("<li")) return content;
      return `<li class="flex items-start gap-2 my-1.5"><span class="text-[#39FF14] mt-1 flex-shrink-0">▸</span><span class="text-gray-300">${inlineMarkdown(content)}</span></li>`;
    });
    return `<ul class="my-4 space-y-1">${items.join("")}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(^\d+\. .+\n?)+/gm, (block) => {
    let i = 1;
    const items = block.trim().split("\n").map((line) => {
      const content = line.replace(/^\d+\. /, "");
      return `<li class="flex items-start gap-3 my-1.5"><span class="text-[#39FF14] font-bold text-sm flex-shrink-0 mt-0.5">${i++}.</span><span class="text-gray-300">${inlineMarkdown(content)}</span></li>`;
    });
    return `<ol class="my-4 space-y-1">${items.join("")}</ol>`;
  });

  // Paragraphs — wrap remaining lines
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap block-level HTML tags
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|hr|div|table)/.test(trimmed)) return trimmed;
      return `<p class="text-gray-300 leading-relaxed my-4">${inlineMarkdown(trimmed.replace(/\n/g, " "))}</p>`;
    })
    .join("\n");

  return html;
}

function inlineMarkdown(text: string): string {
  return text
    // Links with label: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const isInternal = url.startsWith("/");
      return `<a href="${url}"${isInternal ? "" : ' target="_blank" rel="noopener"'} class="text-[#39FF14] hover:underline font-medium">${label}</a>`;
    })
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-200">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-white/8 text-green-300 font-mono text-sm px-1.5 py-0.5 rounded">$1</code>');
}
