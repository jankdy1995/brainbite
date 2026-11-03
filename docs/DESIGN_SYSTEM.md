# Design System – Brainbite (Tiefsee · Stil „Ruhig“)

Stand: 02.11.2026. **Verbindliche Quelle** ist das Design System „Brainbite“ (Claude-Artifact): https://claude.ai/artifact/FWEWm6JrACJLZtzw87ULbV. Dort stehen Tokens (`tokens.json`), Brand-Book (`README.md`), Logos und Bausteine mit Live-Vorschau. **Referenz-Screens** sind die Mockups v4 „Ruhig“ (Design-Entwurf „Brainbite – Mockups“, Seite „Mockups · Final“). `css/tokens.css` im Code wird aus `tokens.json` abgeleitet.

---

## 01 Haltung

Ruhig, tief, einladend. Man soll sich wohlfühlen und in ein Thema eintauchen können. Modern und nativ (an iOS angelehnt), aber nie laut.

**Ruhe-Regeln**
1. **Ein Farbschimmer** pro Screen (`glow`), oben, sehr weich. Keine weiteren Farbkugeln.
2. **Eine Koralle** pro Screen (`accent`): die Hauptaktion oder der eine hervorgehobene Wert.
3. **Höchstens drei Bereiche** pro Screen.
4. **Keine Deko:** keine Badges, Tag-Chips, Pfeile auf Kacheln, Zeitleisten-Punkte, Rahmen.
5. **Ein Label in Großbuchstaben** pro Element, höchstens.
6. **Viel Luft:** Seitenrand 20 px (Reader und Onboarding 24 px), Abschnitte 20 px.

## 02 Farben

**Dunkel ist der Hauptmodus**, Hell ist vollwertig und folgt dem Gerät (manuell umschaltbar). Nur Petrol, Koralle, Grautöne. Keine Kategorie-Farben, kein Grün/Gelb/Rot.

| Token | Dunkel | Hell | Verwendung |
|---|---|---|---|
| `bg` | #071417 | #F2F6F6 | Seiten-Grund |
| `glow` | rgba(15,76,85,0.85) | rgba(140,207,214,0.45) | Ein Farbschimmer, ~560 × 480 px, Unschärfe 100 px |
| `surface` | #0E2226 | #FFFFFF | Deckende Flächen, Sheets |
| `reader` | #071417 | #F7FAFA | Lesefläche, immer deckend |
| `glass` | rgba(255,255,255,0.05) | rgba(255,255,255,0.72) | Karten, Kacheln, Listen |
| `glass-bar` | rgba(20,36,40,0.72) | rgba(255,255,255,0.72) | Tab-Leiste, Vorlese-Leiste |
| `glass-edge` | rgba(255,255,255,0.08) | rgba(11,30,34,0.06) | 0,5-px-Kante |
| `fill` | rgba(255,255,255,0.05) | rgba(255,255,255,0.60) | Segment-Spur, runde Buttons |
| `segment-active` | rgba(140,207,214,0.18) | #FFFFFF | Aktive Segment-Fläche |
| `track` | rgba(255,255,255,0.05) | rgba(11,30,34,0.06) | Spur für Balken und Fortschritt |
| `separator` | rgba(255,255,255,0.08) | rgba(11,30,34,0.10) | Haarlinien |
| `text` | #ECF4F4 | #0B1E22 | Haupttext |
| `text-reading-2` | #D4E3E4 | #2A3E42 | Folgeabsätze im Reader |
| `text-secondary` | #B5C7C9 | #41575B | Begrüßung, Labels, Werte |
| `text-tertiary` | #8FA5A8 | #41575B | Metadaten |
| `tint` | #8CCFD6 | #0F4C55 | Aktives, Kategorie-Label, Links |
| `on-tint` | #071417 | #FFFFFF | Auf `tint` |
| `tint-soft` | rgba(140,207,214,0.14) | rgba(15,76,85,0.08) | Aktiver Tab, Kapsel „10 Min ⌄“ |
| `accent` | #FF8A75 | #FF6F59 | Koralle: eine Hauptaktion |
| `on-accent` | #071417 | #0B1E22 | Schrift auf Koralle (**nie Weiß**) |
| `accent-text` | #FFB4A6 | #B93A28 | Nur Warn-Links („Daten zurücksetzen“) |
| `highlight` | rgba(255,138,117,0.20) | rgba(255,111,89,0.16) | Vorgelesener Satz |
| `brand-petrol` | #0F4C55 | #0F4C55 | App-Icon, Icon-Kacheln, gewählte Kachel, Illustrations-Grund |
| `illu-mid` / `illu-line` / `illu-light` / `illu-void` | #14606A / #1D6B75 / #8CCFD6 / #071417 | gleich | Illustrationen |

Alle Textfarben erfüllen WCAG AA in beiden Themes.

## 03 Schrift

- **Oberfläche:** Systemschrift (`-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif`), Inter selbst gehostet.
- **Artikel:** Source Serif 4 (selbst gehostet), Standard 19/32 zum Eintauchen.

