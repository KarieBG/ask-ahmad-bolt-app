// Builds the public in-channel message from a submitted form.
//
// Format (per handoff doc):
//   {{Headline}}
//   Asked by {{Name}} — {{Topic}}
//
//   ─────
//   {{Full detail}}
//
// Headline approach: currently "derive automatically from the core question"
// (the original default) — swap this function out if the "ask for a one-line
// summary" or "AI-generate" approach wins after real usage testing.

const HEADLINE_MAX_LEN = 100;

function deriveHeadline(coreQuestion) {
  const firstLine = coreQuestion.split("\n")[0].trim();
  if (firstLine.length <= HEADLINE_MAX_LEN) return firstLine;
  return firstLine.slice(0, HEADLINE_MAX_LEN).trim() + "…";
}

function buildMessage({
  isCall,
  callDate,
  coreQuestion,
  links,
  filePermalinks,
  submitterName,
  topicLabel,
}) {
  const headline = isCall
    ? `📅 For upcoming call${callDate ? ` (${callDate})` : ""}`
    : deriveHeadline(coreQuestion);

  const lines = [];
  lines.push(headline);
  lines.push(`Asked by ${submitterName} — ${topicLabel}`);
  lines.push("");
  lines.push("─────");
  lines.push(coreQuestion);

  if (links && links.trim()) {
    lines.push("");
    lines.push("*Links:*");
    lines.push(links.trim());
  }

  if (filePermalinks && filePermalinks.length > 0) {
    lines.push("");
    lines.push("*Attachments:*");
    filePermalinks.forEach((url) => lines.push(url));
  }

  return lines.join("\n");
}

module.exports = { buildMessage, deriveHeadline };
