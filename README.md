# Brainbite

Wissen in 5, 10, 15 oder 20 Minuten, zum Lesen oder Zuhören. Brainbite ist eine kostenlose Lern-Web-App (PWA) ohne Login, ohne Tracking und ohne Server.

**App öffnen:** https://jankdy1995.github.io/brainbite/

Auf dem iPhone in Safari öffnen, dann „Teilen“ › „Zum Home-Bildschirm“. Auf Android in Chrome über das Menü „App installieren“.

## Was drin ist

- Themen in vier Längen, auf Deutsch und Englisch
- Vorlesen mit der Gerätestimme, Satz für Satz hervorgehoben
- Gewichteter Feed nach deinen Lieblingsthemen
- Merkliste, Fortschritt, Hell und Dunkel
- Alle Daten bleiben auf deinem Gerät

## Für Entwickler und Agenten

Zuerst [`CLAUDE.md`](CLAUDE.md) lesen. Die Grundlagen stehen in [`docs/`](docs/): PRD, Design System, Architecture, Content Guide.

```bash
python3 -m http.server 8080          # lokal starten: http://localhost:8080
node scripts/validate-content.mjs    # Inhalte prüfen
node scripts/smoke-test.mjs          # Screens laden, Screenshots in .smoke/
node scripts/build-tokens.mjs        # css/tokens.css aus docs/tokens.json erzeugen
```

Schriften: Inter und Source Serif 4 (SIL Open Font License, siehe `assets/fonts/`).
