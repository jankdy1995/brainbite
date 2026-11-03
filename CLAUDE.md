# CLAUDE.md – Anweisungen für KI-Agenten

Dieses Dokument richtet sich an Claude (und andere Coding-Agenten), die an **Brainbite** arbeiten, auch an die wöchentliche geplante Aufgabe, die neue Artikel erstellt. Jede Session beginnt ohne Erinnerung an frühere Gespräche. Dieses Dokument und die Dateien in `docs/` sind das Gedächtnis des Projekts.

## 1. Worum es geht

Brainbite ist eine kostenlose Lern-Web-App (PWA) für das Smartphone. Sie bietet Wissensartikel in vier Längen (5, 10, 15 und 20 Minuten), auf Deutsch und Englisch, zum Lesen und zum Anhören per Gerätestimme. Es gibt keinen Login, kein Backend und keine laufenden Kosten. Der Betreiber ist Jan (Product Owner, testet und gibt Feedback); Claude schreibt den Code und die Inhalte.

## 2. Bevor du startest

- [ ] `docs/PRD.md` lesen: Was bauen wir, für wen, was ist im MVP?
- [ ] `docs/DESIGN_SYSTEM.md` lesen, bevor du UI anfasst. Verbindliche Quelle für Tokens, Logos und Komponenten ist das Design System „Brainbite“: https://claude.ai/artifact/FWEWm6JrACJLZtzw87ULbV (zuerst dessen `project/README.md` lesen)
- [ ] `docs/ARCHITECTURE.md` lesen: Struktur, Datenmodell, Datenfluss
- [ ] `docs/CONTENT_GUIDE.md` lesen, **bevor du Artikel schreibst oder änderst**
- [ ] Bestehenden Code und Komponenten ansehen, bevor du Neues anlegst

## 3. Goldene Regeln

1. **Keine Kosten, keine Server.** Nur statische Dateien, gehostet auf GitHub Pages. Keine kostenpflichtigen APIs, keine Datenbanken.
2. **Keine Abhängigkeiten ohne Rückfrage.** Vanilla HTML, CSS und JavaScript (ES-Module), kein Framework, kein Build-Schritt. Eine neue Bibliothek nur nach Absprache mit Jan.
3. **Privatsphäre zuerst.** Kein Tracking, keine Cookies, keine Analytics, keine Anfragen an Drittserver (auch keine Google Fonts oder CDNs). Alles wird selbst gehostet.
4. **Design-Tokens statt fester Werte.** Farben, Abstände, Radien und Schriftgrößen kommen ausschließlich aus `css/tokens.css`.
5. **Zweisprachig ab Tag 1.** Jeder sichtbare UI-Text steht in `i18n/de.json` und `i18n/en.json`, nie direkt im Code.
6. **Inhalte sind Fakten.** Artikel nur nach `docs/CONTENT_GUIDE.md`: eigene Worte, geprüfte Fakten, Quellen angegeben. Nie Texte aus dem Netz kopieren.
7. **Klein und verständlich halten.** Keine unnötigen Dateien, keine vorzeitige Abstraktion.
8. **Bei großen Änderungen erst fragen** (Architektur, neue Abhängigkeiten, Datenformat, Design-Grundlagen).

## 4. Code-Richtlinien

- JavaScript als ES-Module, eine Datei pro Verantwortung (siehe `docs/ARCHITECTURE.md`).
- Sprechende Namen auf Englisch (`renderArticleCard`, nicht `rac`). Kommentare dürfen deutsch sein.
- Kleine Funktionen; DOM-Erzeugung in `js/views/`, Logik in `js/core/`.
- Text immer über `textContent` einsetzen, nie über `innerHTML` mit Inhaltsdaten.
- Semantisches, barrierearmes HTML: echte `<button>`s, Labels, `aria-*` nur wo nötig, sichtbarer Fokus, Tap-Ziele mindestens 44 × 44 px.
- CSS: mobil zuerst, Klassen nach dem Muster `.c-card`, `.c-card__title`, `.is-active`. Keine Inline-Styles außer dynamischen Werten.
- `prefers-reduced-motion`, `prefers-color-scheme` und `prefers-reduced-transparency` respektieren.
- Fehler abfangen und freundlich anzeigen, z. B. wenn ein Artikel nicht lädt oder keine Stimme verfügbar ist. Zugriffe auf `localStorage` immer in `try/catch`.

## 5. Sicherheit & Datenschutz

- Keine API-Keys, Tokens oder Passwörter im Repo, auch nicht in Kommentaren.
- Keine personenbezogenen Daten erheben. Nutzerdaten (Präferenzen, Fortschritt, Favoriten) bleiben im `localStorage` des Geräts.
- Externe Links (Quellen) mit `rel="noopener noreferrer"` und `target="_blank"`.
- Content-JSON vor dem Commit mit dem Validierungsskript prüfen.

## 6. Nützliche Befehle

```bash
# Lokal starten (im Projektordner)
python3 -m http.server 8080        # dann http://localhost:8080

# Artikel-Dateien prüfen (Schema, Wortzahlen, Quellen)
node scripts/validate-content.mjs

# Smoke-Test der wichtigsten Screens (Playwright, sobald vorhanden)
node scripts/smoke-test.mjs
```

## 7. Git & Veröffentlichung

- `main` ist live: Jeder Push auf `main` wird automatisch über GitHub Pages veröffentlicht.
- Commit-Nachrichten kurz und auf Deutsch oder Englisch, nach Muster `feat: …`, `fix: …`, `content: 2 neue Artikel (…)`, `docs: …`.
- Vor jedem Push: Validierungsskript grün, Smoke-Test grün (keine Konsolenfehler).
- Bei Änderungen an der App-Shell (HTML, CSS, JS, i18n) `VERSION` in `sw.js` erhöhen. Reine Inhalts-Commits brauchen das nicht.

## 8. Definition of Done

Eine Änderung ist fertig, wenn:
- sie dem PRD und dem Design System entspricht,
- sie auf einem schmalen Handy-Viewport (375 px) in Hell **und** Dunkel geprüft wurde,
- alle UI-Texte in DE und EN vorhanden sind,
- keine Konsolenfehler auftreten und das Validierungsskript grün ist,
- betroffene Dokumente in `docs/` aktualisiert wurden, falls sich Entscheidungen geändert haben.

## 9. Unsicher?

Erst in `docs/` nachsehen, dann am bestehenden Code orientieren. Wenn eine Entscheidung schwer rückgängig zu machen ist oder mehrere Wege vernünftig sind: Jan fragen. In unbeaufsichtigten Läufen (z. B. die wöchentliche Aufgabe) die sicherste Variante wählen und im Commit beschreiben, was entschieden wurde.
