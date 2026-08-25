// One-off setup script: posts a message with an "Ask Ahmad" button to the
// Power Positioning channel and pins it, so it stays visible near the top —
// the closest replication of the native "featured workflow at the compose
// bar" UX that a custom app can achieve. Slack's own compose-bar workflow
// picker isn't extensible by custom apps, so a pinned button is the fallback
// noted in the handoff doc.
//
// Run once per channel (re-running will post a duplicate — unpin/delete the
// old one first if you need to re-run it):
//   node scripts/post-pinned-button.js

require("dotenv").config();
const { WebClient } = require("@slack/web-api");

const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const CHANNEL_ID = process.env.POWER_POSITIONING_CHANNEL_ID;

(async () => {
  if (!CHANNEL_ID) {
    console.error("POWER_POSITIONING_CHANNEL_ID is not set in .env");
    process.exit(1);
  }

  const result = await client.chat.postMessage({
    channel: CHANNEL_ID,
    text: "Have a question for Ahmad? Click below.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Have a question for Ahmad?*\nAsk it here — your question and his answer will be visible to everyone in this channel, so others can learn from it too.",
        },
        accessory: {
          type: "button",
          action_id: "open_ask_ahmad_modal",
          text: { type: "plain_text", text: "Ask Ahmad" },
          style: "primary",
        },
      },
    ],
  });

  await client.pins.add({
    channel: CHANNEL_ID,
    timestamp: result.ts,
  });

  console.log(`Posted and pinned. Message ts: ${result.ts}`);
})();
