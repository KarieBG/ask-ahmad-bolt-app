# Ask Ahmad — Slack Q&A app (proof of concept)

Custom Slack app (Bolt SDK, Socket Mode) that replaces the Jotform → HelpScout
flow with in-Slack, publicly-visible Q&A. This is the **Ahmad / Power
Positioning branch only** — proof of concept per the project handoff. Once
confirmed working in production, the same pattern extends to Ana, Kat, Ross,
and Support (see `config.js` for the stubs).

Runs on Slack's **free plan** — no Workflow Builder, no per-seat Slack Pro
cost. Needs a small always-on host for the Socket Mode connection (Railway or
Render, ~$0–7/month).

## What it does

1. In the Power Positioning channel, a pinned message with an **"Ask Ahmad"**
   button (and a `/ask-ahmad` slash command as a backup entry point) opens a
   modal.
2. The modal asks: async vs. call, optional call date, core question, links,
   and file uploads.
3. On submit, it posts a formatted public message to the channel
   (question first, "Asked by {{name}}" second, per the handoff spec).
4. If `DOWNSTREAM_WEBHOOK_URL` is set, it also POSTs the structured submission
   as JSON to that URL — a hook point for the not-yet-built HelpScout
   sync / SLA bridge (Zapier or Make). Leave it blank for now; nothing breaks.

## Why a pinned button instead of the compose-bar placement

The sandbox validation found the native "Featured workflow" compose-bar
placement (button + "Send a message" side by side) to be the best
discoverability. That specific UI slot isn't exposed to custom Slack apps —
it's a Workflow Builder-only surface. A pinned message with a button at the
top of the channel is the closest equivalent, per the handoff doc's fallback
note. If Slack ever opens that surface to custom apps, this can be revisited.

## Setup

### 1. Create the Slack app

Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** →
**From an app manifest** → pick your workspace → paste in
`slack-app-manifest.yaml` from this repo → **Create**.

This preconfigures:
- The `/ask-ahmad` slash command
- Socket Mode enabled
- Interactivity enabled (for the modal + button)
- Bot scopes: `chat:write`, `commands`, `files:read`, `pins:write`, `users:read`

### 2. Generate tokens

- **App-level token**: Basic Information → App-Level Tokens → Generate,
  add scope `connections:write` → copy the `xapp-...` token.
- **Bot token**: OAuth & Permissions → Install to Workspace → copy the
  `xoxb-...` Bot User OAuth Token.
- **Signing secret**: Basic Information → App Credentials → Signing Secret.

### 3. Get the channel ID

In Slack, right-click the **Power Positioning** channel → **View channel
details** → copy the Channel ID at the bottom (starts with `C`).

### 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in `SLACK_APP_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, and
`POWER_POSITIONING_CHANNEL_ID`. Leave `DOWNSTREAM_WEBHOOK_URL` blank for now.

### 5. Install dependencies and post the pinned button

```bash
npm install
npm run setup-pinned-button
```

This posts and pins the "Ask Ahmad" message to the channel — run it once.
(Re-running posts a duplicate; unpin/delete the old message first if you need
to redo it, e.g. after changing the button copy.)

### 6. Run locally to test

```bash
npm start
```

You should see `⚡️ Ask Ahmad Bolt app is running (Socket Mode)`. Try the
pinned button or `/ask-ahmad` in the channel.

### 7. Deploy

**Railway** (recommended, simplest):
1. Push this folder to a GitHub repo.
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
3. Add the same environment variables from `.env` in Railway's Variables tab.
4. Railway auto-detects `npm start`. Deploy.
5. Because Socket Mode makes an outbound connection (no inbound webhook
   needed), there's nothing else to configure — no public URL required.

**Render** works the same way (Web Service or Background Worker — Background
Worker is more accurate here since nothing needs to receive inbound HTTP;
Socket Mode is all outbound).

## Known limitations / things to revisit

- **File uploads**: Slack's `file_input` modal block uploads the file, and we
  resolve its permalink to include in the posted message. Permalinks require
  the poster (and viewers) to have channel access — fine here since everyone
  in the channel is a member, but worth spot-checking once live.
- **Headline generation**: currently derives the headline from the first line
  of the core question (capped ~100 chars). This is one of three approaches
  still open per the handoff doc (derive / ask / AI-generate) — swap out
  `formatMessage.js`'s `deriveHeadline()` if a different approach wins after
  real usage.
- **SLA clock, HelpScout sync, stale-thread handling**: none of this is in
  this app. It's the "downstream automation" layer (Zapier/Make) referenced
  in the handoff doc, still fully unbuilt. `DOWNSTREAM_WEBHOOK_URL` is the
  hook point for that once it exists.
- **Free-plan 90-day search limit**: Slack free hides messages older than 90
  days from in-Slack search — not a problem for this app itself, just a
  reminder that HelpScout remains the durable archive.

## Extending to the other branches

Each branch (Ana ×2, Kat, Ross, Support) needs, once its form fields are
transcribed from Jotform:

1. Fill in the `fields` array for that branch in `config.js`.
2. Add its channel ID env var.
3. Register its slash command in the Slack app manifest (or dashboard) and add
   the corresponding `app.command(...)` / `app.action(...)` / `app.view(...)`
   handlers in `app.js` (currently hardcoded to Ahmad's branch only — the
   cleanest path is to loop over all fully-configured branches in `config.js`
   rather than copy-pasting `app.js` per coach; happy to refactor to that once
   a second branch is ready, since the right abstraction is clearer with two
   real examples instead of one).
4. Run a variant of `scripts/post-pinned-button.js` for that channel.
