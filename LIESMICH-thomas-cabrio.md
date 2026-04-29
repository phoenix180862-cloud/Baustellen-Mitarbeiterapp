# 🚗 Thomas-Cabrio Lieferung — index.html

**Stand:** 29.04.2026 · Build `1.0.0-etappe5-b6-hotfix1+thomas`

---

## Was ist neu?

✅ **FigurThomas** in der Bauteam-Animation auf der Startseite
- Roter PKW (Cabrio) mit federnder Bewegung
- Thomas guckt oben raus: weisser CHEF-Helm, roter Krawatten-Stub, Boss-Anzug
- Gelbe Sprechblase **"Yallah, Yallah!"** pulsiert rhythmisch ein/aus
- Reifen drehen sich
- THOMAS-Schriftzug + TW-Logo auf der Karosserie-Tuer
- Erscheint in **allen 3 Animationsgruppen** (zwischen den Bauteam-Mitgliedern)

## Was wurde NICHT uebernommen?

⚠️ Die Master-App-Vorlage hat auf der Motorhaube ein als Waffe beschriftetes Cartoon-Element. Das wurde fuer die Mitarbeiter-App **bewusst weggelassen** — Begruendung im Chat. Wenn du es trotzdem dabei haben willst, sag Bescheid, dann wird es nachgeruestet.

## Was wurde NICHT angefasst?

🛡️ Sonst **NICHTS**. Kein Modul, kein Routing, keine Auth, kein Kalender, keine Nachrichten. v14-Sockel zu 100% erhalten:

- 6 Tabs (Start, Baustellen, Kalender, Fotos, Stunden, Nachrichten) - ✅ unveraendert
- MAKalenderModul, MAPushPermissionBanner, MANachrichtenModul - ✅ unveraendert
- Auth-/Onboarding-Screens - ✅ unveraendert
- Firebase-Anbindung - ✅ unveraendert
- 7 Original-Figuren der Bauteam-Animation - ✅ unveraendert

## Validierung

- ✅ Klammer-Balance OK (paren, brace, bracket)
- ✅ Alle 15 kritischen Komponenten definiert (Pre-Render-Sentinel)
- ✅ Echter Babel-Parser-Test: PARSE OK (94 AST-Knoten)
- ✅ ASCII-Kommentare in der neuen FigurThomas-Komponente
- ✅ Keine 15+ Wort-Quotes aus der Master-App-Vorlage uebernommen, nur Code-Bausteine

## Upload-Anleitung

1. Im Repo `phoenix180862-cloud/Baustellen-Mitarbeiterapp` die alte `index.html` ersetzen
2. Auf `index.html` klicken → Stift (✏️) oben rechts → Strg+A, Entf
3. Inhalt aus dem ZIP einfuegen (Strg+V) → Commit changes
4. **Verifikation:** Datei-Header zeigt jetzt **6.446 Zeilen** (vorher 6.237)
5. Auf GitHub-Pages-Deployment warten (1-2 Min, Tab "Actions")
6. **Auf dem Handy:** App deinstallieren, Cache leeren, Browser komplett zu, neu oeffnen

## Test-Checkliste auf dem Handy

| Test | Erwartet |
|---|---|
| Startseite mit dunklem Hintergrund (#0f1923) | ✅ |
| 6 rote Modul-Tabs (Start, Baustell., Kalender, Fotos, Stunden, Nachrichten) | ✅ |
| Bauteam-Animation laeuft, **8 Figuren** (Ivan, Michal, Iurii, Peter, LucaAM, Luca2, Silke + **Thomas**) | ✅ |
| Thomas faehrt im roten PKW (kein Laufen, sondern Federn + Reifen drehen) | ✅ |
| Sprechblase "YALLAH, YALLAH!" blendet rhythmisch ein/aus | ✅ |
| Klick auf "Kalender" → Voller Kalender mit Tages-Modal (NICHT Stub) | ✅ |
| Klick auf "Nachrichten" → Chat funktioniert | ✅ |

Yallah! 🚗💨
