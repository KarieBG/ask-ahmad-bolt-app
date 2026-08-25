// Two-message format, per the decision to keep the channel scannable:
//
//   MAIN CHANNEL MESSAGE (short — this is what people browsing the channel see):
//     {{Client-written headline}}
//     Asked by {{Name}} — {{Topic}}
//
//   THREADED REPLY (posted right after, using the main message's thread_ts —
//   this is where the full detail lives, one click away):
//     {{Full core question}}
//     {{Links, if any}}
//     {{Attachments, if any}}
//
// Headline is written by the client, not derived or AI-generated — earlier
// testing found automated headlines missed context the client has but didn't
// (or couldn't) put in the question itself. The modal's hint text coaches
// them toward something specific enough to be worth clicking into.

function buildMainMessage({ isCall, callDate, headline, submitterName, topicLabel }) {
  const headlineLine = isCall
    ? `📅 For upcoming call${callDate ? ` (${callDate})` : ""}: ${headline}`
    : headline;

  return [headlineLine, `Asked by ${submitterName} — ${topicLabel}`].join("\n");
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
