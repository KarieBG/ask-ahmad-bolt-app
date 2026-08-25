# Setting up "Ask Ahmad" — a walkthrough for non-programmers

This guide assumes you've never coded, deployed an app, or touched GitHub
before. Every step is exactly what to click. It should take about 30–45
minutes. Do it in order — don't skip ahead.

A few words you'll see a lot:
- **"Repo" (repository)** — just a folder of files, stored online. Think of
  it like a shared Dropbox folder.
- **"Deploy"** — the process of taking these files and turning them into a
  running program, live on the internet (well, live inside Slack).
- **"Environment variable"** — a setting the program reads when it starts,
  like a password stored separately from the code. You'll be copy-pasting a
  handful of these.

You will NOT need to write or edit any code. You will copy-paste some values
and click buttons.

---

## Part 1 — Create the Slack app (10 min)

1. Go to **[api.slack.com/apps](https://api.slack.com/apps)** and log in with
   your Slack admin account.
2. Click **Create New App** (top right).
3. Choose **From an app manifest**.
4. Pick your workspace from the dropdown, click **Next**.
5. You'll see a box to paste code into. Open the file called
   `slack-app-manifest.yaml` from the files I gave you, select all its text,
   copy it, and paste it into that box, replacing whatever's there.
6. Click **Next**, then **Create**.

You now have an app called "Ask Ahmad" registered in your workspace — it
doesn't do anything yet, it's just registered.

### Install it to your workspace

7. On the left sidebar of the page you're now on, click **Install App**.
8. Click **Install to Workspace**, then **Allow** on the permissions screen.

### Collect three secret values

You'll need to copy three pieces of text into a file later. Keep this browser
tab open and copy each one somewhere temporary (a Notes app, a blank email
draft — anywhere private) as you go, labeled clearly.

9. Still on the left sidebar, click **OAuth & Permissions**. Near the top,
   copy the value under **Bot User OAuth Token** (it starts with `xoxb-`).
   Label it `SLACK_BOT_TOKEN`.
10. Click **Basic Information** on the left sidebar. Scroll to **App-Level
    Tokens**, click **Generate Token and Scopes**. Name it anything (e.g.
    "socket-token"), click **Add Scope**, choose `connections:write`, then
    click **Generate**. Copy the value that starts with `xapp-`. Label it
    `SLACK_APP_TOKEN`.
11. Still on **Basic Information**, scroll to **App Credentials** and copy
    the **Signing Secret** (click **Show** first). Label it
    `SLACK_SIGNING_SECRET`.

### Get the channel ID

12. Open Slack itself (the app or browser, not api.slack.com). Go to the
    **Power Positioning** channel.
13. Click the channel name at the top to open its details panel.
14. Scroll to the bottom — you'll see a **Channel ID**, something like
    `C08ABCD1234`. Copy it. Label it `STRATEGY_CHANNEL_ID`.

### Add the bot to the channel

15. In the Power Positioning channel, type `/invite @Ask Ahmad` and send it.
    (If the bot doesn't show up when you type `@Ask`, that's fine — do this
    step again after Part 2, once the app is actually running.)

You should now have four labeled values saved somewhere:
`SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET`,
`STRATEGY_CHANNEL_ID`.

---

## Part 2 — Put the code online (10 min)

We'll use **GitHub** (a free place to store the code files) and **Railway**
(a free-to-start service that runs the code continuously). Neither requires
you to write anything.

### Create a GitHub account and upload the files

1. Go to **[github.com](https://github.com)** and sign up for a free account
   if you don't have one (email + password, like any account).
2. Once logged in, click the **+** icon top right → **New repository**.
3. Name it `ask-ahmad-bolt-app`. Leave everything else as default. Click
   **Create repository**.
4. On the new (empty) repo page, click **uploading an existing file** (it's
   a blue link in the middle of the page).
5. Open the `ask-ahmad-bolt-app` folder I gave you on your computer, select
   **all the files and folders inside it** (not the outer folder itself —
   go one level in), and drag them into the browser window.
6. Scroll down, click the green **Commit changes** button.

Your code is now stored on GitHub. You never need to touch GitHub again
after this unless we update the code later.

### Deploy it on Railway

7. Go to **[railway.app](https://railway.app)** and sign up — the easiest
   way is **"Login with GitHub"**, using the account you just made.
8. Click **New Project**.
9. Choose **Deploy from GitHub repo**.
10. If asked, click **Configure GitHub App** and give Railway access to the
    `ask-ahmad-bolt-app` repo you created (you can restrict it to just that
    one repo).
11. Select the `ask-ahmad-bolt-app` repo from the list. Railway will start
    trying to deploy it — that's expected, it'll fail at first because it's
    missing the secret values. That's the next step.

### Add the secret values

12. In your Railway project, click on the service box (it'll be named
    something like `ask-ahmad-bolt-app`).
13. Click the **Variables** tab.
14. Click **New Variable** and add each of these four, one at a time,
    pasting in the values you saved in Part 1:
    - `SLACK_BOT_TOKEN`
    - `SLACK_APP_TOKEN`
    - `SLACK_SIGNING_SECRET`
    - `STRATEGY_CHANNEL_ID`
15. Leave `DOWNSTREAM_WEBHOOK_URL` out for now — it's for a piece that isn't
    built yet.
16. After adding all four, Railway will automatically redeploy. Click the
    **Deployments** tab and wait for the latest deployment to show a green
    checkmark. If it shows red, click into it and check the log for a
    message — it's almost always a typo in one of the four values.

Once it's green, the app is live and connected to Slack.

---

## Part 3 — Turn on the button in Slack (2 min)

1. Go back to Slack, to the Power Positioning channel.
2. Type `/ask-ahmad-setup` and send it.
3. You should get a private message back saying it posted and pinned the
   button. Look at the top of the channel — you'll see the pinned "Ask
   Ahmad" message with the button.

That's it — the app is live. Anyone in that channel can now click the
button, fill out the form, and their question posts publicly for everyone
to see, exactly like the mockup I showed you.

---

## Making updates later (reference for future changes)

Any time I (or another developer) give you updated code — new files, or
changes to existing ones — here's the general pattern to get them live.
This is the same thing you did during initial setup, just written down for
next time so you don't have to rely on remembering it.

1. **Get the updated file(s).** I'll tell you exactly which file names
   changed — sometimes just one, sometimes several. You don't need to
   re-upload the whole project each time, only the files that changed.
2. **Open your GitHub repo** (`ask-ahmad-bolt-app`, the one from Part 2).
3. **For each changed file**: click on its filename in the file list, then
   click the **pencil icon** (top right of the file view) to edit it.
4. **Select all the existing text** in the editor (Cmd+A / Ctrl+A) and
   delete it.
5. **Paste in the new content** I gave you for that file.
6. Scroll down, click the green **Commit changes** button. Leave "Commit
   directly to the `main` branch" selected — don't choose "Create a new
   branch."
7. Repeat for any other changed files.
8. **Wait for Railway to redeploy.** This happens automatically, usually
   within a minute or two of the GitHub commit — no action needed on your
   end. Go to your Railway project → **Deployments** tab and wait for a new
   entry with a green checkmark. If you're not sure it picked up the change,
   check the timestamp on the latest deployment — it should be recent.
9. **If a new environment variable was introduced** (rare, but happens for
   bigger features — e.g. a new integration needing its own API key), I'll
   tell you the exact name to add. Go to Railway → **Variables** tab → **New
   Variable** → paste in the name and value, same as during initial setup.
10. **Test the change** by trying the relevant flow in Slack (clicking the
    button, submitting a question, etc.) before considering it done.

A couple of things that trip people up:
- **Only replace files that actually changed.** If I only mention `app.js`
  and `config.js`, leave the other files alone — pasting old content over a
  file that didn't change won't break anything, but it's unnecessary work
  and risks accidentally reverting something.
- **Copy the *entire* file content**, not just the part that looks
  different. Partial pastes are the most common way this goes wrong — the
  file ends up with leftover old code mixed with new code, which usually
  causes the whole app to fail on deploy (you'll see a red X in Railway's
  Deployments tab instead of green).
- **If Railway shows a red X after a commit**, click into that deployment
  and click **View Logs** — the error near the bottom almost always points
  to what went wrong (commonly a partial paste, per the point above).

---

## If something doesn't work

- **The `/ask-ahmad-setup` command doesn't show up when you type it in
  Slack** — go back to Part 1, step 15, and make sure the bot is invited to
  the channel. Also double check the Railway deployment is green (Part 2,
  step 16).
- **You get an error saying the bot isn't in the channel** — run
  `/invite @Ask Ahmad` in that channel, then try `/ask-ahmad-setup` again.
- **Railway deployment keeps failing (red X)** — click into the failed
  deployment, click **View Logs**, and look for a red error line near the
  bottom. It will almost always mention one of the four variable names —
  that means that value was copied wrong (extra space, missing character,
  etc.). Go back to Part 1 to re-copy it, then update it in Railway's
  Variables tab.
- **Nothing happens when you click the "Ask Ahmad" button** — this usually
  means Railway isn't currently running (check the Deployments tab for a
  green checkmark). Railway's free tier can pause an app after a period of
  no activity — if that keeps happening, let me know and we can look at a
  small always-on upgrade (a few dollars a month).

If you get stuck at any step, tell me exactly what you see on screen (a
screenshot helps a lot) and I'll walk you through it from there.
