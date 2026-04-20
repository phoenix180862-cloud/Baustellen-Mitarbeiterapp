/* ============================================================
   TW Baustellen-App - Service Worker (Etappe 2)
   ============================================================
   Strategie:
   - App-Shell (HTML/CSS/JS/Icons):     cache-first, mit Netz-Revalidate
   - Google Fonts:                      stale-while-revalidate
   - Firebase/Googleapis:               network-only (Echtzeit-Sync)
   - Navigations-Requests:              network-first mit offline.html Fallback
   - Bilder:                            cache-first mit LRU-Limit (50 Entries)

   Update-Flow:
   1. SW install: neues Bundle im Cache
   2. SW activate: alte Caches loeschen + Clients informieren
   3. Clients koennen per Message 'skipWaiting' ein Update forcen
   ============================================================
*/

const CACHE_VERSION   = 'tw-ma-v1.0.1';
const SHELL_CACHE     = CACHE_VERSION + '-shell';
const RUNTIME_CACHE   = CACHE_VERSION + '-runtime';
const IMG_CACHE       = CACHE_VERSION + '-img';
const IMG_CACHE_MAX   = 50;

const APP_SHELL = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './css/tw-ma-design.css',
    './js/tw-ma-core.js',
    './js/tw-ma-storage.js',
    './js/tw-ma-config.js',
    './js/tw-ma-firebase.js',
    './js/tw-ma-drive-service.js',
    './js/tw-ma-translation.js',
    './icons/icon-72.png',
    './icons/icon-96.png',
    './icons/icon-128.png',
    './icons/icon-144.png',
    './icons/icon-152.png',
    './icons/icon-192.png',
    './icons/icon-384.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png',
    './icons/favicon.ico'
];

// ============================================================
// Install
// ============================================================

self.addEventListener('install', function(event){
    console.log('[SW ' + CACHE_VERSION + '] install');
    event.waitUntil(
        caches.open(SHELL_CACHE).then(function(cache){
            return Promise.all(APP_SHELL.map(function(url){
                return cache.add(url).catch(function(err){
                    console.warn('[SW] Konnte nicht cachen:', url, err.message);
                });
            }));
        }).then(function(){
            return self.skipWaiting();
        })
    );
});

// ============================================================
// Activate: alte Caches loeschen + Clients informieren
// ============================================================

self.addEventListener('activate', function(event){
    console.log('[SW ' + CACHE_VERSION + '] activate');
    event.waitUntil(
        caches.keys().then(function(keys){
            return Promise.all(keys.map(function(k){
                if (k.indexOf(CACHE_VERSION) !== 0) {
                    console.log('[SW] Loesche alten Cache:', k);
                    return caches.delete(k);
                }
            }));
        }).then(function(){
            return self.clients.claim();
        }).then(function(){
            return self.clients.matchAll({ type: 'window' }).then(function(clients){
                clients.forEach(function(client){
                    client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
                });
            });
        })
    );
});

// ============================================================
// Fetch
// ============================================================

self.addEventListener('fetch', function(event){
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // 1) Firebase / Googleapis: network-only
    if (url.hostname.indexOf('firebaseio.com') >= 0 ||
        url.hostname.indexOf('firebasedatabase.app') >= 0 ||
        url.hostname.indexOf('googleapis.com') >= 0 ||
        url.hostname.indexOf('firebaseapp.com') >= 0) {
        return;
    }

    // 2) Navigations-Requests: network-first, sonst offline.html
    if (req.mode === 'navigate') {
        event.respondWith(handleNavigation(req));
        return;
    }

    // 3) Bilder: cache-first mit LRU
    if (req.destination === 'image') {
        event.respondWith(cacheFirstWithLimit(req, IMG_CACHE, IMG_CACHE_MAX));
        return;
    }

    // 4) App-Shell: cache-first
    if (isInAppShell(url.pathname)) {
        event.respondWith(cacheFirst(req, SHELL_CACHE));
        return;
    }

    // 5) Google Fonts + CDN: stale-while-revalidate
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

// ============================================================
// Strategien
// ============================================================

async function handleNavigation(request) {
    try {
        const network = await fetch(request);
        if (network && network.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put('./index.html', network.clone()).catch(function(){});
            return network;
        }
        throw new Error('network not ok');
    } catch (err) {
        const cache = await caches.open(SHELL_CACHE);
        const cached = await cache.match('./index.html');
        if (cached) return cached;
        const offline = await cache.match('./offline.html');
        if (offline) return offline;
        return new Response(
            '<h1>Offline</h1><p>Keine gecachte Version verfuegbar.</p>',
            { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
    }
}

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone()).catch(function(){});
        return response;
    } catch (err) {
        return new Response('Offline und nicht im Cache', { status: 503 });
    }
}

async function cacheFirstWithLimit(request, cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone()).then(function(){
                trimCache(cacheName, maxEntries);
            });
        }
        return response;
    } catch (err) {
        return new Response('', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkPromise = fetch(request).then(function(response){
        if (response && response.ok) cache.put(request, response.clone()).catch(function(){});
        return response;
    }).catch(function(){ return null; });
    return cached || networkPromise || new Response('Offline', { status: 503 });
}

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
        for (let i = 0; i < keys.length - maxEntries; i++) {
            await cache.delete(keys[i]);
        }
    }
}

// ============================================================
// Helper
// ============================================================

function isInAppShell(pathname) {
    return APP_SHELL.some(function(shellUrl){
        if (shellUrl === './') return pathname === '/' || pathname.endsWith('/');
        const clean = shellUrl.replace(/^\.\//, '');
        return pathname.endsWith(clean);
    });
}

// ============================================================
// Message-Handler
// ============================================================

self.addEventListener('message', function(event){
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    if (event.data && event.data.action === 'getVersion') {
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ version: CACHE_VERSION });
        }
    }
});
