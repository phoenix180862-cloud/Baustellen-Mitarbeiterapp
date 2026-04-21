/* ============================================================
   TW Baustellen-App · Konfiguration (Mitarbeiter-App)
   ============================================================
   Enthaelt globale Konstanten:
   - APP_VERSION
   - SUPPORTED_LANGUAGES
   - UI_LABELS (alle fest verdrahteten Texte in allen Sprachen)
   - DEFAULT_LANG
   - FIREBASE_CONFIG (wird in Etappe 3 befuellt)
   ============================================================
*/

(function (global) {
    'use strict';

    // App-Version — bei jedem Deployment erhoehen
    const APP_VERSION = '1.0.0';

    // Default-Sprache beim ersten App-Start
    const DEFAULT_LANG = 'de';

    // Unterstuetzte Sprachen (Erstaufschlag lt. Master-Dokument Kap. 4.6)
    const SUPPORTED_LANGUAGES = [
        { code: 'de', flag: '🇩🇪', nativeName: 'Deutsch' },
        { code: 'cs', flag: '🇨🇿', nativeName: 'Cestina' },
        { code: 'sk', flag: '🇸🇰', nativeName: 'Slovencina' },
        { code: 'pl', flag: '🇵🇱', nativeName: 'Polski' },
        { code: 'en', flag: '🇬🇧', nativeName: 'English' },
        { code: 'ro', flag: '🇷🇴', nativeName: 'Romana' },
        { code: 'uk', flag: '🇺🇦', nativeName: 'Ukrayinska' }
    ];

    // Firmendaten (Brief-Header)
    const FIRMEN_DATEN = {
        name: 'Thomas Willwacher Fliesenlegermeister e.K.',
        adresse: 'Flurweg 14a \u00B7 56472 Nisterau \u00B7 Tel. 02661-63101'
    };

    // Firebase-Projekt — WICHTIG: apiKey, authDomain, messagingSenderId und appId
    // muessen einmalig aus der Firebase-Console uebertragen werden, damit die
    // Baustellen-App Anonymous-Auth ausfuehren kann. databaseURL und projectId
    // sind bereits korrekt vorbefuellt (identisch zur Master-App einkaufsliste-98199).
    //
    // Wo bekommt man die Werte?
    //   Firebase Console → Projekt-Einstellungen → Allgemein →
    //   Meine Apps → Web-App → Config-Snippet
    //
    // HINWEIS: Diese Werte sind NICHT geheim (sie werden ohnehin zum Browser
    // ausgeliefert). Die Sicherheit kommt aus den Firebase Security Rules.
    const FIREBASE_CONFIG = {
        apiKey: 'AIzaSyBUHOr2dM2H-sUnhNODoVSerM224vPsC_E',
        authDomain: 'einkaufsliste-98199.firebaseapp.com',
        databaseURL: 'https://einkaufsliste-98199-default-rtdb.europe-west1.firebasedatabase.app',
        projectId: 'einkaufsliste-98199',
        storageBucket: 'einkaufsliste-98199.firebasestorage.app',
        messagingSenderId: '411877213047',
        appId: '1:411877213047:web:f04e3b9b98a8d97120d772'
    };

    // Gemini-Wrapper (wird in Etappe 7 befuellt, verschluesselt)
    const TRANSLATION_CONFIG = {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        cacheSize: 500
    };

    // Google-Drive-Zugriff fuer Staging-Browser (Etappe 4b)
    //
    // Die Baustellen-App liest Staging-Dateien read-only ueber einen
    // browserfaehigen Public-API-Key (keine OAuth, kein Service-Account-JWT).
    // Voraussetzung auf der Master-App-Seite:
    //   (a) Staging-Parent-Ordner ist per Link-Sharing "Jeder mit Link kann ansehen"
    //   (b) In /aktive_baustellen/{id}/ ist staging_folder_id gesetzt
    //
    // Sicherheits-Empfehlung: API-Key in der Google-Cloud-Console mit einer
    // HTTP-Referrer-Restriction auf die GitHub-Pages-Domain einschraenken und
    // auf die Drive-API begrenzen (drive.files.list + drive.files.get).
    //
    // Override: Der Key kann zur Laufzeit via localStorage gesetzt werden
    // (Key: tw-ma-google-api-key), damit Tests ohne Rebuild moeglich sind.
    const DRIVE_CONFIG = {
        apiKey: 'AIzaSyDiLxo6AhOOOR1ZYZUQBdIdT2lFXdLmprY',                                // TODO: aus Google-Cloud-Console eintragen
        apiBaseUrl: 'https://www.googleapis.com/drive/v3',
        listPageSize: 200,                              // max. Eintraege pro Ordner-Listing
        cacheTtlMs: 5 * 60 * 1000                     // 5 Minuten fuer Listings
    };

    // ============================================================
    // UI_LABELS: alle statischen Texte in allen Sprachen
    // Keys sind dot-separated: "nav.start", "start.uhr.freitag"
    // Bei fehlender Uebersetzung: Fallback auf Deutsch
    // ============================================================

    const UI_LABELS = {
        de: {
            // Navigations-Tabs
            'nav.start': 'Start',
            'nav.baustellen': 'Baustellen',
            'nav.kalender': 'Kalender',
            'nav.fotos': 'Fotos',
            'nav.stunden': 'Stunden',
            'nav.nachrichten': 'Nachrichten',

            // Header
            'header.titel': 'Baustellen App',
            'header.zurueck': 'Zurueck',
            'header.vor': 'Vor',
            'header.gross': 'A groesser',
            'header.klein': 'A kleiner',

            // Startseite
            'start.untertitel': 'BAUSTELLEN APP',
            'start.sprache': 'Sprache',
            'start.status.online': 'Online',
            'start.status.offline': 'Offline',
            'start.status.sync': 'Letzter Sync',
            'start.status.vorMin': 'vor {n} Min',
            'start.status.neueNachrichten': '{n} neue Nachrichten',
            'start.status.keineNeuen': 'keine neuen Nachrichten',

            // Wochentage (voll)
            'tag.montag': 'Montag',
            'tag.dienstag': 'Dienstag',
            'tag.mittwoch': 'Mittwoch',
            'tag.donnerstag': 'Donnerstag',
            'tag.freitag': 'Freitag',
            'tag.samstag': 'Samstag',
            'tag.sonntag': 'Sonntag',

            // Monate
            'monat.1': 'Januar', 'monat.2': 'Februar', 'monat.3': 'Maerz',
            'monat.4': 'April', 'monat.5': 'Mai', 'monat.6': 'Juni',
            'monat.7': 'Juli', 'monat.8': 'August', 'monat.9': 'September',
            'monat.10': 'Oktober', 'monat.11': 'November', 'monat.12': 'Dezember',

            // Sprach-Auswahl-Modal
            'lang.titel': 'Sprache waehlen',
            'lang.abbrechen': 'Abbrechen',

            // Platzhalter fuer Module
            'platzhalter.baustellen': 'Baustellen-Modul (Etappe 4)',
            'platzhalter.kalender': 'Kalender-Modul (Etappe 8)',
            'platzhalter.fotos': 'Fotos-Modul (Etappe 5)',
            'platzhalter.stunden': 'Stunden-Modul (Etappe 6)',
            'platzhalter.nachrichten': 'Nachrichten-Modul (Etappe 7)',
            'platzhalter.hinweis': 'Dieses Modul wird in einer spaeteren Etappe gebaut.',
            'platzhalter.zurueck': 'Zurueck zur Startseite'
        },

        cs: {
            'nav.start': 'Start',
            'nav.baustellen': 'Stavby',
            'nav.kalender': 'Kalendar',
            'nav.fotos': 'Fotky',
            'nav.stunden': 'Hodiny',
            'nav.nachrichten': 'Zpravy',

            'header.titel': 'Aplikace Stavby',
            'header.zurueck': 'Zpet',
            'header.vor': 'Dopredu',
            'header.gross': 'A vetsi',
            'header.klein': 'A mensi',

            'start.untertitel': 'APLIKACE STAVBY',
            'start.sprache': 'Jazyk',
            'start.status.online': 'Online',
            'start.status.offline': 'Offline',
            'start.status.sync': 'Posledni sync',
            'start.status.vorMin': 'pred {n} min',
            'start.status.neueNachrichten': '{n} novych zprav',
            'start.status.keineNeuen': 'zadne nove zpravy',

            'tag.montag': 'Pondeli',
            'tag.dienstag': 'Utery',
            'tag.mittwoch': 'Streda',
            'tag.donnerstag': 'Ctvrtek',
            'tag.freitag': 'Patek',
            'tag.samstag': 'Sobota',
            'tag.sonntag': 'Nedele',

            'monat.1': 'Leden', 'monat.2': 'Unor', 'monat.3': 'Brezen',
            'monat.4': 'Duben', 'monat.5': 'Kveten', 'monat.6': 'Cerven',
            'monat.7': 'Cervenec', 'monat.8': 'Srpen', 'monat.9': 'Zari',
            'monat.10': 'Rijen', 'monat.11': 'Listopad', 'monat.12': 'Prosinec',

            'lang.titel': 'Zvolte jazyk',
            'lang.abbrechen': 'Zrusit',

            'platzhalter.baustellen': 'Modul Stavby (Etapa 4)',
            'platzhalter.kalender': 'Modul Kalendar (Etapa 8)',
            'platzhalter.fotos': 'Modul Fotky (Etapa 5)',
            'platzhalter.stunden': 'Modul Hodiny (Etapa 6)',
            'platzhalter.nachrichten': 'Modul Zpravy (Etapa 7)',
            'platzhalter.hinweis': 'Tento modul bude postaven v pozdejsi etape.',
            'platzhalter.zurueck': 'Zpet na uvodni stranku'
        },

        sk: {
            'nav.start': 'Start',
            'nav.baustellen': 'Stavby',
            'nav.kalender': 'Kalendar',
            'nav.fotos': 'Fotky',
            'nav.stunden': 'Hodiny',
            'nav.nachrichten': 'Spravy',

            'header.titel': 'Aplikacia Stavby',
            'header.zurueck': 'Spat',
            'header.vor': 'Dopredu',
            'header.gross': 'A vacsie',
            'header.klein': 'A mensie',

            'start.untertitel': 'APLIKACIA STAVBY',
            'start.sprache': 'Jazyk',
            'start.status.online': 'Online',
            'start.status.offline': 'Offline',
            'start.status.sync': 'Posledna sync',
            'start.status.vorMin': 'pred {n} min',
            'start.status.neueNachrichten': '{n} novych sprav',
            'start.status.keineNeuen': 'ziadne nove spravy',

            'tag.montag': 'Pondelok',
            'tag.dienstag': 'Utorok',
            'tag.mittwoch': 'Streda',
            'tag.donnerstag': 'Stvrtok',
            'tag.freitag': 'Piatok',
            'tag.samstag': 'Sobota',
            'tag.sonntag': 'Nedela',

            'monat.1': 'Januar', 'monat.2': 'Februar', 'monat.3': 'Marec',
            'monat.4': 'April', 'monat.5': 'Maj', 'monat.6': 'Jun',
            'monat.7': 'Jul', 'monat.8': 'August', 'monat.9': 'September',
            'monat.10': 'Oktober', 'monat.11': 'November', 'monat.12': 'December',

            'lang.titel': 'Zvolte jazyk',
            'lang.abbrechen': 'Zrusit',

            'platzhalter.baustellen': 'Modul Stavby (Etapa 4)',
            'platzhalter.kalender': 'Modul Kalendar (Etapa 8)',
            'platzhalter.fotos': 'Modul Fotky (Etapa 5)',
            'platzhalter.stunden': 'Modul Hodiny (Etapa 6)',
            'platzhalter.nachrichten': 'Modul Spravy (Etapa 7)',
            'platzhalter.hinweis': 'Tento modul bude postaveny v neskorsom etape.',
            'platzhalter.zurueck': 'Spat na domovsku stranku'
        },

        pl: {
            'nav.start': 'Start',
            'nav.baustellen': 'Budowy',
            'nav.kalender': 'Kalendarz',
            'nav.fotos': 'Zdjecia',
            'nav.stunden': 'Godziny',
            'nav.nachrichten': 'Wiadomosci',

            'header.titel': 'Aplikacja Budowy',
            'header.zurueck': 'Wstecz',
            'header.vor': 'Naprzod',
            'header.gross': 'A wieksze',
            'header.klein': 'A mniejsze',

            'start.untertitel': 'APLIKACJA BUDOWY',
            'start.sprache': 'Jezyk',
            'start.status.online': 'Online',
            'start.status.offline': 'Offline',
            'start.status.sync': 'Ostatnia sync',
            'start.status.vorMin': '{n} min temu',
            'start.status.neueNachrichten': '{n} nowych wiadomosci',
            'start.status.keineNeuen': 'brak nowych wiadomosci',

            'tag.montag': 'Poniedzialek',
            'tag.dienstag': 'Wtorek',
            'tag.mittwoch': 'Sroda',
            'tag.donnerstag': 'Czwartek',
            'tag.freitag': 'Piatek',
            'tag.samstag': 'Sobota',
            'tag.sonntag': 'Niedziela',

            'monat.1': 'Styczen', 'monat.2': 'Luty', 'monat.3': 'Marzec',
            'monat.4': 'Kwiecien', 'monat.5': 'Maj', 'monat.6': 'Czerwiec',
            'monat.7': 'Lipiec', 'monat.8': 'Sierpien', 'monat.9': 'Wrzesien',
            'monat.10': 'Pazdziernik', 'monat.11': 'Listopad', 'monat.12': 'Grudzien',

            'lang.titel': 'Wybierz jezyk',
            'lang.abbrechen': 'Anuluj',

            'platzhalter.baustellen': 'Modul Budowy (Etap 4)',
            'platzhalter.kalender': 'Modul Kalendarz (Etap 8)',
            'platzhalter.fotos': 'Modul Zdjecia (Etap 5)',
            'platzhalter.stunden': 'Modul Godziny (Etap 6)',
            'platzhalter.nachrichten': 'Modul Wiadomosci (Etap 7)',
            'platzhalter.hinweis': 'Ten modul zostanie zbudowany w pozniejszym etapie.',
            'platzhalter.zurueck': 'Wroc do strony glownej'
        },

        en: {
            'nav.start': 'Home',
            'nav.baustellen': 'Sites',
            'nav.kalender': 'Calendar',
            'nav.fotos': 'Photos',
            'nav.stunden': 'Hours',
            'nav.nachrichten': 'Messages',

            'header.titel': 'Construction App',
            'header.zurueck': 'Back',
            'header.vor': 'Forward',
            'header.gross': 'A larger',
            'header.klein': 'A smaller',

            'start.untertitel': 'CONSTRUCTION APP',
            'start.sprache': 'Language',
            'start.status.online': 'Online',
            'start.status.offline': 'Offline',
            'start.status.sync': 'Last sync',
            'start.status.vorMin': '{n} min ago',
            'start.status.neueNachrichten': '{n} new messages',
            'start.status.keineNeuen': 'no new messages',

            'tag.montag': 'Monday',
            'tag.dienstag': 'Tuesday',
            'tag.mittwoch': 'Wednesday',
            'tag.donnerstag': 'Thursday',
            'tag.freitag': 'Friday',
            'tag.samstag': 'Saturday',
            'tag.sonntag': 'Sunday',

            'monat.1': 'January', 'monat.2': 'February', 'monat.3': 'March',
            'monat.4': 'April', 'monat.5': 'May', 'monat.6': 'June',
            'monat.7': 'July', 'monat.8': 'August', 'monat.9': 'September',
            'monat.10': 'October', 'monat.11': 'November', 'monat.12': 'December',

            'lang.titel': 'Choose language',
            'lang.abbrechen': 'Cancel',

            'platzhalter.baustellen': 'Sites module (Stage 4)',
            'platzhalter.kalender': 'Calendar module (Stage 8)',
            'platzhalter.fotos': 'Photos module (Stage 5)',
            'platzhalter.stunden': 'Hours module (Stage 6)',
            'platzhalter.nachrichten': 'Messages module (Stage 7)',
            'platzhalter.hinweis': 'This module will be built in a later stage.',
            'platzhalter.zurueck': 'Back to home'
        },

        ro: {
            'nav.start': 'Start',
            'nav.baustellen': 'Santiere',
            'nav.kalender': 'Calendar',
            'nav.fotos': 'Poze',
            'nav.stunden': 'Ore',
            'nav.nachrichten': 'Mesaje',

            'header.titel': 'Aplicatia Santiere',
            'header.zurueck': 'Inapoi',
            'header.vor': 'Inainte',
            'header.gross': 'A mai mare',
            'header.klein': 'A mai mic',

            'start.untertitel': 'APLICATIA SANTIERE',
            'start.sprache': 'Limba',
            'start.status.online': 'Online',
            'start.status.offline': 'Offline',
            'start.status.sync': 'Ultima sync',
            'start.status.vorMin': 'acum {n} min',
            'start.status.neueNachrichten': '{n} mesaje noi',
            'start.status.keineNeuen': 'niciun mesaj nou',

            'tag.montag': 'Luni',
            'tag.dienstag': 'Marti',
            'tag.mittwoch': 'Miercuri',
            'tag.donnerstag': 'Joi',
            'tag.freitag': 'Vineri',
            'tag.samstag': 'Sambata',
            'tag.sonntag': 'Duminica',

            'monat.1': 'Ianuarie', 'monat.2': 'Februarie', 'monat.3': 'Martie',
            'monat.4': 'Aprilie', 'monat.5': 'Mai', 'monat.6': 'Iunie',
            'monat.7': 'Iulie', 'monat.8': 'August', 'monat.9': 'Septembrie',
            'monat.10': 'Octombrie', 'monat.11': 'Noiembrie', 'monat.12': 'Decembrie',

            'lang.titel': 'Alegeti limba',
            'lang.abbrechen': 'Anulare',

            'platzhalter.baustellen': 'Modul Santiere (Etapa 4)',
            'platzhalter.kalender': 'Modul Calendar (Etapa 8)',
            'platzhalter.fotos': 'Modul Poze (Etapa 5)',
            'platzhalter.stunden': 'Modul Ore (Etapa 6)',
            'platzhalter.nachrichten': 'Modul Mesaje (Etapa 7)',
            'platzhalter.hinweis': 'Acest modul va fi construit intr-o etapa ulterioara.',
            'platzhalter.zurueck': 'Inapoi la pagina principala'
        },

        uk: {
            'nav.start': 'Start',
            'nav.baustellen': 'Budivnytstva',
            'nav.kalender': 'Kalendar',
            'nav.fotos': 'Foto',
            'nav.stunden': 'Hodyny',
            'nav.nachrichten': 'Povidomlennia',

            'header.titel': 'Dodatok Budivnytstva',
            'header.zurueck': 'Nazad',
            'header.vor': 'Vpered',
            'header.gross': 'A bilshe',
            'header.klein': 'A menshe',

            'start.untertitel': 'DODATOK BUDIVNYTSTVA',
            'start.sprache': 'Mova',
            'start.status.online': 'Online',
            'start.status.offline': 'Offline',
            'start.status.sync': 'Ostanniy sync',
            'start.status.vorMin': '{n} khvylyn tomu',
            'start.status.neueNachrichten': '{n} novykh povidomlen',
            'start.status.keineNeuen': 'nemaye novykh povidomlen',

            'tag.montag': 'Ponedilok',
            'tag.dienstag': 'Vivtorok',
            'tag.mittwoch': 'Sereda',
            'tag.donnerstag': 'Chetver',
            'tag.freitag': 'Piatnytsia',
            'tag.samstag': 'Subota',
            'tag.sonntag': 'Nedilia',

            'monat.1': 'Sichen', 'monat.2': 'Liutyi', 'monat.3': 'Berezen',
            'monat.4': 'Kviten', 'monat.5': 'Traven', 'monat.6': 'Cherven',
            'monat.7': 'Lypen', 'monat.8': 'Serpen', 'monat.9': 'Veresen',
            'monat.10': 'Zhovten', 'monat.11': 'Lystopad', 'monat.12': 'Hruden',

            'lang.titel': 'Vyberit movu',
            'lang.abbrechen': 'Skasuvaty',

            'platzhalter.baustellen': 'Modul Budivnytstva (Etap 4)',
            'platzhalter.kalender': 'Modul Kalendar (Etap 8)',
            'platzhalter.fotos': 'Modul Foto (Etap 5)',
            'platzhalter.stunden': 'Modul Hodyny (Etap 6)',
            'platzhalter.nachrichten': 'Modul Povidomlennia (Etap 7)',
            'platzhalter.hinweis': 'Tsey modul bude pobudovano na piznishomu etapi.',
            'platzhalter.zurueck': 'Nazad do holovnoi storinky'
        }
    };

    // ============================================================
    // AUTH: Labels fuer Etappe 3 (Onboarding + PIN-Login + Wipe)
    // Separat definiert, am Ende in UI_LABELS gemerged.
    // ============================================================

    const AUTH_LABELS = {
        de: {
            'auth.setup.titel': 'Erst-Einrichtung',
            'auth.setup.intro': 'Diese App muss einmalig mit dem Buero verbunden werden. Bitte den API-Key vom Chef eintragen.',
            'auth.setup.apikey': 'Firebase API-Key',
            'auth.setup.apikey_hint': 'Beginnt mit "AIza..."',
            'auth.setup.speichern': 'Verbindung speichern',
            'auth.setup.fehler': 'Der API-Key scheint nicht zu passen. Bitte beim Chef nachfragen.',
            'auth.onboard.titel': 'Anmelden',
            'auth.onboard.intro': 'Gib den 6-stelligen Code und deine PIN vom Buero ein.',
            'auth.onboard.code': 'Anmelde-Code',
            'auth.onboard.code_hint': '6 Zeichen, Grossbuchstaben und Zahlen',
            'auth.onboard.pin': 'PIN',
            'auth.onboard.pin_hint': '4-8 Ziffern',
            'auth.onboard.geraet': 'Geraete-Name (optional)',
            'auth.onboard.geraet_hint': 'z.B. "Ivan Privathandy" - hilft dem Buero beim Zuordnen',
            'auth.onboard.submit': 'Anmelden',
            'auth.onboard.pruefe': 'Wird geprueft ...',
            'auth.error.not_found': 'Dieser Code ist unbekannt. Bitte beim Buero nachfragen.',
            'auth.error.wrong_pin': 'Die PIN stimmt nicht. Bitte nochmal versuchen.',
            'auth.error.already_used': 'Dieser Code wurde bereits verwendet.',
            'auth.error.expired': 'Dieser Code ist abgelaufen. Bitte einen neuen anfordern.',
            'auth.error.revoked': 'Dieser Code wurde widerrufen.',
            'auth.error.network': 'Keine Verbindung zum Buero. Bitte Internet pruefen.',
            'auth.error.generic': 'Etwas ist schiefgelaufen. Bitte nochmal versuchen.',
            'auth.warte.titel': 'Warte auf Freigabe',
            'auth.warte.intro': 'Das Buero muss dein Geraet noch freigeben. Das geht meistens schnell.',
            'auth.warte.hinweis': 'Du kannst die App offen lassen - sobald freigegeben, geht es automatisch weiter.',
            'auth.warte.name': 'Angemeldet als:',
            'auth.pinset.titel': 'PIN festlegen',
            'auth.pinset.intro': 'Leg deine persoenliche PIN fest. Die brauchst du beim naechsten App-Start.',
            'auth.pinset.pin': 'Neue PIN (4-8 Ziffern)',
            'auth.pinset.speichern': 'PIN speichern',
            'auth.pinset.mismatch': 'Die PINs stimmen nicht ueberein.',
            'auth.login.titel': 'Willkommen zurueck',
            'auth.login.intro': 'Bitte PIN eingeben.',
            'auth.login.pin': 'Deine PIN',
            'auth.login.oeffnen': 'Oeffnen',
            'auth.login.fehler': 'Falsche PIN. Noch {n} Versuche.',
            'auth.login.gewipt': 'Zu viele Fehlversuche - App wird zurueckgesetzt.',
            'auth.gesperrt.titel': 'Geraet gesperrt',
            'auth.gesperrt.intro': 'Das Buero hat dieses Geraet vorruebergehend gesperrt.',
            'auth.gesperrt.hinweis': 'Bitte beim Buero melden, wenn das ein Fehler ist.',
            'auth.gewipt.titel': 'Zugang entzogen',
            'auth.gewipt.intro': 'Dieses Geraet hat keinen Zugang mehr. Du kannst die App neu einrichten, wenn du einen neuen Code hast.',
            'auth.gewipt.neustart': 'Neu einrichten'
        },
        cs: {
            'auth.setup.titel': 'Prvni nastaveni',
            'auth.setup.intro': 'Tato aplikace musi byt jednou propojena s kancelari. Zadej API-Key od sefa.',
            'auth.setup.apikey': 'Firebase API-Key',
            'auth.setup.apikey_hint': 'Zacina na "AIza..."',
            'auth.setup.speichern': 'Ulozit spojeni',
            'auth.setup.fehler': 'API-Key se nezda spravny. Zeptej se sefa.',
            'auth.onboard.titel': 'Prihlasit',
            'auth.onboard.intro': 'Zadej 6mistny kod a PIN od kancelare.',
            'auth.onboard.code': 'Prihlasovaci kod',
            'auth.onboard.code_hint': '6 znaku, velka pismena a cisla',
            'auth.onboard.pin': 'PIN',
            'auth.onboard.pin_hint': '4-8 cislic',
            'auth.onboard.geraet': 'Nazev zarizeni (nepovinne)',
            'auth.onboard.geraet_hint': 'Napr. "Ivan mobil" - pomuze kancelari',
            'auth.onboard.submit': 'Prihlasit',
            'auth.onboard.pruefe': 'Kontroluje se ...',
            'auth.error.not_found': 'Tento kod neni znamy. Zeptej se kancelare.',
            'auth.error.wrong_pin': 'PIN nesedi. Zkus to znova.',
            'auth.error.already_used': 'Tento kod uz byl pouzit.',
            'auth.error.expired': 'Tento kod vyprsel. Pozadej o novy.',
            'auth.error.revoked': 'Tento kod byl zrusen.',
            'auth.error.network': 'Neni spojeni s kancelari. Zkontroluj internet.',
            'auth.error.generic': 'Neco se pokazilo. Zkus znova.',
            'auth.warte.titel': 'Cekani na schvaleni',
            'auth.warte.intro': 'Kancelar musi jeste schvalit tvoje zarizeni. Obvykle je to rychle.',
            'auth.warte.hinweis': 'Nech aplikaci otevrenou - jakmile je schvaleno, pokracuje automaticky.',
            'auth.warte.name': 'Prihlasen jako:',
            'auth.pinset.titel': 'Nastavit PIN',
            'auth.pinset.intro': 'Nastav svuj osobni PIN. Budes ho potrebovat pri dalsim spusteni.',
            'auth.pinset.pin': 'Novy PIN (4-8 cislic)',
            'auth.pinset.speichern': 'Ulozit PIN',
            'auth.pinset.mismatch': 'PINy se neshoduji.',
            'auth.login.titel': 'Vitej zpet',
            'auth.login.intro': 'Zadej PIN.',
            'auth.login.pin': 'Tvuj PIN',
            'auth.login.oeffnen': 'Otevrit',
            'auth.login.fehler': 'Spatny PIN. Zbyva {n} pokusu.',
            'auth.login.gewipt': 'Prilis mnoho pokusu - aplikace se resetuje.',
            'auth.gesperrt.titel': 'Zarizeni zablokovano',
            'auth.gesperrt.intro': 'Kancelar docasne zablokovala tohle zarizeni.',
            'auth.gesperrt.hinweis': 'Pokud je to chyba, zavolej kancelari.',
            'auth.gewipt.titel': 'Pristup odebran',
            'auth.gewipt.intro': 'Tohle zarizeni uz nema pristup. Muzes se znova prihlasit s novym kodem.',
            'auth.gewipt.neustart': 'Znova nastavit'
        },
        sk: {
            'auth.setup.titel': 'Prve nastavenie',
            'auth.setup.intro': 'Tato aplikacia musi byt raz spojena s kancelariou. Zadaj API-Key od sefa.',
            'auth.setup.apikey': 'Firebase API-Key',
            'auth.setup.apikey_hint': 'Zacina na "AIza..."',
            'auth.setup.speichern': 'Ulozit spojenie',
            'auth.setup.fehler': 'API-Key sa nezda spravny. Spytaj sa sefa.',
            'auth.onboard.titel': 'Prihlasit',
            'auth.onboard.intro': 'Zadaj 6miestny kod a PIN od kancelarie.',
            'auth.onboard.code': 'Prihlasovaci kod',
            'auth.onboard.code_hint': '6 znakov, velke pismena a cislice',
            'auth.onboard.pin': 'PIN',
            'auth.onboard.pin_hint': '4-8 cislic',
            'auth.onboard.geraet': 'Nazov zariadenia (volitelne)',
            'auth.onboard.geraet_hint': 'Napr. "Ivan mobil" - pomoze kancelarii',
            'auth.onboard.submit': 'Prihlasit',
            'auth.onboard.pruefe': 'Kontroluje sa ...',
            'auth.error.not_found': 'Tento kod nie je znamy. Spytaj sa kancelarie.',
            'auth.error.wrong_pin': 'PIN nesedi. Skus znova.',
            'auth.error.already_used': 'Tento kod uz bol pouzity.',
            'auth.error.expired': 'Tento kod vyprsal. Poziadaj o novy.',
            'auth.error.revoked': 'Tento kod bol zruseny.',
            'auth.error.network': 'Nie je spojenie s kancelariou. Skontroluj internet.',
            'auth.error.generic': 'Nieco sa pokazilo. Skus znova.',
            'auth.warte.titel': 'Cakanie na schvalenie',
            'auth.warte.intro': 'Kancelaria musi schvalit tvoje zariadenie. Zvycajne je to rychle.',
            'auth.warte.hinweis': 'Nechaj aplikaciu otvorenu - akonahle je schvalene, pokracuje automaticky.',
            'auth.warte.name': 'Prihlaseny ako:',
            'auth.pinset.titel': 'Nastavit PIN',
            'auth.pinset.intro': 'Nastav si osobny PIN. Budes ho potrebovat pri dalsom spusteni.',
            'auth.pinset.pin': 'Novy PIN (4-8 cislic)',
            'auth.pinset.speichern': 'Ulozit PIN',
            'auth.pinset.mismatch': 'PINy sa nezhoduju.',
            'auth.login.titel': 'Vitaj spat',
            'auth.login.intro': 'Zadaj PIN.',
            'auth.login.pin': 'Tvoj PIN',
            'auth.login.oeffnen': 'Otvorit',
            'auth.login.fehler': 'Zly PIN. Zostava {n} pokusov.',
            'auth.login.gewipt': 'Prilis vela pokusov - aplikacia sa resetuje.',
            'auth.gesperrt.titel': 'Zariadenie zablokovane',
            'auth.gesperrt.intro': 'Kancelaria docasne zablokovala toto zariadenie.',
            'auth.gesperrt.hinweis': 'Ak je to chyba, zavolaj kancelarii.',
            'auth.gewipt.titel': 'Pristup odobrany',
            'auth.gewipt.intro': 'Toto zariadenie uz nema pristup. Mozes sa znova prihlasit s novym kodom.',
            'auth.gewipt.neustart': 'Znova nastavit'
        },
        pl: {
            'auth.setup.titel': 'Pierwsza konfiguracja',
            'auth.setup.intro': 'Aplikacja musi byc raz polaczona z biurem. Wpisz API-Key od szefa.',
            'auth.setup.apikey': 'Firebase API-Key',
            'auth.setup.apikey_hint': 'Zaczyna sie od "AIza..."',
            'auth.setup.speichern': 'Zapisz polaczenie',
            'auth.setup.fehler': 'API-Key wyglada zle. Zapytaj szefa.',
            'auth.onboard.titel': 'Zaloguj',
            'auth.onboard.intro': 'Wpisz 6znakowy kod i PIN od biura.',
            'auth.onboard.code': 'Kod logowania',
            'auth.onboard.code_hint': '6 znakow, duze litery i cyfry',
            'auth.onboard.pin': 'PIN',
            'auth.onboard.pin_hint': '4-8 cyfr',
            'auth.onboard.geraet': 'Nazwa urzadzenia (opcjonalne)',
            'auth.onboard.geraet_hint': 'Np. "Ivan telefon" - pomoze biuru',
            'auth.onboard.submit': 'Zaloguj',
            'auth.onboard.pruefe': 'Sprawdzanie ...',
            'auth.error.not_found': 'Ten kod jest nieznany. Zapytaj biuro.',
            'auth.error.wrong_pin': 'PIN nieprawidlowy. Sprobuj ponownie.',
            'auth.error.already_used': 'Ten kod zostal juz uzyty.',
            'auth.error.expired': 'Ten kod wygasl. Popros o nowy.',
            'auth.error.revoked': 'Ten kod zostal uniewazniony.',
            'auth.error.network': 'Brak polaczenia z biurem. Sprawdz internet.',
            'auth.error.generic': 'Cos poszlo nie tak. Sprobuj ponownie.',
            'auth.warte.titel': 'Czekanie na zatwierdzenie',
            'auth.warte.intro': 'Biuro musi jeszcze zatwierdzic urzadzenie. To zwykle szybko.',
            'auth.warte.hinweis': 'Zostaw aplikacje otwarta - po zatwierdzeniu przejdzie dalej.',
            'auth.warte.name': 'Zalogowany jako:',
            'auth.pinset.titel': 'Ustaw PIN',
            'auth.pinset.intro': 'Ustaw swoj osobisty PIN. Bedzie potrzebny przy nastepnym starcie.',
            'auth.pinset.pin': 'Nowy PIN (4-8 cyfr)',
            'auth.pinset.speichern': 'Zapisz PIN',
            'auth.pinset.mismatch': 'PINy sie nie zgadzaja.',
            'auth.login.titel': 'Witaj ponownie',
            'auth.login.intro': 'Wpisz PIN.',
            'auth.login.pin': 'Twoj PIN',
            'auth.login.oeffnen': 'Otworz',
            'auth.login.fehler': 'Zly PIN. Pozostalo {n} prob.',
            'auth.login.gewipt': 'Za duzo prob - aplikacja zostanie zresetowana.',
            'auth.gesperrt.titel': 'Urzadzenie zablokowane',
            'auth.gesperrt.intro': 'Biuro tymczasowo zablokowalo to urzadzenie.',
            'auth.gesperrt.hinweis': 'Zadzwon do biura, jesli to pomylka.',
            'auth.gewipt.titel': 'Dostep odebrany',
            'auth.gewipt.intro': 'To urzadzenie nie ma juz dostepu. Mozesz sie ponownie zalogowac z nowym kodem.',
            'auth.gewipt.neustart': 'Ustaw ponownie'
        },
        en: {
            'auth.setup.titel': 'First-time setup',
            'auth.setup.intro': 'This app needs to be connected to the office once. Please enter the API key from your boss.',
            'auth.setup.apikey': 'Firebase API key',
            'auth.setup.apikey_hint': 'Starts with "AIza..."',
            'auth.setup.speichern': 'Save connection',
            'auth.setup.fehler': 'API key does not seem right. Please ask your boss.',
            'auth.onboard.titel': 'Sign in',
            'auth.onboard.intro': 'Enter the 6-character code and PIN from the office.',
            'auth.onboard.code': 'Sign-in code',
            'auth.onboard.code_hint': '6 characters, uppercase letters and digits',
            'auth.onboard.pin': 'PIN',
            'auth.onboard.pin_hint': '4-8 digits',
            'auth.onboard.geraet': 'Device name (optional)',
            'auth.onboard.geraet_hint': 'e.g. "Ivan phone" - helps the office',
            'auth.onboard.submit': 'Sign in',
            'auth.onboard.pruefe': 'Checking ...',
            'auth.error.not_found': 'This code is unknown. Please ask the office.',
            'auth.error.wrong_pin': 'PIN is not correct. Please try again.',
            'auth.error.already_used': 'This code has already been used.',
            'auth.error.expired': 'This code has expired. Please request a new one.',
            'auth.error.revoked': 'This code has been revoked.',
            'auth.error.network': 'No connection to office. Please check internet.',
            'auth.error.generic': 'Something went wrong. Please try again.',
            'auth.warte.titel': 'Waiting for approval',
            'auth.warte.intro': 'The office still needs to approve your device. This is usually fast.',
            'auth.warte.hinweis': 'You can leave the app open - it will continue once approved.',
            'auth.warte.name': 'Signed in as:',
            'auth.pinset.titel': 'Set PIN',
            'auth.pinset.intro': 'Set your personal PIN. You will need it at next start.',
            'auth.pinset.pin': 'New PIN (4-8 digits)',
            'auth.pinset.speichern': 'Save PIN',
            'auth.pinset.mismatch': 'The PINs do not match.',
            'auth.login.titel': 'Welcome back',
            'auth.login.intro': 'Please enter PIN.',
            'auth.login.pin': 'Your PIN',
            'auth.login.oeffnen': 'Open',
            'auth.login.fehler': 'Wrong PIN. {n} tries left.',
            'auth.login.gewipt': 'Too many attempts - app will be reset.',
            'auth.gesperrt.titel': 'Device locked',
            'auth.gesperrt.intro': 'The office has temporarily locked this device.',
            'auth.gesperrt.hinweis': 'Please contact the office if this is a mistake.',
            'auth.gewipt.titel': 'Access removed',
            'auth.gewipt.intro': 'This device no longer has access. You can set up the app again with a new code.',
            'auth.gewipt.neustart': 'Set up again'
        },
        ro: {
            'auth.setup.titel': 'Prima configurare',
            'auth.setup.intro': 'Aplicatia trebuie conectata o data cu biroul. Introdu cheia API de la sef.',
            'auth.setup.apikey': 'Cheia API Firebase',
            'auth.setup.apikey_hint': 'Incepe cu "AIza..."',
            'auth.setup.speichern': 'Salveaza conexiunea',
            'auth.setup.fehler': 'Cheia API pare gresita. Intreaba seful.',
            'auth.onboard.titel': 'Conectare',
            'auth.onboard.intro': 'Introdu codul din 6 caractere si PIN-ul de la birou.',
            'auth.onboard.code': 'Cod de conectare',
            'auth.onboard.code_hint': '6 caractere, litere mari si cifre',
            'auth.onboard.pin': 'PIN',
            'auth.onboard.pin_hint': '4-8 cifre',
            'auth.onboard.geraet': 'Nume dispozitiv (optional)',
            'auth.onboard.geraet_hint': 'Ex. "Ivan telefon" - ajuta biroul',
            'auth.onboard.submit': 'Conecteaza',
            'auth.onboard.pruefe': 'Se verifica ...',
            'auth.error.not_found': 'Acest cod nu este cunoscut. Intreaba biroul.',
            'auth.error.wrong_pin': 'PIN gresit. Incearca din nou.',
            'auth.error.already_used': 'Acest cod a fost deja folosit.',
            'auth.error.expired': 'Acest cod a expirat. Cere unul nou.',
            'auth.error.revoked': 'Acest cod a fost anulat.',
            'auth.error.network': 'Nicio conexiune cu biroul. Verifica internetul.',
            'auth.error.generic': 'Ceva nu a mers. Incearca din nou.',
            'auth.warte.titel': 'Astept aprobarea',
            'auth.warte.intro': 'Biroul trebuie sa aprobe dispozitivul. De obicei este rapid.',
            'auth.warte.hinweis': 'Lasa aplicatia deschisa - va continua automat cand este aprobat.',
            'auth.warte.name': 'Conectat ca:',
            'auth.pinset.titel': 'Seteaza PIN',
            'auth.pinset.intro': 'Seteaza PIN-ul personal. Va fi necesar la urmatoarea pornire.',
            'auth.pinset.pin': 'PIN nou (4-8 cifre)',
            'auth.pinset.speichern': 'Salveaza PIN',
            'auth.pinset.mismatch': 'PIN-urile nu se potrivesc.',
            'auth.login.titel': 'Bun venit inapoi',
            'auth.login.intro': 'Introdu PIN-ul.',
            'auth.login.pin': 'PIN-ul tau',
            'auth.login.oeffnen': 'Deschide',
            'auth.login.fehler': 'PIN gresit. {n} incercari ramase.',
            'auth.login.gewipt': 'Prea multe incercari - aplicatia va fi resetata.',
            'auth.gesperrt.titel': 'Dispozitiv blocat',
            'auth.gesperrt.intro': 'Biroul a blocat temporar dispozitivul.',
            'auth.gesperrt.hinweis': 'Contacteaza biroul daca este o greseala.',
            'auth.gewipt.titel': 'Acces retras',
            'auth.gewipt.intro': 'Dispozitivul nu mai are acces. Poti configura aplicatia din nou cu un cod nou.',
            'auth.gewipt.neustart': 'Configureaza din nou'
        },
        uk: {
            'auth.setup.titel': 'Pershe nalashtuvannia',
            'auth.setup.intro': 'Dodatok treba raz ziednaty z ofisom. Vvedy API-klyuch vid shefa.',
            'auth.setup.apikey': 'Firebase API-klyuch',
            'auth.setup.apikey_hint': 'Pochynayetsia z "AIza..."',
            'auth.setup.speichern': 'Zberehty ziednannia',
            'auth.setup.fehler': 'API-klyuch vyhlyadaye nepravylno. Spytay shefa.',
            'auth.onboard.titel': 'Uviyty',
            'auth.onboard.intro': 'Vvedy 6znakovyy kod i PIN vid ofisu.',
            'auth.onboard.code': 'Kod vkhodu',
            'auth.onboard.code_hint': '6 znakiv, velyki litery i tsyfry',
            'auth.onboard.pin': 'PIN',
            'auth.onboard.pin_hint': '4-8 tsyfr',
            'auth.onboard.geraet': 'Nazva prystroyu (neobovyazkovo)',
            'auth.onboard.geraet_hint': 'Napr. "Ivan telefon" - dopomozhe ofisu',
            'auth.onboard.submit': 'Uviyty',
            'auth.onboard.pruefe': 'Pereviryayetsia ...',
            'auth.error.not_found': 'Tsey kod nevidomyy. Spytay ofis.',
            'auth.error.wrong_pin': 'PIN nepravylnyy. Sprobuy znovu.',
            'auth.error.already_used': 'Tsey kod vzhe vykorystano.',
            'auth.error.expired': 'Tsey kod zakinchyvsia. Poprosy novyy.',
            'auth.error.revoked': 'Tsey kod skasovano.',
            'auth.error.network': 'Nemaye zviazku z ofisom. Pereviry internet.',
            'auth.error.generic': 'Shchos pishlo ne tak. Sprobuy znovu.',
            'auth.warte.titel': 'Chekannia na skhvalennia',
            'auth.warte.intro': 'Ofis musyt skhvalyty prystriy. Tse zazvychay shvydko.',
            'auth.warte.hinweis': 'Zalysh dodatok vidkrytym - pislya skhvalennia prodovzhyt avtomatychno.',
            'auth.warte.name': 'Uviyshov yak:',
            'auth.pinset.titel': 'Vstanovyty PIN',
            'auth.pinset.intro': 'Vstanovy osobystyy PIN. Vin potriben pry nastupnomu zapusku.',
            'auth.pinset.pin': 'Novyy PIN (4-8 tsyfr)',
            'auth.pinset.speichern': 'Zberehty PIN',
            'auth.pinset.mismatch': 'PIN-y ne zbihayutsia.',
            'auth.login.titel': 'Laskavo prosymo znovu',
            'auth.login.intro': 'Vvedy PIN.',
            'auth.login.pin': 'Tviy PIN',
            'auth.login.oeffnen': 'Vidkryty',
            'auth.login.fehler': 'Nevirnyy PIN. Zalyshylos {n} sprob.',
            'auth.login.gewipt': 'Zabahato sprob - dodatok bude skynuto.',
            'auth.gesperrt.titel': 'Prystriy zablokovano',
            'auth.gesperrt.intro': 'Ofis tymchasovo zablokuvav tsey prystriy.',
            'auth.gesperrt.hinweis': 'Zvertaysia do ofisu, yakshcho tse pomylka.',
            'auth.gewipt.titel': 'Dostup vidibrano',
            'auth.gewipt.intro': 'Tsey prystriy bilshe ne maye dostupu. Mozhesh nalashtuvaty dodatok znovu z novym kodom.',
            'auth.gewipt.neustart': 'Nalashtuvaty znovu'
        }
    };

    // Merge AUTH-Labels in UI_LABELS pro Sprache
    Object.keys(AUTH_LABELS).forEach(function (lang) {
        if (!UI_LABELS[lang]) UI_LABELS[lang] = {};
        Object.keys(AUTH_LABELS[lang]).forEach(function (k) {
            UI_LABELS[lang][k] = AUTH_LABELS[lang][k];
        });
    });

    // ============================================================
    // ORDNER_LABELS: 2-Ordner-Modell Etappe 4a
    // Startseiten-Kacheln + Baustellen-Container + Nachrichten-Container
    // ============================================================

    const ORDNER_LABELS = {
        de: {
            'home.ordner.baustellen.titel': 'Baustellen',
            'home.ordner.baustellen.text': 'Zeichnungen, Anweisungen, Fotos, Stunden',
            'home.ordner.nachrichten.titel': 'Nachrichten',
            'home.ordner.nachrichten.text': 'Kalender und Chat mit dem Buero',
            'baustellen.titel': 'Baustellen',
            'baustellen.keine': 'Es sind noch keine Baustellen freigegeben.',
            'baustellen.warte': 'Lade Baustellen ...',
            'baustellen.zurueck': 'Zurueck',
            'nachrichten.titel': 'Nachrichten',
            'nachrichten.zurueck': 'Zurueck',
            'nachrichten.kalender.titel': 'Kalender',
            'nachrichten.kalender.text': 'Deine Schichten, Urlaub, Krank',
            'nachrichten.chat.titel': 'Chat mit Buero',
            'nachrichten.chat.text': 'Anweisungen und Nachrichten',
            'common.demnaechst': 'Kommt in einer spaeteren Etappe',
            'common.zurueck': 'Zurueck'
        },
        cs: {
            'home.ordner.baustellen.titel': 'Stavby',
            'home.ordner.baustellen.text': 'Vykresy, instrukce, fotky, hodiny',
            'home.ordner.nachrichten.titel': 'Zpravy',
            'home.ordner.nachrichten.text': 'Kalendar a chat s kancelari',
            'baustellen.titel': 'Stavby',
            'baustellen.keine': 'Zatim nejsou povoleny zadne stavby.',
            'baustellen.warte': 'Nacitam stavby ...',
            'baustellen.zurueck': 'Zpet',
            'nachrichten.titel': 'Zpravy',
            'nachrichten.zurueck': 'Zpet',
            'nachrichten.kalender.titel': 'Kalendar',
            'nachrichten.kalender.text': 'Smeny, dovolena, nemoc',
            'nachrichten.chat.titel': 'Chat s kancelari',
            'nachrichten.chat.text': 'Instrukce a zpravy',
            'common.demnaechst': 'Prijde v pozdejsi etape',
            'common.zurueck': 'Zpet'
        },
        sk: {
            'home.ordner.baustellen.titel': 'Stavby',
            'home.ordner.baustellen.text': 'Vykresy, instrukcie, fotky, hodiny',
            'home.ordner.nachrichten.titel': 'Spravy',
            'home.ordner.nachrichten.text': 'Kalendar a chat s kancelariou',
            'baustellen.titel': 'Stavby',
            'baustellen.keine': 'Zatial nie su povolene ziadne stavby.',
            'baustellen.warte': 'Nacitavam stavby ...',
            'baustellen.zurueck': 'Spat',
            'nachrichten.titel': 'Spravy',
            'nachrichten.zurueck': 'Spat',
            'nachrichten.kalender.titel': 'Kalendar',
            'nachrichten.kalender.text': 'Zmeny, dovolenka, choroba',
            'nachrichten.chat.titel': 'Chat s kancelariou',
            'nachrichten.chat.text': 'Instrukcie a spravy',
            'common.demnaechst': 'Pride v neskoršej etape',
            'common.zurueck': 'Spat'
        },
        pl: {
            'home.ordner.baustellen.titel': 'Budowy',
            'home.ordner.baustellen.text': 'Rysunki, instrukcje, zdjecia, godziny',
            'home.ordner.nachrichten.titel': 'Wiadomosci',
            'home.ordner.nachrichten.text': 'Kalendarz i czat z biurem',
            'baustellen.titel': 'Budowy',
            'baustellen.keine': 'Nie ma jeszcze udostepnionych budow.',
            'baustellen.warte': 'Laduje budowy ...',
            'baustellen.zurueck': 'Wstecz',
            'nachrichten.titel': 'Wiadomosci',
            'nachrichten.zurueck': 'Wstecz',
            'nachrichten.kalender.titel': 'Kalendarz',
            'nachrichten.kalender.text': 'Zmiany, urlop, choroba',
            'nachrichten.chat.titel': 'Czat z biurem',
            'nachrichten.chat.text': 'Instrukcje i wiadomosci',
            'common.demnaechst': 'Nadejdzie w pozniejszym etapie',
            'common.zurueck': 'Wstecz'
        },
        en: {
            'home.ordner.baustellen.titel': 'Sites',
            'home.ordner.baustellen.text': 'Drawings, instructions, photos, hours',
            'home.ordner.nachrichten.titel': 'Messages',
            'home.ordner.nachrichten.text': 'Calendar and chat with the office',
            'baustellen.titel': 'Sites',
            'baustellen.keine': 'No sites have been shared yet.',
            'baustellen.warte': 'Loading sites ...',
            'baustellen.zurueck': 'Back',
            'nachrichten.titel': 'Messages',
            'nachrichten.zurueck': 'Back',
            'nachrichten.kalender.titel': 'Calendar',
            'nachrichten.kalender.text': 'Your shifts, vacation, sick days',
            'nachrichten.chat.titel': 'Chat with office',
            'nachrichten.chat.text': 'Instructions and messages',
            'common.demnaechst': 'Coming in a later stage',
            'common.zurueck': 'Back'
        },
        ro: {
            'home.ordner.baustellen.titel': 'Santiere',
            'home.ordner.baustellen.text': 'Desene, instructiuni, poze, ore',
            'home.ordner.nachrichten.titel': 'Mesaje',
            'home.ordner.nachrichten.text': 'Calendar si chat cu biroul',
            'baustellen.titel': 'Santiere',
            'baustellen.keine': 'Nu exista inca santiere partajate.',
            'baustellen.warte': 'Incarc santierele ...',
            'baustellen.zurueck': 'Inapoi',
            'nachrichten.titel': 'Mesaje',
            'nachrichten.zurueck': 'Inapoi',
            'nachrichten.kalender.titel': 'Calendar',
            'nachrichten.kalender.text': 'Ture, concediu, boala',
            'nachrichten.chat.titel': 'Chat cu biroul',
            'nachrichten.chat.text': 'Instructiuni si mesaje',
            'common.demnaechst': 'Va veni intr-o etapa ulterioara',
            'common.zurueck': 'Inapoi'
        },
        uk: {
            'home.ordner.baustellen.titel': 'Obyekty',
            'home.ordner.baustellen.text': 'Kreslennia, instruktsiyi, foto, hodyny',
            'home.ordner.nachrichten.titel': 'Povidomlennia',
            'home.ordner.nachrichten.text': 'Kalendar i chat z ofisom',
            'baustellen.titel': 'Obyekty',
            'baustellen.keine': 'Poky nemaye dostupnykh obyektiv.',
            'baustellen.warte': 'Zavantazhuyu obyekty ...',
            'baustellen.zurueck': 'Nazad',
            'nachrichten.titel': 'Povidomlennia',
            'nachrichten.zurueck': 'Nazad',
            'nachrichten.kalender.titel': 'Kalendar',
            'nachrichten.kalender.text': 'Zminy, vidpustka, khvoroba',
            'nachrichten.chat.titel': 'Chat z ofisom',
            'nachrichten.chat.text': 'Instruktsiyi ta povidomlennia',
            'common.demnaechst': 'Bude u piznishii etapi',
            'common.zurueck': 'Nazad'
        }
    };

    // Merge ORDNER-Labels in UI_LABELS pro Sprache
    Object.keys(ORDNER_LABELS).forEach(function (lang) {
        if (!UI_LABELS[lang]) UI_LABELS[lang] = {};
        Object.keys(ORDNER_LABELS[lang]).forEach(function (k) {
            UI_LABELS[lang][k] = ORDNER_LABELS[lang][k];
        });
    });

    // ============================================================
    // BROWSER_LABELS: Drive-Browser, Baustellendaten, Sub-Kacheln
    // Etappe 4b
    // ============================================================

    const BROWSER_LABELS = {
        de: {
            // 5 Sub-Kacheln (Labels zentral statt hardgecodet)
            'subkachel.zeichnungen': 'Zeichnungen',
            'subkachel.anweisungen': 'Anweisungen',
            'subkachel.baustellendaten': 'Baustellendaten',
            'subkachel.fotos': 'Fotos',
            'subkachel.stunden': 'Stunden',
            // Browser
            'browser.laden': 'Lade Dateien ...',
            'browser.leer': 'Dieser Ordner ist leer.',
            'browser.fehler': 'Dateien konnten nicht geladen werden.',
            'browser.nichtKonfig': 'Diese Baustelle ist noch nicht vollstaendig eingerichtet. Das Buero muss den Staging-Ordner verknuepfen.',
            'browser.keinApiKey': 'Der Drive-Zugriff ist noch nicht konfiguriert. Der API-Key fehlt in der Config.',
            'browser.unterordnerFehlt': 'Der Unterordner "{name}" existiert noch nicht. Das Buero hat hier noch keine Dateien hinterlegt.',
            'browser.aktualisieren': 'Aktualisieren',
            'browser.zurueck': 'Zurueck',
            'browser.dateien': '{n} Datei(en)',
            'browser.ordner': 'Ordner',
            'browser.datei': 'Datei',
            'browser.imBrowserOeffnen': 'Im Browser oeffnen',
            'browser.herunterladen': 'Herunterladen',
            'browser.schliessen': 'Schliessen',
            'browser.nichtAnzeigbar': 'Dieser Dateityp kann nicht direkt angezeigt werden.',
            // Stubs fuer Fotos / Stunden
            'stub.fotos.titel': 'Fotos-Modul kommt in Etappe 6',
            'stub.fotos.text': 'Hier wirst du bald Baustellen-Fotos aufnehmen und nach Phase/Raum/Wand dokumentieren koennen.',
            'stub.stunden.titel': 'Stunden-Modul kommt in Etappe 7',
            'stub.stunden.text': 'Hier kannst du bald deinen Stundenzettel ausfuellen und als PDF hochladen.',
            // Baustellendaten-Ansicht
            'bdaten.titel': 'Baustellendaten',
            'bdaten.leer': 'Fuer diese Baustelle sind noch keine Daten hinterlegt. Das Buero pflegt diese in der Master-App.',
            'bdaten.gruppe.objekt': 'Objekt',
            'bdaten.gruppe.bauherr': 'Bauherr',
            'bdaten.gruppe.beteiligte': 'Beteiligte',
            'bdaten.gruppe.zugang': 'Zugang vor Ort',
            'bdaten.gruppe.technik': 'Technik auf der Baustelle',
            'bdaten.gruppe.zeitraum': 'Zeitraum',
            'bdaten.gruppe.besonderheiten': 'Besonderheiten',
            'bdaten.name': 'Name',
            'bdaten.adresse': 'Adresse',
            'bdaten.bauherr': 'Bauherr',
            'bdaten.bauherr_tel': 'Telefon Bauherr',
            'bdaten.bauherr_mail': 'E-Mail Bauherr',
            'bdaten.architekt': 'Architekt',
            'bdaten.architekt_tel': 'Telefon Architekt',
            'bdaten.bauleitung': 'Bauleitung',
            'bdaten.bauleitung_tel': 'Telefon Bauleitung',
            'bdaten.ansprechpartner': 'Ansprechpartner',
            'bdaten.ansprechpartner_tel': 'Telefon Ansprechpartner',
            'bdaten.hausmeister': 'Hausmeister',
            'bdaten.hausmeister_tel': 'Telefon Hausmeister',
            'bdaten.zugangsinfo': 'Zugangs-Info',
            'bdaten.strom': 'Strom verfuegbar',
            'bdaten.wasser': 'Wasser verfuegbar',
            'bdaten.start': 'Startdatum',
            'bdaten.ende': 'Endtermin',
            'bdaten.besonderheiten': 'Besonderheiten',
            'bdaten.ja': 'Ja',
            'bdaten.nein': 'Nein',
            'bdaten.anrufen': 'Anrufen',
            'bdaten.mailen': 'E-Mail schreiben'
        },
        cs: {
            'subkachel.zeichnungen': 'Vykresy',
            'subkachel.anweisungen': 'Instrukce',
            'subkachel.baustellendaten': 'Data stavby',
            'subkachel.fotos': 'Fotky',
            'subkachel.stunden': 'Hodiny',
            'browser.laden': 'Nacitam soubory ...',
            'browser.leer': 'Tato slozka je prazdna.',
            'browser.fehler': 'Soubory nelze nacist.',
            'browser.nichtKonfig': 'Tato stavba zatim neni plne nastavena. Kancelar musi propojit Staging-slozku.',
            'browser.keinApiKey': 'Pristup k Drive zatim neni nastaven. V konfiguraci chybi API-klic.',
            'browser.unterordnerFehlt': 'Podslozka "{name}" zatim neexistuje. Kancelar sem jeste neulozila soubory.',
            'browser.aktualisieren': 'Obnovit',
            'browser.zurueck': 'Zpet',
            'browser.dateien': '{n} soubor(u)',
            'browser.ordner': 'Slozka',
            'browser.datei': 'Soubor',
            'browser.imBrowserOeffnen': 'Otevrit v prohlizeci',
            'browser.herunterladen': 'Stahnout',
            'browser.schliessen': 'Zavrit',
            'browser.nichtAnzeigbar': 'Tento typ souboru nelze zobrazit primo.',
            'stub.fotos.titel': 'Fotky prijdou v etape 6',
            'stub.fotos.text': 'Zde budes brzy porizovat fotky stavby podle faze, mistnosti a steny.',
            'stub.stunden.titel': 'Hodiny prijdou v etape 7',
            'stub.stunden.text': 'Zde budes brzy vyplnovat pracovni vykaz a nahravat PDF.',
            'bdaten.titel': 'Data stavby',
            'bdaten.leer': 'Pro tuto stavbu zatim nejsou ulozena zadna data. Kancelar je spravuje v Master-App.',
            'bdaten.gruppe.objekt': 'Objekt',
            'bdaten.gruppe.bauherr': 'Investor',
            'bdaten.gruppe.beteiligte': 'Zucastneni',
            'bdaten.gruppe.zugang': 'Pristup na misto',
            'bdaten.gruppe.technik': 'Technika na stavbe',
            'bdaten.gruppe.zeitraum': 'Obdobi',
            'bdaten.gruppe.besonderheiten': 'Zvlastnosti',
            'bdaten.name': 'Nazev',
            'bdaten.adresse': 'Adresa',
            'bdaten.bauherr': 'Investor',
            'bdaten.bauherr_tel': 'Telefon investor',
            'bdaten.bauherr_mail': 'E-mail investor',
            'bdaten.architekt': 'Architekt',
            'bdaten.architekt_tel': 'Telefon architekt',
            'bdaten.bauleitung': 'Vedeni stavby',
            'bdaten.bauleitung_tel': 'Telefon vedeni',
            'bdaten.ansprechpartner': 'Kontaktni osoba',
            'bdaten.ansprechpartner_tel': 'Telefon kontakt',
            'bdaten.hausmeister': 'Spravce',
            'bdaten.hausmeister_tel': 'Telefon spravce',
            'bdaten.zugangsinfo': 'Pristupove info',
            'bdaten.strom': 'Elektrina k dispozici',
            'bdaten.wasser': 'Voda k dispozici',
            'bdaten.start': 'Zacatek',
            'bdaten.ende': 'Konec',
            'bdaten.besonderheiten': 'Zvlastnosti',
            'bdaten.ja': 'Ano',
            'bdaten.nein': 'Ne',
            'bdaten.anrufen': 'Zavolat',
            'bdaten.mailen': 'Napsat e-mail'
        },
        sk: {
            'subkachel.zeichnungen': 'Vykresy',
            'subkachel.anweisungen': 'Instrukcie',
            'subkachel.baustellendaten': 'Data stavby',
            'subkachel.fotos': 'Fotky',
            'subkachel.stunden': 'Hodiny',
            'browser.laden': 'Nacitavam subory ...',
            'browser.leer': 'Tento priecinok je prazdny.',
            'browser.fehler': 'Subory sa nepodarilo nacitat.',
            'browser.nichtKonfig': 'Tato stavba nie je este plne nastavena. Kancelaria musi prepojit Staging-priecinok.',
            'browser.keinApiKey': 'Pristup k Drive nie je nastaveny. V konfiguracii chyba API-kluc.',
            'browser.unterordnerFehlt': 'Podpriecinok "{name}" este neexistuje. Kancelaria sem este neulozila subory.',
            'browser.aktualisieren': 'Obnovit',
            'browser.zurueck': 'Spat',
            'browser.dateien': '{n} sub(orov)',
            'browser.ordner': 'Priecinok',
            'browser.datei': 'Subor',
            'browser.imBrowserOeffnen': 'Otvorit v prehliadaci',
            'browser.herunterladen': 'Stiahnut',
            'browser.schliessen': 'Zavriet',
            'browser.nichtAnzeigbar': 'Tento typ suboru nemozno zobrazit priamo.',
            'stub.fotos.titel': 'Fotky pridu v etape 6',
            'stub.fotos.text': 'Tu budes coskoro fotit stavbu podla fazy, miestnosti a steny.',
            'stub.stunden.titel': 'Hodiny pridu v etape 7',
            'stub.stunden.text': 'Tu budes coskoro vyplnat pracovny vykaz a nahravat PDF.',
            'bdaten.titel': 'Data stavby',
            'bdaten.leer': 'Pre tuto stavbu zatial nie su ulozene ziadne data. Kancelaria ich spravuje v Master-App.',
            'bdaten.gruppe.objekt': 'Objekt',
            'bdaten.gruppe.bauherr': 'Investor',
            'bdaten.gruppe.beteiligte': 'Ucastnici',
            'bdaten.gruppe.zugang': 'Pristup na miesto',
            'bdaten.gruppe.technik': 'Technika na stavbe',
            'bdaten.gruppe.zeitraum': 'Obdobie',
            'bdaten.gruppe.besonderheiten': 'Osobitosti',
            'bdaten.name': 'Nazov',
            'bdaten.adresse': 'Adresa',
            'bdaten.bauherr': 'Investor',
            'bdaten.bauherr_tel': 'Telefon investor',
            'bdaten.bauherr_mail': 'E-mail investor',
            'bdaten.architekt': 'Architekt',
            'bdaten.architekt_tel': 'Telefon architekt',
            'bdaten.bauleitung': 'Vedenie stavby',
            'bdaten.bauleitung_tel': 'Telefon vedenie',
            'bdaten.ansprechpartner': 'Kontaktna osoba',
            'bdaten.ansprechpartner_tel': 'Telefon kontakt',
            'bdaten.hausmeister': 'Spravca',
            'bdaten.hausmeister_tel': 'Telefon spravca',
            'bdaten.zugangsinfo': 'Info o pristupe',
            'bdaten.strom': 'Elektrina dostupna',
            'bdaten.wasser': 'Voda dostupna',
            'bdaten.start': 'Zaciatok',
            'bdaten.ende': 'Koniec',
            'bdaten.besonderheiten': 'Osobitosti',
            'bdaten.ja': 'Ano',
            'bdaten.nein': 'Nie',
            'bdaten.anrufen': 'Zavolat',
            'bdaten.mailen': 'Napisat e-mail'
        },
        pl: {
            'subkachel.zeichnungen': 'Rysunki',
            'subkachel.anweisungen': 'Instrukcje',
            'subkachel.baustellendaten': 'Dane budowy',
            'subkachel.fotos': 'Zdjecia',
            'subkachel.stunden': 'Godziny',
            'browser.laden': 'Laduje pliki ...',
            'browser.leer': 'Ten folder jest pusty.',
            'browser.fehler': 'Nie udalo sie zaladowac plikow.',
            'browser.nichtKonfig': 'Ta budowa nie jest jeszcze w pelni skonfigurowana. Biuro musi powiazac folder Staging.',
            'browser.keinApiKey': 'Dostep do Drive nie jest skonfigurowany. Brakuje klucza API w konfiguracji.',
            'browser.unterordnerFehlt': 'Podfolder "{name}" jeszcze nie istnieje. Biuro nie zapisalo tu jeszcze plikow.',
            'browser.aktualisieren': 'Odswiez',
            'browser.zurueck': 'Wstecz',
            'browser.dateien': '{n} plik(ow)',
            'browser.ordner': 'Folder',
            'browser.datei': 'Plik',
            'browser.imBrowserOeffnen': 'Otworz w przegladarce',
            'browser.herunterladen': 'Pobierz',
            'browser.schliessen': 'Zamknij',
            'browser.nichtAnzeigbar': 'Ten typ pliku nie moze byc wyswietlony bezposrednio.',
            'stub.fotos.titel': 'Zdjecia przyjda w etapie 6',
            'stub.fotos.text': 'Tutaj bedziesz wkrotce robil zdjecia budowy wedlug fazy, pomieszczenia i sciany.',
            'stub.stunden.titel': 'Godziny przyjda w etapie 7',
            'stub.stunden.text': 'Tutaj bedziesz wkrotce wypelnial karte godzin i wysylal PDF.',
            'bdaten.titel': 'Dane budowy',
            'bdaten.leer': 'Dla tej budowy nie zapisano jeszcze zadnych danych. Biuro zarzadza nimi w Master-App.',
            'bdaten.gruppe.objekt': 'Obiekt',
            'bdaten.gruppe.bauherr': 'Inwestor',
            'bdaten.gruppe.beteiligte': 'Uczestnicy',
            'bdaten.gruppe.zugang': 'Dostep na miejscu',
            'bdaten.gruppe.technik': 'Technika na budowie',
            'bdaten.gruppe.zeitraum': 'Okres',
            'bdaten.gruppe.besonderheiten': 'Szczegoly',
            'bdaten.name': 'Nazwa',
            'bdaten.adresse': 'Adres',
            'bdaten.bauherr': 'Inwestor',
            'bdaten.bauherr_tel': 'Telefon inwestor',
            'bdaten.bauherr_mail': 'E-mail inwestor',
            'bdaten.architekt': 'Architekt',
            'bdaten.architekt_tel': 'Telefon architekt',
            'bdaten.bauleitung': 'Kierownictwo budowy',
            'bdaten.bauleitung_tel': 'Telefon kierownictwo',
            'bdaten.ansprechpartner': 'Osoba kontaktowa',
            'bdaten.ansprechpartner_tel': 'Telefon kontakt',
            'bdaten.hausmeister': 'Dozorca',
            'bdaten.hausmeister_tel': 'Telefon dozorca',
            'bdaten.zugangsinfo': 'Informacja o dostepie',
            'bdaten.strom': 'Prad dostepny',
            'bdaten.wasser': 'Woda dostepna',
            'bdaten.start': 'Poczatek',
            'bdaten.ende': 'Koniec',
            'bdaten.besonderheiten': 'Szczegoly',
            'bdaten.ja': 'Tak',
            'bdaten.nein': 'Nie',
            'bdaten.anrufen': 'Zadzwon',
            'bdaten.mailen': 'Napisz e-mail'
        },
        en: {
            'subkachel.zeichnungen': 'Drawings',
            'subkachel.anweisungen': 'Instructions',
            'subkachel.baustellendaten': 'Site Details',
            'subkachel.fotos': 'Photos',
            'subkachel.stunden': 'Hours',
            'browser.laden': 'Loading files ...',
            'browser.leer': 'This folder is empty.',
            'browser.fehler': 'Files could not be loaded.',
            'browser.nichtKonfig': 'This site has not been fully set up yet. The office must link the staging folder.',
            'browser.keinApiKey': 'Drive access is not configured yet. The API key is missing in the config.',
            'browser.unterordnerFehlt': 'The subfolder "{name}" does not exist yet. The office has not stored any files here.',
            'browser.aktualisieren': 'Refresh',
            'browser.zurueck': 'Back',
            'browser.dateien': '{n} file(s)',
            'browser.ordner': 'Folder',
            'browser.datei': 'File',
            'browser.imBrowserOeffnen': 'Open in browser',
            'browser.herunterladen': 'Download',
            'browser.schliessen': 'Close',
            'browser.nichtAnzeigbar': 'This file type cannot be displayed directly.',
            'stub.fotos.titel': 'Photo module coming in stage 6',
            'stub.fotos.text': 'Soon you will be able to take site photos and document them by phase, room and wall.',
            'stub.stunden.titel': 'Hours module coming in stage 7',
            'stub.stunden.text': 'Soon you will be able to fill out your timesheet and upload it as a PDF.',
            'bdaten.titel': 'Site Details',
            'bdaten.leer': 'No details are stored for this site yet. The office manages them in the Master App.',
            'bdaten.gruppe.objekt': 'Property',
            'bdaten.gruppe.bauherr': 'Client',
            'bdaten.gruppe.beteiligte': 'Stakeholders',
            'bdaten.gruppe.zugang': 'On-site access',
            'bdaten.gruppe.technik': 'On-site facilities',
            'bdaten.gruppe.zeitraum': 'Timeline',
            'bdaten.gruppe.besonderheiten': 'Notes',
            'bdaten.name': 'Name',
            'bdaten.adresse': 'Address',
            'bdaten.bauherr': 'Client',
            'bdaten.bauherr_tel': 'Client phone',
            'bdaten.bauherr_mail': 'Client email',
            'bdaten.architekt': 'Architect',
            'bdaten.architekt_tel': 'Architect phone',
            'bdaten.bauleitung': 'Site manager',
            'bdaten.bauleitung_tel': 'Site manager phone',
            'bdaten.ansprechpartner': 'Contact person',
            'bdaten.ansprechpartner_tel': 'Contact phone',
            'bdaten.hausmeister': 'Caretaker',
            'bdaten.hausmeister_tel': 'Caretaker phone',
            'bdaten.zugangsinfo': 'Access info',
            'bdaten.strom': 'Power available',
            'bdaten.wasser': 'Water available',
            'bdaten.start': 'Start date',
            'bdaten.ende': 'End date',
            'bdaten.besonderheiten': 'Notes',
            'bdaten.ja': 'Yes',
            'bdaten.nein': 'No',
            'bdaten.anrufen': 'Call',
            'bdaten.mailen': 'Send email'
        },
        ro: {
            'subkachel.zeichnungen': 'Desene',
            'subkachel.anweisungen': 'Instructiuni',
            'subkachel.baustellendaten': 'Date santier',
            'subkachel.fotos': 'Poze',
            'subkachel.stunden': 'Ore',
            'browser.laden': 'Incarc fisierele ...',
            'browser.leer': 'Acest folder este gol.',
            'browser.fehler': 'Fisierele nu au putut fi incarcate.',
            'browser.nichtKonfig': 'Acest santier nu este inca configurat complet. Biroul trebuie sa conecteze folderul Staging.',
            'browser.keinApiKey': 'Accesul la Drive nu este configurat. Lipseste cheia API in configuratie.',
            'browser.unterordnerFehlt': 'Subfolderul "{name}" nu exista inca. Biroul nu a depus inca fisiere aici.',
            'browser.aktualisieren': 'Reincarca',
            'browser.zurueck': 'Inapoi',
            'browser.dateien': '{n} fisier(e)',
            'browser.ordner': 'Folder',
            'browser.datei': 'Fisier',
            'browser.imBrowserOeffnen': 'Deschide in browser',
            'browser.herunterladen': 'Descarca',
            'browser.schliessen': 'Inchide',
            'browser.nichtAnzeigbar': 'Acest tip de fisier nu poate fi afisat direct.',
            'stub.fotos.titel': 'Modulul foto vine in etapa 6',
            'stub.fotos.text': 'Aici vei putea face in curand poze ale santierului pe faze, camere si pereti.',
            'stub.stunden.titel': 'Modulul ore vine in etapa 7',
            'stub.stunden.text': 'Aici vei putea completa fisa de pontaj si o vei incarca ca PDF.',
            'bdaten.titel': 'Date santier',
            'bdaten.leer': 'Pentru acest santier nu sunt inca salvate date. Biroul le gestioneaza in Master-App.',
            'bdaten.gruppe.objekt': 'Obiectiv',
            'bdaten.gruppe.bauherr': 'Beneficiar',
            'bdaten.gruppe.beteiligte': 'Participanti',
            'bdaten.gruppe.zugang': 'Acces pe santier',
            'bdaten.gruppe.technik': 'Utilitati pe santier',
            'bdaten.gruppe.zeitraum': 'Perioada',
            'bdaten.gruppe.besonderheiten': 'Observatii',
            'bdaten.name': 'Nume',
            'bdaten.adresse': 'Adresa',
            'bdaten.bauherr': 'Beneficiar',
            'bdaten.bauherr_tel': 'Telefon beneficiar',
            'bdaten.bauherr_mail': 'E-mail beneficiar',
            'bdaten.architekt': 'Arhitect',
            'bdaten.architekt_tel': 'Telefon arhitect',
            'bdaten.bauleitung': 'Sef santier',
            'bdaten.bauleitung_tel': 'Telefon sef santier',
            'bdaten.ansprechpartner': 'Persoana de contact',
            'bdaten.ansprechpartner_tel': 'Telefon contact',
            'bdaten.hausmeister': 'Administrator',
            'bdaten.hausmeister_tel': 'Telefon administrator',
            'bdaten.zugangsinfo': 'Info acces',
            'bdaten.strom': 'Curent disponibil',
            'bdaten.wasser': 'Apa disponibila',
            'bdaten.start': 'Data inceput',
            'bdaten.ende': 'Data sfarsit',
            'bdaten.besonderheiten': 'Observatii',
            'bdaten.ja': 'Da',
            'bdaten.nein': 'Nu',
            'bdaten.anrufen': 'Suna',
            'bdaten.mailen': 'Trimite e-mail'
        },
        uk: {
            'subkachel.zeichnungen': 'Kreslennia',
            'subkachel.anweisungen': 'Instruktsiyi',
            'subkachel.baustellendaten': 'Dani obyektu',
            'subkachel.fotos': 'Foto',
            'subkachel.stunden': 'Hodyny',
            'browser.laden': 'Zavantazhuyu fayly ...',
            'browser.leer': 'Tsia papka porozhnia.',
            'browser.fehler': 'Ne vdalosia zavantazhyty fayly.',
            'browser.nichtKonfig': 'Tsey obyekt shche ne povnistiu nalashtovanyi. Ofis maye zvyazaty papku Staging.',
            'browser.keinApiKey': 'Dostup do Drive shche ne nalashtovanyi. V konfihuratsiyi vidsutniy API-kliuch.',
            'browser.unterordnerFehlt': 'Pidpapka "{name}" shche ne isnuye. Ofis shche ne zberih tut fayly.',
            'browser.aktualisieren': 'Onovyty',
            'browser.zurueck': 'Nazad',
            'browser.dateien': '{n} faylu(iv)',
            'browser.ordner': 'Papka',
            'browser.datei': 'Fayl',
            'browser.imBrowserOeffnen': 'Vidkryty v brauzeri',
            'browser.herunterladen': 'Zavantazhyty',
            'browser.schliessen': 'Zakryty',
            'browser.nichtAnzeigbar': 'Tsey typ faylu nemozhlyvo pokazaty bezposeredno.',
            'stub.fotos.titel': 'Foto-modul bude u etapi 6',
            'stub.fotos.text': 'Tut ty skoro zmozhesh robyty foto obyektu po faze, kimnati i stini.',
            'stub.stunden.titel': 'Hodynnyi modul bude u etapi 7',
            'stub.stunden.text': 'Tut ty skoro zmozhesh zapovniuvaty tabel hodyn i zavantazhuvaty PDF.',
            'bdaten.titel': 'Dani obyektu',
            'bdaten.leer': 'Dlia tsoho obyektu shche ne zberezheno danykh. Ofis keruye nymy v Master-App.',
            'bdaten.gruppe.objekt': 'Obyekt',
            'bdaten.gruppe.bauherr': 'Zamovnyk',
            'bdaten.gruppe.beteiligte': 'Uchasnyky',
            'bdaten.gruppe.zugang': 'Dostup na mistsi',
            'bdaten.gruppe.technik': 'Komunikatsiyi',
            'bdaten.gruppe.zeitraum': 'Period',
            'bdaten.gruppe.besonderheiten': 'Osoblyvosti',
            'bdaten.name': 'Nazva',
            'bdaten.adresse': 'Adresa',
            'bdaten.bauherr': 'Zamovnyk',
            'bdaten.bauherr_tel': 'Telefon zamovnyka',
            'bdaten.bauherr_mail': 'E-mail zamovnyka',
            'bdaten.architekt': 'Arkhitektor',
            'bdaten.architekt_tel': 'Telefon arkhitektora',
            'bdaten.bauleitung': 'Kerivnyk budivnytstva',
            'bdaten.bauleitung_tel': 'Telefon kerivnyka',
            'bdaten.ansprechpartner': 'Kontaktna osoba',
            'bdaten.ansprechpartner_tel': 'Telefon kontaktu',
            'bdaten.hausmeister': 'Keruvatel',
            'bdaten.hausmeister_tel': 'Telefon keruvatelia',
            'bdaten.zugangsinfo': 'Info pro dostup',
            'bdaten.strom': 'Elektrika dostupna',
            'bdaten.wasser': 'Voda dostupna',
            'bdaten.start': 'Data pochatku',
            'bdaten.ende': 'Data zakinchennia',
            'bdaten.besonderheiten': 'Osoblyvosti',
            'bdaten.ja': 'Tak',
            'bdaten.nein': 'Ni',
            'bdaten.anrufen': 'Podzvonyty',
            'bdaten.mailen': 'Nadislaty e-mail'
        }
    };

    // Merge BROWSER-Labels in UI_LABELS pro Sprache
    Object.keys(BROWSER_LABELS).forEach(function (lang) {
        if (!UI_LABELS[lang]) UI_LABELS[lang] = {};
        Object.keys(BROWSER_LABELS[lang]).forEach(function (k) {
            UI_LABELS[lang][k] = BROWSER_LABELS[lang][k];
        });
    });

    // ============================================================
    // Helper: t(key, replacements) — Uebersetzungs-Funktion
    // replacements: Objekt wie {n: 5}, ersetzt {n} im Label
    // ============================================================

    function t(key, replacements) {
        const lang = global.TWMaConfig.getCurrentLanguage();
        const dict = UI_LABELS[lang] || UI_LABELS[DEFAULT_LANG];
        let text = dict[key];
        if (text === undefined) {
            // Fallback: Deutsch
            text = UI_LABELS[DEFAULT_LANG][key];
        }
        if (text === undefined) {
            // Immer noch kein Treffer: Key selbst als Debug-Anzeige
            return '[' + key + ']';
        }
        if (replacements && typeof replacements === 'object') {
            Object.keys(replacements).forEach(function (k) {
                text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), replacements[k]);
            });
        }
        return text;
    }

    // ============================================================
    // Sprach-State-Verwaltung
    // Aktuelle Sprache in localStorage, PIN-gebunden spaeter
    // ============================================================

    const LANG_STORAGE_KEY = 'tw-ma-lang';

    function getCurrentLanguage() {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.some(function (l) { return l.code === stored; })) {
            return stored;
        }
        return DEFAULT_LANG;
    }

    function setCurrentLanguage(code) {
        if (!SUPPORTED_LANGUAGES.some(function (l) { return l.code === code; })) {
            console.warn('TWMaConfig: unbekannte Sprache', code);
            return false;
        }
        localStorage.setItem(LANG_STORAGE_KEY, code);
        // Event feuern, damit Komponenten reagieren
        window.dispatchEvent(new CustomEvent('tw-ma-lang-changed', { detail: { code: code } }));
        return true;
    }

    function getLanguageInfo(code) {
        return SUPPORTED_LANGUAGES.find(function (l) { return l.code === code; }) || null;
    }

    // ============================================================
    // Schriftgroessen-Skala (A-Gross / A-Klein)
    // ============================================================

    const SCALE_STORAGE_KEY = 'tw-ma-font-scale';
    const SCALE_MIN = 0.85;
    const SCALE_MAX = 1.4;
    const SCALE_STEP = 0.08;

    function getFontScale() {
        const stored = parseFloat(localStorage.getItem(SCALE_STORAGE_KEY));
        if (isNaN(stored) || stored < SCALE_MIN || stored > SCALE_MAX) return 1;
        return stored;
    }

    function setFontScale(val) {
        const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, val));
        localStorage.setItem(SCALE_STORAGE_KEY, String(clamped));
        document.documentElement.style.setProperty('--font-scale', clamped);
        window.dispatchEvent(new CustomEvent('tw-ma-font-scale-changed', { detail: { scale: clamped } }));
        return clamped;
    }

    function increaseFontScale() { return setFontScale(getFontScale() + SCALE_STEP); }
    function decreaseFontScale() { return setFontScale(getFontScale() - SCALE_STEP); }

    // Initial anwenden
    document.documentElement.style.setProperty('--font-scale', getFontScale());

    // ============================================================
    // Export
    // ============================================================

    global.TWMaConfig = {
        APP_VERSION: APP_VERSION,
        DEFAULT_LANG: DEFAULT_LANG,
        SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES,
        FIRMEN_DATEN: FIRMEN_DATEN,
        FIREBASE_CONFIG: FIREBASE_CONFIG,
        TRANSLATION_CONFIG: TRANSLATION_CONFIG,
        DRIVE_CONFIG: DRIVE_CONFIG,
        UI_LABELS: UI_LABELS,
        t: t,
        getCurrentLanguage: getCurrentLanguage,
        setCurrentLanguage: setCurrentLanguage,
        getLanguageInfo: getLanguageInfo,
        getFontScale: getFontScale,
        setFontScale: setFontScale,
        increaseFontScale: increaseFontScale,
        decreaseFontScale: decreaseFontScale
    };

    console.log('[TWMaConfig] geladen, Version', APP_VERSION, 'Sprache', getCurrentLanguage());

})(window);
