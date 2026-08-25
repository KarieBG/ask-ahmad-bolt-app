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

  if (topicEmoji || topicLabel) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${topicEmoji ? topicEmoji + " " : ""}${topicLabel}`,
        },
      ],
    });
  }

  blocks.push({
    type: "section",
    text: { type: "mrkdwn", text: `*${headline}*` },
  });

  const bylineText = isCall
    ? `${submitterName} · 📅 For upcoming call${callDate ? ` (${callDate})` : ""}`
    : submitterName;

  const bylineElements = [];
  if (submitterAvatarUrl) {
    bylineElements.push({
      type: "image",
      image_url: submitterAvatarUrl,
      alt_text: submitterName,
    });
  }
  bylineElements.push({ type: "mrkdwn", text: bylineText });

  blocks.push({ type: "context", elements: bylineElements });

  // Plain-text fallback for notifications/accessibility — mirrors the
  // visible content without markdown syntax.
  const fallbackText = isCall
    ? `[${topicLabel}] ${headline} — ${submitterName}, for upcoming call${callDate ? ` (${callDate})` : ""}`
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
