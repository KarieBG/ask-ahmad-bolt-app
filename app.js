require("dotenv").config();
const { App } = require("@slack/bolt");
const config = require("./config");
const { buildMainMessage, buildThreadDetailMessage } = require("./formatMessage");

const branch = config.ahmad; // proof of concept — only branch wired up so far
const CHANNEL_ID = process.env[branch.channelEnvVar];

if (!CHANNEL_ID) {
  console.warn(
    `Warning: ${branch.channelEnvVar} is not set in .env — the app will start, ` +
      `but posting will fail until it's configured.`
  );
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // avoids needing a public server / request URL
});

// ---------------------------------------------------------------------------
// Modal builder
// ---------------------------------------------------------------------------
function buildModalView() {
  const universalBlocks = [
    {
      type: "input",
      block_id: "async_or_call",
      label: { type: "plain_text", text: "Is this for your upcoming coaching call, or would you like an answer here?" },
      element: {
        type: "radio_buttons",
        action_id: "async_or_call_input",
        options: [
          {
            text: { type: "plain_text", text: "I'd like an answer here" },
            value: "async",
          },
          {
            text: { type: "plain_text", text: "This is for our upcoming call" },
            value: "call",
          },
        ],
      },
    },
    {
      type: "input",
      block_id: "call_date",
      optional: true,
      label: { type: "plain_text", text: "Call date (optional)" },
      element: {
        type: "datepicker",
        action_id: "call_date_input",
        placeholder: { type: "plain_text", text: "Only needed if this is for a call" },
      },
    },
    { type: "divider" },
  ];

  const branchBlocks = branch.fields.map((field) => {
    const block = {
      type: "input",
      block_id: field.block_id,
      optional: field.optional,
      label: { type: "plain_text", text: field.label },
    };

    if (field.type === "plain_text_input") {
      block.element = {
        type: "plain_text_input",
        action_id: field.action_id,
        multiline: !!field.multiline,
        placeholder: { type: "plain_text", text: field.placeholder },
      };
      if (field.max_length) {
        block.element.max_length = field.max_length;
      }
    } else if (field.type === "file_input") {
      block.element = {
        type: "file_input",
        action_id: field.action_id,
        max_files: field.max_files || 5,
      };
    }

    return block;
  });

  return {
    type: "modal",
    callback_id: branch.callbackId,
    title: { type: "plain_text", text: `Ask ${branch.coachName}` },
    submit: { type: "plain_text", text: "Submit" },
    close: { type: "plain_text", text: "Cancel" },
    private_metadata: JSON.stringify({ channelId: CHANNEL_ID }),
    blocks: [...universalBlocks, ...branchBlocks],
  };
}

// ---------------------------------------------------------------------------
// Entry points: slash command + pinned-message button both open the same modal
// ---------------------------------------------------------------------------
app.command(branch.slashCommand, async ({ ack, body, client }) => {
  await ack();
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildModalView(),
    });
  } catch (err) {
    console.error("Failed to open modal from slash command:", err);
  }
});

// One-time setup command: posts and pins the "Ask Ahmad" button to the
// configured channel. Meant to be run once by an admin, from inside Slack —
// no terminal access required. Safe to run again if you ever want to repost
// it (e.g. after changing the wording); it'll just add a second pinned
// message, so unpin the old one first if that matters to you.
app.command("/ask-ahmad-setup", async ({ ack, command, client }) => {
  await ack();

  if (!CHANNEL_ID) {
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "STRATEGY_CHANNEL_ID isn't set in the app's environment variables yet — add it and redeploy, then try this again.",
    });
    return;
  }

  try {
    const posted = await client.chat.postMessage({
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

    await client.pins.add({ channel: CHANNEL_ID, timestamp: posted.ts });

    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: `Done — posted and pinned the "Ask Ahmad" button in <#${CHANNEL_ID}>.`,
    });
  } catch (err) {
    console.error("Setup command failed:", err);
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: `Something went wrong: ${err.data?.error || err.message}. Double-check the bot has been added to the channel, then try again.`,
    });
  }
});

app.action("open_ask_ahmad_modal", async ({ ack, body, client }) => {
  await ack();
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildModalView(),
    });
  } catch (err) {
    console.error("Failed to open modal from pinned button:", err);
  }
});

