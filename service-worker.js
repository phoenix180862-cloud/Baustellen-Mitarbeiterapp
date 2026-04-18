// ============================================================
// TW Baustellen-App  -  Service Worker (Etappe 2)
// ============================================================
// - App-Shell-Cache fuer Offline-Faehigkeit
// - Cache-Versionierung (Update triggert Neuladen alter Caches)
// - Cache-First fuer statische Assets
// - Network-First fuer HTML (damit Code-Updates schnell kommen)
// - Firebase/Drive/Gemini NIE gecached (Live-Daten)
// - Push-Handler-Skelett fuer Etappe 7
// ============================================================

const CACHE_VERSION = 'v0.5.0-e5';
const CACHE_NAME    = 'tw-ma-' + CACHE_VERSION;

// App-Shell: statische Assets, die offline verfuegbar sein muessen.
// Wir cachen OPTIMISTISCH - falls eine Datei fehlt, bricht install nicht ab.
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './css/tw-ma-design.css',
    './js/tw-ma-core.js',
    './js/tw-ma-storage.js',
    './js/tw-ma-config.js',
    './js/tw-ma-firebase.js',
    './js/tw-ma-drive-service.js',
    './js/tw-ma-translation.js',
    './js/tw-ma-sync.js',
    './icons/icon-72.png',
    './icons/icon-96.png',
    './icons/icon-128.png',
    './icons/icon-144.png',
    './icons/icon-152.png',
    './icons/icon-180.png',
    './icons/icon-192.png',
    './icons/icon-384.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png',
    './icons/apple-touch-icon.png'
];

// ===== Install ===============================================
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            // Jede Datei einzeln cachen, damit ein Fehler nicht alles kippt
            return Promise.all(APP_SHELL.map(function(url) {
                return cache.add(url).catch(function(err) {
                    console.warn('SW: konnte nicht cachen:', url, err.message);
                });
            }));
        })
    );
    // Sofort aktiv werden
    self.skipWaiting();
});

// ===== Activate: alte Caches loeschen ========================
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(n) { return n.startsWith('tw-ma-') && n !== CACHE_NAME; })
                     .map(function(n) {
                         console.log('SW: alten Cache loeschen:', n);
                         return caches.delete(n);
                     })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// ===== Fetch-Strategie =======================================
self.addEventListener('fetch', function(event) {
    const req = event.request;
    const url = new URL(req.url);

    // Nur GET-Requests behandeln
    if (req.method !== 'GET') return;

    // Firebase, Drive, Gemini: NIE cachen (Live-Daten)
    const liveDomains = ['firebaseio.com', 'googleapis.com', 'gstatic.com',
                         'google.com', 'googleusercontent.com', 'cloudfunctions.net'];
    if (liveDomains.some(function(d) { return url.hostname.indexOf(d) !== -1; })) {
        return; // Browser uebernimmt direkt
    }

    // CDN-Assets (React, Babel, jsPDF): Cache-First
    const cdnDomains = ['unpkg.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
    const isCdn = cdnDomains.some(function(d) { return url.hostname.indexOf(d) !== -1; });

    // HTML-Seiten: Network-First (damit Updates schnell wirken)
    const isHtml = req.headers.get('accept') && req.headers.get('accept').indexOf('text/html') !== -1;

    if (isHtml && !isCdn) {
        // Network-First
        event.respondWith(
            fetch(req).then(function(res) {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(function(cache) { cache.put(req, clone); });
                return res;
            }).catch(function() {
                return caches.match(req).then(function(cached) {
                    return cached || caches.match('./index.html');
                });
            })
        );
        return;
    }

    // Alles andere (Assets, CDN): Cache-First
    event.respondWith(
        caches.match(req).then(function(cached) {
            if (cached) return cached;
            return fetch(req).then(function(res) {
                // Nur erfolgreiche Responses cachen
                if (res && res.status === 200 && res.type !== 'opaque') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(function(cache) { cache.put(req, clone); });
                }
                return res;
            }).catch(function() {
                // Offline + nicht im Cache
                return new Response('Offline', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});

// ===== Nachrichten zwischen App und SW =======================
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(function(names) {
                return Promise.all(names.map(function(n) { return caches.delete(n); }));
            })
        );
    }
});

// ===== Push-Handler (Skelett - Vollausbau Etappe 7) ==========
self.addEventListener('push', function(event) {
    let payload = { title: 'TW Baustelle', body: 'Neue Nachricht' };
    if (event.data) {
        try { payload = event.data.json(); }
        catch (e) { payload.body = event.data.text(); }
    }

    event.waitUntil(
        self.registration.showNotification(payload.title || 'TW Baustelle', {
            body: payload.body || '',
            icon: './icons/icon-192.png',
            badge: './icons/icon-96.png',
            tag: payload.tag || 'tw-default',
            vibrate: [150, 80, 150],
            data: payload.data || {}
        })
    );
});

// ===== Notification-Click =====================================
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || './';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // Offenes Fenster fokussieren wenn vorhanden
            for (const client of windowClients) {
                if ('focus' in client) return client.focus();
            }
            // Sonst neues Fenster oeffnen
            if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
        })
    );
});
