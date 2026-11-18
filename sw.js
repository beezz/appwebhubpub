// Offline support for the hub.
// Strategy: pages and hub.json are network-first (fresh when online, cached copy when offline);
// everything else from this site (icons, images, fonts) is served from cache and refreshed in the background.
// The hub and every local app listed in hub.json are saved on install, so they work offline right away.

const CACHE = "hub-v1";
const CORE = ["./", "index.html", "hub.json", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/favicon-64.png"];

// Save every local app and icon listed in hub.json that isn't cached yet.
async function cacheListed(data) {
  const cache = await caches.open(CACHE);
  const local = (u) => u && !/^[a-z]+:/i.test(u);
  const urls = [];
  for (const it of data.items || []) {
    if (local(it.url)) urls.push(it.url);
    if (local(it.icon) && /[\/.]/.test(it.icon)) urls.push(it.icon);
  }
  await Promise.all(urls.map(async (u) => {
    if (!(await cache.match(u))) await cache.add(u).catch(() => {});
  }));
}

async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(CORE);
  try {
    const res = await fetch("hub.json", { cache: "no-store" });
    await cacheListed(await res.json());
  } catch {}
}

self.addEventListener("install", (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req, { cache: "no-store" });
    if (res.ok) {
      cache.put(req, res.clone());
      if (new URL(req.url).pathname.endsWith("/hub.json")) res.clone().json().then(cacheListed).catch(() => {});
    }
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match("./")) || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const fresh = fetch(req).then((res) => {
    if (res.ok || res.type === "opaque") cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fresh;
}

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin && (req.mode === "navigate" || url.pathname.endsWith("/hub.json"))) {
    e.respondWith(networkFirst(req));
  } else if (sameOrigin || FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req));
  }
});
