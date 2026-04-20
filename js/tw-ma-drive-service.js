/* ============================================================
   TW Baustellen-App · Drive-Service (Etappe 4b)
   ============================================================
   Read-Only-Zugriff auf den Staging-Bereich per Public-API-Key.

   Voraussetzungen (muessen auf Master-App-Seite erledigt sein):
   - Staging-Parent-Ordner per Link-Sharing freigegeben:
       "Jeder mit dem Link (Zuschauer)"
   - In Firebase /aktive_baustellen/{id}/ ist staging_folder_id
     gesetzt (Drive-Folder-ID des Baustellen-Root im Staging)
   - API-Key in TWMaConfig.DRIVE_CONFIG.apiKey hinterlegt ODER
     in localStorage unter "tw-ma-google-api-key"

   Oeffentliche API:
   - isReady()                             -> bool
   - getApiKey()                           -> string oder ''
   - setApiKey(key)                        -> speichert in localStorage
   - clearCache()                          -> leert den Memory-Cache
   - listFolder(folderId)                  -> Promise<Eintrag[]>
   - findChildByName(parentId, name)       -> Promise<Eintrag|null>
   - listKachelFolder(baustelle, kachelId) -> Promise<Ergebnis>
   - getFileMetadata(fileId)               -> Promise<Eintrag>
   - getFileContentUrl(fileId)             -> string (Image-URL, public)
   - getPdfEmbedUrl(fileId)                -> string (iframe-src)
   - getDownloadUrl(fileId)                -> string (direct download)
   - getViewUrl(fileId)                    -> string (Drive-Weboberflaeche)

   Eintrag = {
     id, name, mimeType, size, modifiedTime,
     isFolder, isImage, isPdf, isOffice,
     iconName, sizeHuman, modifiedHuman
   }
   ============================================================
*/