// ---------------------------------------------------------------------------
// Submission handler
// ---------------------------------------------------------------------------
app.view(branch.callbackId, async ({ ack, body, view, client }) => {
  await ack();

  const values = view.state.values;
  const metadata = JSON.parse(view.private_metadata || "{}");
  const channelId = metadata.channelId || CHANNEL_ID;
  const submitterId = body.user.id;

  const asyncOrCall =
    values.async_or_call.async_or_call_input.selected_option?.value || "async";
  const isCall = asyncOrCall === "call";
  const callDate = values.call_date?.call_date_input?.selected_date || null;

  const headline = values.headline?.headline_input?.value?.trim() || "";
  console.log("Extracted headline from modal:", JSON.stringify(headline));
  const coreQuestion =
    values.core_question?.core_question_input?.value?.trim() || "";
  const links = values.links?.links_input?.value || "";
  const uploadedFiles = values.uploads?.uploads_input?.files || [];

  // Resolve file permalinks so they can be included (and unfurl) in the
  // public channel message. file_input in modals uploads the file already;
  // we just need each file's permalink.
  const filePermalinks = [];
  for (const f of uploadedFiles) {
    try {
      const info = await client.files.info({ file: f.id });
      if (info.file?.permalink) filePermalinks.push(info.file.permalink);
    } catch (err) {
      console.error("Could not resolve file permalink:", err);
    }
  }

  // Look up display name + avatar for the byline. Avatar takes the place of
  // the words "Asked by" — it signals authorship the way a byline photo
  // does anywhere else, without needing a label.
  let submitterName = `<@${submitterId}>`;
  let submitterAvatarUrl = null;
  try {
    const userInfo = await client.users.info({ user: submitterId });
    submitterName =
      userInfo.user?.profile?.display_name ||
      userInfo.user?.real_name ||
      submitterName;
    submitterAvatarUrl = userInfo.user?.profile?.image_24 || null;
  } catch (err) {
    console.error("Could not resolve submitter name/avatar, falling back to mention:", err);
  }

  const mainMessage = buildMainMessage({
    isCall,
    callDate,
    headline,
    submitterName,
    submitterAvatarUrl,
    topicLabel: branch.topicLabel,
    topicEmoji: branch.topicEmoji,
  });

  let posted;
  try {
    const payload = {
      channel: channelId,
      blocks: mainMessage.blocks,
      // Defensive fallback: text should always be non-empty from
      // buildMainMessage, but Slack rejects the whole post with a "no_text"
      // error if it's ever empty/missing — this guarantees it can't happen.
      text: mainMessage.text || `New question in ${branch.topicLabel}`,
      unfurl_links: false,
    };
    console.log("Posting main message, payload:", JSON.stringify(payload));
    posted = await client.chat.postMessage(payload);
  } catch (err) {
    console.error("Failed to post question to channel:", err);
    // Let the submitter know privately, since the modal has already closed.
    await client.chat.postEphemeral({
      channel: channelId,
      user: submitterId,
      text: `Something went wrong posting your question to <#${channelId}>. Please try again or flag this to support.`,
    });
    return;
  }

  // Full detail goes in a threaded reply, not the main message, so the
  // channel stays scannable — headline first, detail one click away.
  const detailMessageText = buildThreadDetailMessage({
    coreQuestion,
    links,
    filePermalinks,
  });

  try {
    await client.chat.postMessage({
      channel: channelId,
      thread_ts: posted.ts,
      text: detailMessageText,
      unfurl_links: false,
    });
  } catch (err) {
    console.error("Failed to post detail thread reply:", err);
    // Not fatal to the overall flow — the headline is already posted and
    // visible. Let the submitter know the detail may not have made it in.
    await client.chat.postEphemeral({
      channel: channelId,
      user: submitterId,
      text: `Your question posted, but I couldn't attach the full detail in the thread. Reply in the thread yourself with the details, or flag this to support.`,
    });
  }

  // Forward to the (not-yet-built) HelpScout sync / SLA bridge, if configured.
  if (process.env.DOWNSTREAM_WEBHOOK_URL) {
    try {
      await fetch(process.env.DOWNSTREAM_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coach: branch.coachName,
          topic: branch.topicLabel,
          isCall,
          callDate,
          submitterId,
          submitterName,
          headline,
          coreQuestion,
          links,
          filePermalinks,
          channelId,
          messageTs: posted.ts,
          permalink: (
            await client.chat.getPermalink({
              channel: channelId,
              message_ts: posted.ts,
            })
          ).permalink,
        }),
      });
    } catch (err) {
      // Don't fail the user-facing flow if the downstream bridge is unreachable —
      // just log it. This bridge (HelpScout sync + SLA logic) isn't built yet.
      console.error("Downstream webhook call failed:", err);
    }
  }
});

(async () => {
  await app.start();
  console.log("⚡️ Ask Ahmad Bolt app is running (Socket Mode)");
})();
