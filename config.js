// Per-coach / per-topic-channel configuration.
//
// Only Ahmad's branch (Power Positioning) is fully wired up right now, per the
// "immediate next step" in the handoff doc. The other branches (Ana, Kat, Ross,
// Support) are stubbed here so extending the app later is a config change, not
// a rewrite — once their form fields are transcribed from Jotform, fill in
// `fields` the same way Ahmad's is done below and register a slash command +
// pinned button for that channel.

module.exports = {
  ahmad: {
    coachName: "Ahmad",
    topicLabel: "Power Positioning",
    topicEmoji: "🎯",
    channelEnvVar: "STRATEGY_CHANNEL_ID",
    slashCommand: "/ask-ahmad",
    callbackId: "ask_ahmad_modal",
    // Universal fields (async/call + optional call date) are added
    // automatically in app.js — this list is just the branch-specific fields.
    fields: [
      {
        block_id: "headline",
        action_id: "headline_input",
        label: "In one line, what's the core thing you're stuck on?",
        type: "plain_text_input",
        multiline: false,
        optional: false,
        max_length: 200,
        placeholder:
          "e.g. \"How to position our new tier against Competitor X\" — keep it to a sentence or two, the full detail goes in the next question",
      },
      {
        block_id: "core_question",
        action_id: "core_question_input",
        label: "What are you working on?",
        type: "plain_text_input",
        multiline: true,
        optional: false,
        placeholder:
          "A bit of context goes a long way — what you're working on and where you're stuck.",
      },
      {
        block_id: "links",
        action_id: "links_input",
        label: "Links (optional)",
        type: "plain_text_input",
        multiline: true,
        optional: true,
        placeholder: "Paste any relevant links here, one per line.",
      },
      {
        block_id: "uploads",
        action_id: "uploads_input",
        label: "Upload files (optional)",
        type: "file_input",
        optional: true,
        max_files: 5,
      },
    ],
  },

  // --- Stubs for the remaining branches (not yet transcribed) ---
  ana_client_clarity: {
    coachName: "Ana",
    topicLabel: "Client Clarity",
    topicEmoji: "🔍",
    channelEnvVar: "CLIENT_CLARITY_CHANNEL_ID",
    slashCommand: "/ask-ana-clarity",
    callbackId: "ask_ana_clarity_modal",
    fields: null, // TODO: core question + review block (comparisons, insights, challenges, doc links, upload)
  },
  ana_customer_listening: {
    coachName: "Ana",
    topicLabel: "Customer Listening",
    topicEmoji: "👂",
    channelEnvVar: "CUSTOMER_LISTENING_CHANNEL_ID",
    slashCommand: "/ask-ana-listening",
    callbackId: "ask_ana_listening_modal",
    fields: null, // TODO: same shape as Client Clarity
  },
  kat: {
    coachName: "Kat",
    topicLabel: "Content Feedback",
    topicEmoji: "✍️",
    channelEnvVar: "CONTENT_FEEDBACK_CHANNEL_ID",
    slashCommand: "/ask-kat",
    callbackId: "ask_kat_modal",
    fields: null, // TODO: core question + links/uploads
  },
  ross: {
    coachName: "Ross",
    topicLabel: "Outreach (LinkedIn)",
    topicEmoji: "📣",
    channelEnvVar: "OUTREACH_CHANNEL_ID",
    slashCommand: "/ask-ross",
    callbackId: "ask_ross_modal",
    fields: null, // TODO: core question + Sales Navigator link + messaging doc + campaign metrics
  },
  support: {
    coachName: "Support", // TODO: replace with actual name once decided
    topicLabel: "General / Technical Support",
    topicEmoji: "🛠️",
    channelEnvVar: "SUPPORT_CHANNEL_ID",
    slashCommand: "/ask-support",
    callbackId: "ask_support_modal",
    fields: null, // TODO: core question + screenshot upload
  },
};
