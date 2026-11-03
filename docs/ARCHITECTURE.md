# Architecture – Brainbite

Wie das Projekt aufgebaut ist, welcher Tech-Stack genutzt wird und wie alles zusammenhängt. Großes Bild, klare Struktur, so wenig Technik wie möglich.

---

## 01 Systemüberblick

```
┌───────────────┐   lädt statische Dateien   ┌────────────────────────┐
│  Smartphone   │ ◄──────────────────────────│   GitHub Pages (CDN)   │
│  Browser/PWA  │                            │  HTML · CSS · JS · JSON │
└──────┬────────┘                            └───────────▲────────────┘
       │ speichert lokal                                 │ git push (main)
       ▼                                                 │
┌───────────────┐                            ┌───────────┴────────────┐
│ localStorage  │                            │   GitHub-Repository    │
│ Präferenzen,  │                            │  Code + content/*.json │
│ Fortschritt,  │                            └───────────▲────────────┘
│ Favoriten     │                                        │ neue Artikel (wöchentlich)
└───────────────┘                            ┌───────────┴────────────┐
       │ Sprachausgabe                       │ Claude (geplante       │
       ▼                                     │ Aufgabe): Recherche,   │
┌───────────────┐                            │ Schreiben, Prüfen      │
│ Web Speech API│                            └────────────────────────┘
│ (Gerätestimme)│
└───────────────┘
```

**Es gibt kein Backend.** Die App besteht nur aus statischen Dateien. Inhalte sind JSON-Dateien im Repo. Alles Persönliche bleibt auf dem Gerät.

## 02 Tech-Stack

| Bereich | Wahl | Warum |
|---|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (ES-Module) | Keine Abhängigkeiten, kein Build-Schritt, leicht wartbar |
| Routing | Hash-Router (`#/feed`, `#/article/…`) | Funktioniert auf GitHub Pages ohne Server-Konfiguration |
| Inhalte | JSON-Dateien in `content/` | Versioniert, kostenlos, von Claude leicht zu erzeugen |
| Speicher | `localStorage` (Schlüssel `brainbite:v1`) | Kein Login nötig |
| Sprachausgabe | Web Speech API (`speechSynthesis`) | Kostenlos, im Browser eingebaut |
| Offline/Install | Web App Manifest + Service Worker | Installierbar, schneller Start |
| Schriften & Icons | Systemschrift (SF auf Apple-Geräten) mit Inter als Ersatz, Source Serif 4, eigene Icons im SF-Symbols-Stil; alles selbst gehostet | Datenschutz, keine Drittanfragen, nativer Look |
| Hosting | GitHub Pages (Branch `main`, Root) | Kostenlos, automatisches Deployment |
| Prüfung | Node-Skript (Content), Playwright (Smoke-Test) | Lokal / in der Claude-Session ausgeführt |
| Analytics, Auth, Zahlungen | – | Bewusst nicht vorhanden |

## 03 Projektstruktur

```
brainbite/
├── CLAUDE.md                  # Anweisungen für KI-Agenten
├── README.md                  # Kurzinfo + Link zur App
├── index.html                 # App-Shell (einzige HTML-Seite)
├── manifest.webmanifest       # PWA-Manifest
├── sw.js                      # Service Worker
├── docs/                      # PRD, DESIGN_SYSTEM, ARCHITECTURE, CONTENT_GUIDE
├── assets/
│   ├── fonts/                 # Inter (Ersatz für die Systemschrift), Source Serif 4 (woff2)
│   ├── icons/                 # Eigene SVG-Icons (Linie + gefüllt), App-Icons (192/512, maskable)
│   └── img/                   # Logo
├── css/
│   ├── tokens.css             # Design-Tokens (Farben, Abstände, Schrift)
│   ├── base.css               # Reset, Typografie, Hintergrund
│   └── components.css         # Komponenten (.c-card, .c-player, …)
├── js/
│   ├── app.js                 # Einstieg: init, Router starten
│   ├── core/
│   │   ├── router.js          # Hash-Routing
│   │   ├── store.js           # Lesen/Schreiben localStorage, Migrationen
│   │   ├── content.js         # Laden & Cachen von index.json und Themen
│   │   ├── feed.js            # Gewichteter Feed-Algorithmus
│   │   ├── tts.js             # Sprachausgabe: Satz-Queue, Pause, Tempo
│   │   └── i18n.js            # UI-Texte, Sprachwechsel
│   └── views/
│       ├── onboarding.js
│       ├── feed.js
│       ├── article.js
│       ├── saved.js
│       ├── progress.js
│       ├── settings.js
│       └── components.js      # Wiederverwendbare UI-Bausteine
├── i18n/
│   ├── de.json
│   └── en.json
├── content/
│   ├── index.json             # Katalog: Kategorien + alle Themen (Metadaten)
│   └── topics/
│       ├── black-holes.de.json
│       └── black-holes.en.json
└── scripts/
    ├── validate-content.mjs   # Schema, Wortzahlen, Quellen prüfen
    └── smoke-test.mjs         # Playwright: wichtigste Screens laden
```

