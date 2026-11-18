# Hub

A one-page launcher for sites, projects and saved artifacts.
Everything shown comes from `hub.json`, so adding an item means editing that file.

## Put it online with GitHub Pages

To publish this repository:

1. Make sure the repository is public (free GitHub Pages needs that).
2. Go to **Settings → Pages**. Under "Build and deployment", set the source to **Deploy from a branch**, choose `main` and `/ (root)`, then save.
3. After a minute or so, the hub is live at `https://<username>.github.io/<repository>/`.

## Install it as an app (Android)

The hub is a Progressive Web App. On Android, open it in Chrome and tap **Install app**: either the button in the hub's toolbar or the one in Chrome's ⋮ menu.
It then gets its own home-screen icon, opens full-screen, and works offline:

- The hub and every app in `apps/` are saved on the phone, including apps added later.
- When you're online, pages and `hub.json` always load fresh, so pushed changes show up right away.
- External sites still need internet and open in the browser.

On iPhone, use Safari's **Share → Add to Home Screen**.

Files involved: `manifest.webmanifest` (name, colours, icons), `sw.js` (offline support) and `icons/`.

## Add an item

Open `hub.json` on GitHub, click the pencil icon, and add an entry to `items`:

```json
{
  "title": "My new site",
  "url": "https://example.com",
  "type": "site",
  "description": "What it is, in one line",
  "tags": ["tool"],
  "host": "GitHub Pages",
  "repo": "https://github.com/your-username/my-new-site",
  "created": "2026-11-18",
  "pinned": false,
  "archived": false
}
```

Remember the comma between entries. GitHub Pages republishes in about a minute.

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Card heading |
| `url` | yes | Where the card links |
| `type` | yes | `site`, `project` or `artifact` |
| `description` | no | One short line |
| `tags` | no | Become filter chips automatically |
| `host` | no | e.g. GitHub Pages, Vercel, Netlify, Claude artifact |
| `icon` | no | An emoji (`"🃏"`), an image path (`"apps/game/icon.png"`) or an image URL. Without it, local pages use their own favicon if they have one, external sites use their favicon, and anything else shows the title's first letter |
| `repo` | no | Adds a small "repo ↗" link to the card |
| `created` | no | `YYYY-MM-DD`. Newest items are listed first |
| `pinned` | no | `true` puts it in the Pinned row |
| `archived` | no | `true` hides it unless "Show archived" is on |

## Saving Claude artifacts

Saved artifacts live as full copies in `apps/<name>/index.html`, so they work without claude.ai.
Add one as an item with `"type": "artifact"` and a relative `url` such as `"apps/<name>/"`.

## Shortcuts

- `/` or `Ctrl/⌘ + K` focuses search
- `Enter` in search opens the first result
- `Esc` clears search

## Preview on your computer

Browsers block `hub.json` when `index.html` is opened directly as a file. Run a tiny local server from this folder instead:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Notes

- **Check status** pings every URL from your browser. Green means the site answered and red means it didn't.
  It's a rough check: a page that loads but shows an error still counts as green.
- Without an `icon`, external sites' favicons come from Google's favicon service. If nothing is found, the card shows the title's first letter.