(function(global){
    'use strict';

    // ============================================================
    // Interner State
    // ============================================================

    const API_KEY_STORAGE_KEY = 'tw-ma-google-api-key';
    const cache = {};   // key: 'list:<folderId>' | 'meta:<fileId>'  -> {ts, data}

    // Mapping: Sub-Kachel-ID -> Drive-Ordnername (muss identisch zur Master-App sein)
    const KACHEL_FOLDER_NAME = {
        'zeichnungen':     'Zeichnungen',
        'anweisungen':     'Anweisungen',
        'baustellendaten': 'Baustellendaten',
        'fotos':           'Fotos',
        'stunden':         'Stunden'
    };

    // ============================================================
    // Config-Aufloesung
    // ============================================================

    function getApiKey() {
        // 1. localStorage-Override (fuer Tests ohne Rebuild)
        try {
            const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
            if (stored && stored.length > 10) return stored;
        } catch(e) { /* ignore */ }
        // 2. Eingebauter Key aus Config
        const cfg = global.TWMaConfig && global.TWMaConfig.DRIVE_CONFIG;
        if (cfg && cfg.apiKey && cfg.apiKey.length > 10) return cfg.apiKey;
        return '';
    }

    function setApiKey(key) {
        try {
            if (!key) {
                localStorage.removeItem(API_KEY_STORAGE_KEY);
            } else {
                localStorage.setItem(API_KEY_STORAGE_KEY, key);
            }
            clearCache();
            return true;
        } catch(e) {
            console.warn('[TWMaDriveService] setApiKey-Fehler:', e);
            return false;
        }
    }

    function getConfig() {
        const base = (global.TWMaConfig && global.TWMaConfig.DRIVE_CONFIG) || {};
        return {
            apiBaseUrl:   base.apiBaseUrl   || 'https://www.googleapis.com/drive/v3',
            listPageSize: base.listPageSize || 200,
            cacheTtlMs:   base.cacheTtlMs   || 5 * 60 * 1000
        };
    }

    function isReady() {
        return !!getApiKey();
    }

    function clearCache() {
        Object.keys(cache).forEach(function(k){ delete cache[k]; });
    }

    // ============================================================
    // Cache-Helper
    // ============================================================

    function cacheGet(key) {
        const entry = cache[key];
        if (!entry) return null;
        const ttl = getConfig().cacheTtlMs;
        if (Date.now() - entry.ts > ttl) {
            delete cache[key];
            return null;
        }
        return entry.data;
    }

    function cacheSet(key, data) {
        cache[key] = { ts: Date.now(), data: data };
    }

    // ============================================================
    // Mime-Helper + Formatierung
    // ============================================================

    function isFolder(mime) {
        return mime === 'application/vnd.google-apps.folder';
    }

    function isImage(mime) {
        if (!mime) return false;
        return mime.indexOf('image/') === 0;
    }

    function isPdf(mime) {
        return mime === 'application/pdf';
    }

    function isOffice(mime) {
        if (!mime) return false;
        return mime.indexOf('application/vnd.openxmlformats-officedocument') === 0
            || mime.indexOf('application/vnd.ms-') === 0
            || mime === 'application/msword'
            || mime === 'application/vnd.oasis.opendocument.text'
            || mime === 'application/vnd.oasis.opendocument.spreadsheet';
    }

    function iconForMime(mime) {
        if (isFolder(mime)) return 'ordner';
        if (isImage(mime))  return 'bild';
        if (isPdf(mime))    return 'pdf';
        return 'datei';
    }

    function formatSize(bytes) {
        const n = Number(bytes);
        if (!n || isNaN(n) || n <= 0) return '';
        if (n < 1024) return n + ' B';
        if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
        if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
        return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    function formatModified(iso) {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return '';
            // Kurzes Datum: TT.MM.JJJJ HH:MM
            const pad = function(x){ return x < 10 ? '0'+x : ''+x; };
            return pad(d.getDate()) + '.' + pad(d.getMonth()+1) + '.' + d.getFullYear()
                 + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        } catch(e) {
            return '';
        }
    }

    function augmentEntry(raw) {
        const mime = raw.mimeType || '';
        return {
            id:             raw.id,
            name:           raw.name || '(ohne Namen)',
            mimeType:       mime,
            size:           raw.size || null,
            modifiedTime:   raw.modifiedTime || null,
            isFolder:       isFolder(mime),
            isImage:        isImage(mime),
            isPdf:          isPdf(mime),
            isOffice:       isOffice(mime),
            iconName:       iconForMime(mime),
            sizeHuman:      formatSize(raw.size),
            modifiedHuman:  formatModified(raw.modifiedTime)
        };
    }

    // ============================================================
    // HTTP-Helper
    // ============================================================

    function buildListUrl(folderId) {
        const cfg = getConfig();
        const q   = "'" + folderId + "' in parents and trashed=false";
        const fields = 'files(id,name,mimeType,size,modifiedTime),nextPageToken';
        const params = new URLSearchParams({
            q:         q,
            fields:    fields,
            pageSize:  String(cfg.listPageSize),
            orderBy:   'folder,name',
            key:       getApiKey()
        });
        return cfg.apiBaseUrl + '/files?' + params.toString();
    }

    function buildMetaUrl(fileId) {
        const cfg = getConfig();
        const fields = 'id,name,mimeType,size,modifiedTime';
        const params = new URLSearchParams({
            fields: fields,
            key:    getApiKey()
        });
        return cfg.apiBaseUrl + '/files/' + encodeURIComponent(fileId) + '?' + params.toString();
    }

    function httpGetJson(url) {
        return fetch(url, { method: 'GET' }).then(function(res){
            if (!res.ok) {
                return res.text().then(function(txt){
                    const err = new Error('Drive-API HTTP ' + res.status);
                    err.status = res.status;
                    err.body = txt;
                    throw err;
                });
            }
            return res.json();
        });
    }

    // ============================================================
    // Public: Listing
    // ============================================================

    function listFolder(folderId) {
        if (!folderId) return Promise.reject(new Error('listFolder: folderId fehlt'));
        if (!isReady()) return Promise.reject(new Error('drive-not-ready'));

        const cacheKey = 'list:' + folderId;
        const cached = cacheGet(cacheKey);
        if (cached) return Promise.resolve(cached);

        return httpGetJson(buildListUrl(folderId)).then(function(json){
            const files = (json && json.files) || [];
            const entries = files.map(augmentEntry);
            cacheSet(cacheKey, entries);
            return entries;
        });
    }

    function findChildByName(parentId, name) {
        // Sucht einen Ordner/Datei mit genau diesem Namen im Parent.
        // Nutzt listFolder mit Cache, damit wir nicht fuer jede Sub-Kachel
        // einen eigenen Request stellen.
        return listFolder(parentId).then(function(entries){
            const lower = String(name).toLowerCase();
            const hit = entries.find(function(e){
                return e.name && e.name.toLowerCase() === lower;
            });
            return hit || null;
        });
    }

    function getFileMetadata(fileId) {
        if (!fileId) return Promise.reject(new Error('getFileMetadata: fileId fehlt'));
        if (!isReady()) return Promise.reject(new Error('drive-not-ready'));

        const cacheKey = 'meta:' + fileId;
        const cached = cacheGet(cacheKey);
        if (cached) return Promise.resolve(cached);

        return httpGetJson(buildMetaUrl(fileId)).then(function(json){
            const entry = augmentEntry(json || {});
            cacheSet(cacheKey, entry);
            return entry;
        });
    }

    // ============================================================
    // Public: URL-Builder fuer Vorschau / Download
    // ============================================================

    function getFileContentUrl(fileId) {
        // Direkt-URL zu den Bytes. Funktioniert nur, wenn die Datei
        // oeffentlich geteilt ist (der Browser ruft OHNE API-Key ab).
        // Fuer Bilder: im <img src=...> verwendbar.
        return 'https://drive.google.com/uc?export=view&id=' + encodeURIComponent(fileId);
    }

    function getPdfEmbedUrl(fileId) {
        // PDF-Preview via Google-Viewer (iframe-src)
        return 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/preview';
    }

    function getDownloadUrl(fileId) {
        return 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(fileId);
    }

    function getViewUrl(fileId) {
        return 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/view';
    }

    // ============================================================
    // Public: Aufloesung pro Sub-Kachel
    //
    // Loest fuer eine gegebene Baustelle + Kachel-ID den richtigen
    // Drive-Ordner auf und gibt dessen Inhalt zurueck.
    //
    // Strategie:
    //   1. Wenn baustelle.staging_folder_ids[kachelId] gesetzt -> direkt nehmen
    //   2. Sonst: baustelle.staging_folder_id listen, Name-Match
    //
    // Rueckgabe: {
    //   kind: 'ok' | 'keinApiKey' | 'nichtKonfig' | 'unterordnerFehlt' | 'fehler',
    //   eintraege?: Eintrag[],     (bei kind='ok')
    //   folderId?:  string,        (bei kind='ok', fuer Breadcrumb)
    //   missingName?: string,      (bei kind='unterordnerFehlt')
    //   fehler?: Error             (bei kind='fehler')
    // }
    // ============================================================

    function listKachelFolder(baustelle, kachelId) {
        if (!isReady()) {
            return Promise.resolve({ kind: 'keinApiKey' });
        }
        if (!baustelle || !baustelle.staging_folder_id) {
            return Promise.resolve({ kind: 'nichtKonfig' });
        }
        const folderName = KACHEL_FOLDER_NAME[kachelId];
        if (!folderName) {
            return Promise.resolve({ kind: 'fehler', fehler: new Error('unbekannte Kachel: '+kachelId) });
        }

        // Shortcut: Direkte Folder-IDs pro Kachel (optional in der Master-App)
        if (baustelle.staging_folder_ids && baustelle.staging_folder_ids[kachelId]) {
            const directId = baustelle.staging_folder_ids[kachelId];
            return listFolder(directId).then(function(entries){
                return { kind: 'ok', eintraege: entries, folderId: directId };
            }).catch(function(err){
                return { kind: 'fehler', fehler: err };
            });
        }

        // Fallback: Unterordner per Name suchen
        return findChildByName(baustelle.staging_folder_id, folderName).then(function(folder){
            if (!folder) {
                return { kind: 'unterordnerFehlt', missingName: folderName };
            }
            if (!folder.isFolder) {
                return { kind: 'fehler', fehler: new Error('"'+folderName+'" ist keine Ordner') };
            }
            return listFolder(folder.id).then(function(entries){
                return { kind: 'ok', eintraege: entries, folderId: folder.id };
            });
        }).catch(function(err){
            return { kind: 'fehler', fehler: err };
        });
    }

    // ============================================================
    // Export
    // ============================================================

    global.TWMaDriveService = {
        isReady:           isReady,
        getApiKey:         getApiKey,
        setApiKey:         setApiKey,
        clearCache:        clearCache,

        listFolder:        listFolder,
        findChildByName:   findChildByName,
        listKachelFolder:  listKachelFolder,
        getFileMetadata:   getFileMetadata,

        getFileContentUrl: getFileContentUrl,
        getPdfEmbedUrl:    getPdfEmbedUrl,
        getDownloadUrl:    getDownloadUrl,
        getViewUrl:        getViewUrl,

        // Helper-Exports (nuetzlich fuer UI)
        isFolder:          isFolder,
        isImage:           isImage,
        isPdf:             isPdf,
        isOffice:          isOffice,
        iconForMime:       iconForMime,
        formatSize:        formatSize,
        formatModified:    formatModified
    };

    console.log('[TWMaDriveService] Etappe-4b-Vollausbau geladen. ApiKey:', isReady() ? 'gesetzt' : 'FEHLT');

})(window);