| Stil | Größe/Zeile | Gewicht | Verwendung |
|---|---|---|---|
| `large-title` | 34/41 | 700 | Screen-Titel |
| `title-1` | 34/40 | 700 | Artikeltitel |
| `title-2` | 26/31 | 700 | Heute-Karte |
| `headline` | 16/21 | 600 | Titel in Listen |
| `body` | 17/25 | 400 | Einleitungen, Optionen |
| `subhead` | 15/20 | 400 | Leise Zeile über Titeln |
| `footnote` | 13/18 | 400 | Metadaten, Abschnitts-Labels |
| `label` | 12/16, +0,6 px | 600 | Großbuchstaben-Label |
| `stat` | 34/38 | 700 | Kennzahlen, Zeit-Kacheln |
| `reading-s/m/l/xl` | 17/29 · 19/32 · 21/35 · 24/39 | 400 | Lesetext, Standard M |

## 04 Abstände & Radien

- Abstände: 4 · 8 · 12 · 14 · 20 · 24 · 32 · 44 px (`space-1` bis `space-8`).
- Radien: `radius-icon` 9, `radius-tile` 14, `radius-group` 26, `radius-hero` 30, `radius-sheet` 32, `radius-capsule` 999.

## 05 Glas & Ebenen

| Ebene | Was | Gestaltung |
|---|---|---|
| 0 | Grund | `bg` + ein `glow` |
| 1 | Karten, Kacheln, Listen | `glass` + Unschärfe 24 px + `glass-edge` + `glass-highlight` |
| 2 | Tab-Leiste, Vorlese-Leiste | `glass-bar` + `shadow-float` |
| 3 | Sheets | `surface` + `shadow-sheet` |

Lesetext steht nie auf Glas. Fallback ohne `backdrop-filter` oder bei `prefers-reduced-transparency`: `surface` deckend.

## 06 Illustrationen

Abstrakte Motive statt Fotos, nur Petrol-Töne (`brand-petrol`, `illu-*`), **keine Koralle**. 3–5 Formen je Motiv. Ein Motiv pro Thema (Ring + Kern, Mondsichel, Knoten-Netz, Balken, Wellen, Chip, Globus). Größen: Listen-Kachel 48 px, Heute-Karte 176 px, Reader-Kopf 320 px mit weichem Verlauf in den Grund.

## 07 Logo & Icons

- Logo **b mit Punkt** (Petrol bzw. #ECF4F4, Punkt Koralle), Wortmarke „brainbite“ klein, Systemschrift Bold. Dateien unter `assets/Logos`.
- Eigene Icons im Stil von SF Symbols, 24 px, Linie 1,9 px, **aktiv gefüllt**. Tab-Leiste nur mit Icons und `aria-label`.

## 08 Bausteine

| Baustein | Kern |
|---|---|
| ArticleCard (Heute-Karte) | Illustration oben, deckender Fuß, Label, `title-2`, Meta, Abspielen in Koralle |
| TopicRow | Gruppierte Glas-Liste: Illustrations-Kachel, Titel, Meta in Worten, Dauer rechts |
| TimeTile | 2×2-Kacheln mit großer Zahl; gewählt = Petrol + Ring in `tint`; auch als Kennzahl-Kachel |
| WeekChart | Kapsel-Balken auf Spur, stärkster Tag in Koralle, ein Satz Einordnung |
| SegmentedControl | Kapsel, dezente aktive Fläche (`segment-active`), nie Koralle |
| TabBar | Schwebende Glas-Kapsel, 4 Icons, aktiv gefüllt auf `tint-soft` |
| MiniPlayer | Vorlese-Leiste: „Vorlesen“, Zeit, vorheriger Absatz, Abspielen in Koralle, 2-px-Fortschritt |
| SettingsList | Gruppierte Glas-Liste mit Petrol-Icon-Kacheln; Hinweise als Satz darunter |
| Button | Kapsel 56 px (Onboarding) bzw. 50 px: Haupt in Koralle, getönt in `tint-soft` |
| Toggle | 51 × 31, an = `tint` |

## 09 Screens (Referenz v4)

- **Onboarding:** 1) Willkommen + Sprache, 2) Themen mit Rang und Anteil, 3) Standardzeit als 2×2-Kacheln. Unten jeweils eine Koralle-Kapsel.
- **Entdecken:** „Guten Abend“, Large Title, Lesezeit-Umschalter, eine Heute-Karte, „Als Nächstes“ mit zwei Zeilen.
- **Artikel:** Illustrations-Kopf, runde Glas-Buttons (Zurück · Aa + Merken), Label, Titel, Meta-Zeile mit Kapsel „10 Min ⌄“, Serif-Text, Vorlese-Leiste statt Tab-Leiste.
- **Merkliste:** eine Liste, Entfernen per Wischen.
- **Fortschritt:** zwei Kennzahlen, WeekChart, „Zuletzt“.
- **Einstellungen:** eine Liste (Themen, Standardlänge, Stimme, Sprache), Erscheinungsbild-Umschalter, Datenschutz-Satz.

## 10 Bewegung

200–300 ms, weiche Federkurven; Seiten schieben, Sheets von unten. `prefers-reduced-motion`: nur Ein-/Ausblenden.

## 11 Barrierefreiheit & Sprache

Kontraste WCAG AA, Tippflächen ≥ 44 × 44 px, sichtbarer Fokusring (2 px `tint`), `aria-label` an Icon-Buttons, Sortieren ohne Ziehen. Deutsch in Du-Form, kurz und freundlich; keine Emojis.