## 04 Datenmodell

### `content/index.json` (Katalog, klein, wird zuerst geladen)

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-11-09",
  "categories": [
    { "id": "science", "name": { "de": "Wissenschaft & Natur", "en": "Science & Nature" } },
    { "id": "tech-economy", "name": { "de": "Technik & Wirtschaft", "en": "Tech & Economy" } }
  ],
  "topics": [
    {
      "id": "black-holes",
      "category": "science",
      "publishedAt": "2026-11-09",
      "motif": "ring",
      "tags": ["astronomie", "physik"],
      "title": { "de": "Schwarze Löcher", "en": "Black Holes" },
      "teaser": { "de": "…", "en": "…" },
      "words": {
        "de": { "5": 1010, "10": 2040, "15": 2980, "20": 4050 },
        "en": { "5": 1160, "10": 2310, "15": 3420, "20": 4610 }
      }
    }
  ]
}
```

### `content/topics/<id>.<lang>.json` (wird erst beim Öffnen geladen)

```json
{
  "id": "black-holes",
  "lang": "de",
  "title": "Schwarze Löcher",
  "versions": {
    "5": {
      "words": 1010,
      "sections": [
        { "heading": "…", "paragraphs": ["…", "…"] }
      ],
      "keyTakeaways": ["…", "…", "…"]
    },
    "10": { "…": "…" },
    "15": { "…": "…" },
    "20": { "…": "…" }
  },
  "sources": [
    { "title": "…", "publisher": "…", "url": "https://…", "accessed": "2026-11-09" }
  ],
  "factCheckedAt": "2026-11-09"
}
```

Text ist reiner Text (kein HTML, kein Markdown). Die App erzeugt das Markup selbst.

`motif` wählt die Illustration (Petrol-Töne, siehe Design System): `ring`, `moon`, `network`, `bars`, `waves`, `chip`, `globe`. Neue Motive werden in `js/views/components.js` ergänzt.

### Lokaler Zustand (`localStorage["brainbite:v1"]`)

```json
{
  "schemaVersion": 1,
  "onboarded": true,
  "lang": "de",
  "theme": "auto",
  "categories": [
    { "id": "science", "rank": 1, "enabled": true },
    { "id": "tech-economy", "rank": 2, "enabled": true }
  ],
  "preferredLength": 10,
  "feedCategory": "all",
  "fontSize": "M",
  "tts": { "rate": 1.0, "voiceURI": { "de": null, "en": null } },
  "favorites": ["black-holes"],
  "progress": {
    "black-holes": {
      "10": { "status": "done", "scroll": 1.0, "sentence": 0, "updatedAt": "2026-11-10T19:02:00Z", "mode": "listen" }
    }
  },
  "history": [
    { "id": "black-holes", "len": 10, "at": "2026-11-10T19:02:00Z", "minutes": 14, "mode": "listen" }
  ]
}
```

`history` enthält einen Eintrag pro abgeschlossenem Artikel (Grundlage für „Fortschritt“ und das Wochen-Diagramm, höchstens 500 Einträge). `sentence` merkt sich die Vorlese-Position.

`store.js` kapselt den Zugriff, fängt Fehler ab (privater Modus, voller Speicher) und migriert bei neuer `schemaVersion`.

## 05 Zeitangaben

- **Lesedauer** = gewählte Länge (5/10/15/20). Sie ist redaktionell über die Wortzahl abgesichert (siehe CONTENT_GUIDE).
- **Hördauer** = `Wörter / 150 / Tempo`, gerundet auf ganze Minuten, z. B. 1.000 Wörter ≈ 7 Min bei 1,0×.

## 06 Gewichteter Feed (`feed.js`)

1. Nur Themen aus den gewählten Kategorien, in der aktuellen Sprache.
2. Gewicht je Kategorie: `n − rang + 1` (bei 2 Kategorien also 2 : 1).
3. Pro Kategorie eine Warteschlange: zuerst ungelesene (neueste zuerst), dann begonnene, dann gelesene.
4. Zusammenführen per **Smooth Weighted Round Robin**: deterministisch, gleichmäßig verteilt, keine Zufallssprünge beim Neuladen.
5. Ist eine Warteschlange leer, füllen die anderen auf.
6. Über das Ausklappmenü in „Entdecken“ lässt sich eine einzelne Kategorie wählen (`feedCategory`); dann zeigt der Feed nur deren Themen.

## 07 Datenfluss

1. Nutzer öffnet den Link → `index.html` + CSS/JS (aus dem Service-Worker-Cache, wenn vorhanden).
2. `app.js` liest den Zustand aus dem `store`. Ist `onboarded = false`, folgt das Onboarding.
3. `content.js` lädt `content/index.json` (Netzwerk zuerst, Cache als Fallback).
4. `feed.js` baut den Feed → `views/feed.js` rendert die Karten.
5. Tippen auf eine Karte → `#/article/<id>?len=10` → Themen-Datei der aktuellen Sprache wird geladen und gecacht.
6. Scrollen bzw. Audio aktualisiert den Fortschritt im `store`; Merken schreibt in `favorites`.

