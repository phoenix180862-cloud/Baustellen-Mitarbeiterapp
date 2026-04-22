// ============================================================
// TW Baustellen-App · Firebase Messaging Service Worker
// ============================================================
// Diese Datei MUSS im Root der App liegen (nicht in js/), damit
// Firebase sie als Messaging-SW registrieren kann. Der Datei-
// Name ist vom Firebase-SDK vorgegeben.
//
// Aufgabe:
//   - Lauschen auf FCM-Nachrichten im Hintergrund (App geschlossen
//     oder nicht sichtbar).
//   - System-Notification anzeigen.
//   - Bei Klick: App oeffnen bzw. fokussieren.

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// ──────────────────────────────────────────────────────────
// Firebase-Config (gleiches Projekt wie Master-App + MA-App)
// Diese Werte sind Public — sie stehen auch in index.html.
// ──────────────────────────────────────────────────────────
firebase.initializeApp({
    apiKey:            'AIzaSyAZeQTY5d0WyvUjZW3OUnvlo9-i4A_LPR0',
    authDomain:        'einkaufsliste-98199.firebaseapp.com',
    databaseURL:       'https://einkaufsliste-98199-default-rtdb.firebaseio.com',
    projectId:         'einkaufsliste-98199',
    storageBucket:     'einkaufsliste-98199.firebasestorage.app',
    messagingSenderId: '1007048023194',
    appId:             '1:1007048023194:web:dddc3b8bba5b23ded99d37'
});

const messaging = firebase.messaging();

// Background-Message-Handler
messaging.onBackgroundMessage(function(payload) {
    console.log('[FCM-SW] Background message received:', payload);

    const data = payload.data || {};
    const notification = payload.notification || {};

    // Titel + Body bestimmen (data-Payload hat Prioritaet vor notification-Payload)
    const titel = data.titel || notification.title || 'Nachricht vom Buero';
    const body  = data.body  || notification.body  || '';
    const dringend = data.dringend === 'true' || data.dringend === true;

    const optionen = {
        body:    body,
        icon:    '/icons/icon-192.png',
        badge:   '/icons/icon-96.png',
        tag:     'tw-ma-nachricht-' + (data.nachricht_id || 'generic'),
        renotify: dringend === true, // bei Dringend auch wenn Tag existiert: erneut alerten
        requireInteraction: dringend === true, // Dringende Notifications bleiben bis User reagiert
        data: {
            nachricht_id: data.nachricht_id || null,
            ma_id:        data.ma_id || null,
            dringend:     dringend,
            url:          '/'
        },
        vibrate: dringend ? [300, 100, 300, 100, 300] : [200]
    };

    return self.registration.showNotification(titel, optionen);
});

// Tap auf Notification → App oeffnen / fokussieren
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const data = event.notification.data || {};
    const urlZuOeffnen = data.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Falls die App bereits offen ist: fokussieren
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if ('focus' in client) {
                    // postMessage damit die App zum Nachrichten-Tab wechseln kann
                    try {
                        client.postMessage({
                            type:         'fcm-notification-click',
                            nachricht_id: data.nachricht_id,
                            ma_id:        data.ma_id
                        });
                    } catch(e) {}
                    return client.focus();
                }
            }
            // Sonst: neues Fenster oeffnen
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlZuOeffnen);
            }
        })
    );
});

console.log('[FCM-SW] Firebase Messaging Service Worker geladen.');
