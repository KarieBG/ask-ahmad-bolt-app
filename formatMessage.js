// Main channel message, now built with Slack Block Kit instead of plain
// text, so headline and metadata can carry different visual weight:
//
//   [context]  🎯 Power Positioning                      <- topic badge
//   [section]  *Finding good language to explain my offer*  <- bold headline
//   [context]  (avatar) Karie Miller · 📅 For call (Aug 27)  <- muted byline
//
// Why a topic badge even though the channel is topic-named: #strategy is
// shared across more than one coach/topic, so the channel name alone doesn't
// tell someone skimming whose question they're looking at.
//
// "Asked by" was dropped in favor of a small avatar image next to the name —
// the avatar itself signals "this is who posted it," the way a byline does
// anywhere else, without needing the label spelled out.
//
// Call info moved to sit right after the name (not prefixed before the
// headline) so the headline stays clean and the "this is for a call" context
// lives with the rest of the who/when metadata.
//
// Slack requires a plain-text `text` fallback alongside `blocks` (used for
// notifications, accessibility) — buildMainMessage returns both.

// Main channel message, built with Slack Block Kit:
//
//   [header]   I am trying to finalize the language I use to describe my offer   <- large, native "header" block (not just bold text)
//   [context]  (avatar) 🎯 Power Positioning · Karie Miller · 📅 For call (Aug 27)  <- everything else, one muted line
//
// Two blocks total (down from three) — Slack pads around every block, so
// fewer blocks means less dead space between them. The topic badge moved
// from its own line into the byline: once the headline is genuinely large
// (header block, not markdown-bold text), it's the thing people read first
// regardless of where the badge sits, so the badge's job shifts from
// "read me first" to "confirm/reference" — which works fine folded in below.
//
// Note: Slack's header block only accepts plain text (no mrkdwn, no bold
// syntax) and caps at 150 characters — the headline field's max_length in
// config.js is set to match.

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Slack's datepicker returns "YYYY-MM-DD" — parsed manually (not via `new
// Date(...)`) to avoid timezone-shift bugs where UTC midnight can render as
// the previous day depending on the server's local timezone.
function formatCallDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  const [year, month, day] = parts;
  if (!year || !month || !day) return dateStr; // fall back to raw string rather than showing nothing
  return `${MONTH_NAMES[month - 1]} ${day}`;
}

function buildMainMessage({
  isCall,
  callDate,
  headline,
  submitterName,
  submitterAvatarUrl,
  topicLabel,
  topicEmoji,
}) {
  const blocks = [];
  const displayDate = formatCallDate(callDate);

  blocks.push({
    type: "header",
    text: { type: "plain_text", text: headline, emoji: true },
  });

  let metaText = `${topicEmoji ? topicEmoji + " " : ""}${topicLabel} · ${submitterName}`;
  if (isCall) {
    metaText += ` · 📅 For upcoming call${displayDate ? ` (${displayDate})` : ""}`;
  }

  const metaElements = [];
  if (submitterAvatarUrl) {
    metaElements.push({
      type: "image",
      image_url: submitterAvatarUrl,
      alt_text: submitterName,
    });
  }
  metaElements.push({ type: "mrkdwn", text: metaText });

  blocks.push({ type: "context", elements: metaElements });

  // Plain-text fallback for notifications/accessibility.
  const fallbackText = isCall
    ? `[${topicLabel}] ${headline} — ${submitterName}, for upcoming call${displayDate ? ` (${displayDate})` : ""}`
    : `[${topicLabel}] ${headline} — ${submitterName}`;

  return { blocks, text: fallbackText };
}

function buildThreadDetailMessage({ coreQuestion, links, filePermalinks }) {
  const lines = [coreQuestion];

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

module.exports = { buildMainMessage, buildThreadDetailMessage };