## 08 Sprachausgabe (`tts.js`)

- Text wird in **Sätze** zerlegt und als Warteschlange einzelner `SpeechSynthesisUtterance`s gesprochen. Das umgeht den Chrome-Fehler, bei dem lange Texte nach ~15 s abbrechen, und ermöglicht die Satz-Hervorhebung.
- **Pause/Fortsetzen** = `cancel()` und beim aktuellen Satz neu starten (zuverlässiger als `pause()`/`resume()` auf Android/iOS).
- Start nur nach Nutzer-Tipp (iOS-Vorgabe). Stimmen laden asynchron (`voiceschanged`).
- Safari-Eigenheiten: `cancel()` nur aufrufen, wenn wirklich gesprochen wird (sonst wird das nächste `speak()` verworfen); Referenz auf das laufende Utterance halten; Wächter startet ein hängendes Utterance einmal neu und zeigt sonst einen Hinweis (Stummschalter, Lautstärke).
- „Anhören“ im Feed spricht sofort den Titel, damit der Tipp die Stimme entsperrt; der Artikel liest danach weiter.
- Ein kurzer stummer Ton im Tipp schaltet die iOS-Audio-Sitzung auf Wiedergabe.
- Stimmwahl: gespeicherte Stimme → beste lokale Stimme der Sprache → Hinweis „Keine Stimme gefunden“.
- Bekannte Einschränkung: Auf iOS stoppt die Ausgabe bei gesperrtem Bildschirm. Lösung in Phase 2: vorgenerierte MP3s über `<audio>`.

## 09 Service Worker & Caching

| Was | Strategie |
|---|---|
| App-Shell (HTML, CSS, JS, Fonts, Icons) | Precache bei Installation, Version im Cache-Namen |
| `content/index.json` | Netzwerk zuerst, Cache als Fallback |
| `content/topics/*.json` | Cache zuerst nach erstem Öffnen, im Hintergrund aktualisieren |

Bei neuer App-Version erscheint ein Toast „Neue Version verfügbar – neu laden“. **Wichtig:** Bei jeder Änderung an HTML, CSS, JS oder `i18n/` die Konstante `VERSION` in `sw.js` erhöhen, sonst sehen installierte Apps die Änderung nicht. Neue Dateien der App-Shell in `SHELL_FILES` eintragen.

## 10 Deployment

- GitHub Pages veröffentlicht den Branch `main` aus dem Root-Verzeichnis.
- Deployment = `git push`. Kein Build, keine Secrets.
- URL: `https://<github-user>.github.io/brainbite/`. Deshalb alle Pfade **relativ** (`./css/…`), Service-Worker-Scope `./`.

## 11 Content-Pipeline (geplante Aufgabe)

1. Repo klonen, `CLAUDE.md` und `docs/CONTENT_GUIDE.md` lesen.
2. `content/index.json` lesen; 2 neue Themen wählen (1 pro Kategorie, keine Dopplungen).
3. Recherche → Texte in 4 Längen × 2 Sprachen → Faktencheck.
4. Dateien schreiben, `index.json` ergänzen, `node scripts/validate-content.mjs` ausführen.
5. Commit `content: 2 neue Artikel (…)` und Push auf `main`.

## 12 Skalierung & spätere Erweiterungen

- **Viele Artikel:** `index.json` bleibt bis einige hundert Themen klein (~1 KB pro Thema); danach Aufteilung pro Kategorie.
- **KI-Stimmen:** MP3 pro Thema/Länge/Sprache in `content/audio/`, ggf. über Git LFS oder einen kostenlosen Objektspeicher.
- **Sync zwischen Geräten:** nur über Export/Import einer JSON-Datei; kein Konto.
- **Weitere Kategorien:** nur Eintrag in `index.json` + Icon im Design System (keine eigenen Farben).
