# PRD – Product Requirements Document

**Brainbite**: Wissen in Häppchen. Ein klarer Plan, was wir bauen, warum, und woran wir erkennen, dass es funktioniert.

Stand: 02.11.2026 · Status: MVP in Planung · Verantwortlich: Jan (Product Owner), Claude (Umsetzung)

---

## 01 Produktüberblick

| | |
|---|---|
| **Name** | Brainbite |
| **Tagline** | DE: „Wissen in Häppchen – in 5 bis 20 Minuten.“ · EN: „Knowledge in bites – 5 to 20 minutes.“ |
| **Beschreibung** | Eine Web-App für das Smartphone mit gut recherchierten Wissensartikeln. Jeder Artikel ist in 5, 10, 15 oder 20 Minuten Lesezeit wählbar und lässt sich vorlesen. Nutzer wählen und priorisieren ihre Lieblingskategorien. Kein Login, kein App Store: Link öffnen und loslegen. |
| **Plattform** | Progressive Web App (PWA), installierbar über „Zum Home-Bildschirm“ |
| **Sprachen** | Deutsch und Englisch (Oberfläche und Inhalte) |
| **Budget** | 0 € laufende Kosten |

## 02 Problem

Wer sich nebenbei Wissen aneignen will, hat selten feste Zeitfenster. Es gibt mal 5 Minuten in der Bahn und mal 20 Minuten beim Spazierengehen. Die meisten Artikel im Netz passen nicht in diese Zeitfenster: Sie sind zu lang oder zu oberflächlich, voller Werbung, und lassen sich nicht bequem anhören. Es fehlt eine ruhige, werbefreie Quelle, die dieselbe Frage in genau der verfügbaren Zeit beantwortet.

## 03 Ziel

Ein Thema in genau der Zeit verstehen, die man gerade hat: lesend oder hörend, ohne Anmeldung und ohne Ablenkung.

## 04 Zielgruppe

- **Primär:** Jan und sein Umfeld (persönliches Projekt)
- **Persona „Pendlerin“:** hat unterwegs 5–10 Minuten und hört lieber, als zu lesen
- **Persona „Neugieriger“:** will abends 20 Minuten tief in ein Thema eintauchen

## 05 User Stories (MVP)

1. Als Nutzer möchte ich beim ersten Start Sprache und Kategorien wählen und meine Kategorien in eine Reihenfolge bringen, damit mein Feed zu mir passt.
2. Als Nutzer möchte ich eine Länge (5/10/15/20 Min) wählen, damit ich nur Artikel sehe, die in meine verfügbare Zeit passen.
3. Als Nutzer möchte ich einen Artikel angenehm lesen, mit gut lesbarer Schrift, anpassbarer Schriftgröße und Hell-/Dunkel-Modus.
4. Als Nutzer möchte ich mir einen Artikel vorlesen lassen, ihn pausieren und das Tempo anpassen.
5. Als Nutzer möchte ich die Länge eines Artikels wechseln können, auch während ich ihn lese.
6. Als Nutzer möchte ich Artikel merken und später in einer Merkliste wiederfinden.
7. Als Nutzer möchte ich sehen, was ich schon gelesen oder gehört habe und wie viel Zeit ich gelernt habe.
8. Als Nutzer möchte ich sehen, aus welchen Quellen ein Artikel stammt.

## 06 Kernfunktionen (MVP) & Akzeptanzkriterien

### F1 Onboarding (3 Schritte)
- Schritt 1: Sprache (DE/EN). Voreinstellung ist die Gerätesprache, Fallback EN.
- Schritt 2: Kategorien wählen (mindestens 1) und per Ziehen **oder** Pfeil-Buttons sortieren.
- Schritt 3: bevorzugte Standardlänge (5/10/15/20).
- Wird nur beim ersten Start gezeigt; alles ist später in den Einstellungen änderbar.

### F2 Entdecken-Feed
- Oben ein Längen-Umschalter (5 · 10 · 15 · 20 Min), voreingestellt auf die Standardlänge.
- Artikelkarten mit Kategorie, Titel, Teaser, Lese- und Hördauer sowie Status (neu / begonnen / gelesen).
- **Gewichteter Feed:** Höher priorisierte Kategorien erscheinen öfter (Algorithmus siehe ARCHITECTURE). Ungelesenes kommt vor Gelesenem.
- Filter nach Kategorie über Chips (optional einblendbar).

### F3 Artikelansicht (Reader)
- Titel, Kategorie, Länge (umschaltbar), Lese- und Hördauer.
- Zwischenüberschriften und Absätze; am Ende „Das Wichtigste in Kürze“ und eine Quellenliste.
- Schriftgröße in 3 Stufen einstellbar.
- Lesefortschritt als dünner Balken oben; Status „gelesen“, sobald 90 % gescrollt oder das Audio beendet ist.
- Merken-Button (Lesezeichen).

### F4 Voice-Over (Gerätestimme)
- Audio-Leiste unten: Play/Pause, vorheriger und nächster Absatz, Tempo (0,8× bis 1,5×).
- Der aktuell gelesene Satz wird im Text hervorgehoben; die Ansicht scrollt mit.
- Die Stimme passt zur Artikelsprache; die Stimmauswahl ist in den Einstellungen.
- Ist keine passende Stimme verfügbar, erscheint ein freundlicher Hinweis und Lesen funktioniert weiter.

### F5 Merkliste
- Liste aller gemerkten Artikel; Entfernen per Button.

### F6 Fortschritt
- Gelesene/gehörte Artikel mit Datum und Länge.
- Kennzahlen: Anzahl Artikel und gelernte Minuten gesamt.

### F7 Einstellungen
- Sprache, Kategorien & Priorität, Standardlänge, Erscheinungsbild (Auto/Hell/Dunkel), Stimme & Tempo, Schriftgröße.
- „Alle Daten zurücksetzen“ (mit Bestätigung).
- Hinweis: Daten liegen nur auf diesem Gerät.

### F8 PWA
- Installierbar (Manifest, Icons, Service Worker), Start im Vollbild ohne Browserleiste.
- App-Shell wird gecacht und startet schnell.

## 07 Nicht im MVP (bewusst ausgeklammert)

- Login, Sync zwischen Geräten, Konten
- KI-Stimmen (MP3), Hintergrund-Wiedergabe bei gesperrtem Bildschirm
- Vollständiger Offline-Modus für alle Artikel
- Quiz, Streaks, Push-Benachrichtigungen
- Kommentare, Teilen-Funktionen außer dem System-Teilen-Dialog
- Weitere Kategorien über die zwei Startkategorien hinaus

## 08 Screens

| Screen | Zweck |
|---|---|
| Onboarding (3 Schritte) | Sprache, Kategorien & Priorität, Standardlänge |
| Entdecken | Gewichteter Feed mit Längen-Umschalter |
| Artikel | Lesen und Hören, Länge wechseln, merken, Quellen |
| Merkliste | Gemerkte Artikel |
| Fortschritt | Verlauf und Kennzahlen |
| Einstellungen | Alle Präferenzen |

Navigation über eine Tab-Leiste unten: **Entdecken · Merkliste · Fortschritt · Einstellungen**.

## 09 Inhalte

- **Kategorien zum Start:** Wissenschaft & Natur, Technik & Wirtschaft
- **Startumfang:** 10 Themen (5 pro Kategorie), jeweils 4 Längen × 2 Sprachen
- **Nachschub:** wöchentlich 2 neue Themen (1 pro Kategorie) über eine geplante Aufgabe
- Regeln für Länge, Stil, Quellen und Faktencheck: siehe `CONTENT_GUIDE.md`

**Vorschlag Startthemen** (Jan kann tauschen):

| Wissenschaft & Natur | Technik & Wirtschaft |
|---|---|
| Schwarze Löcher | Wie Sprachmodelle (KI) funktionieren |
| Wie unser Immunsystem arbeitet | Inflation einfach erklärt |
| Warum wir schlafen | Wie Daten durchs Internet reisen |
| Plattentektonik und Erdbeben | Zinseszins und wie Börsen funktionieren |
| CRISPR und die Gen-Schere | Wie ein Mikrochip entsteht |

## 10 Erfolgskriterien

- Alle 10 Startthemen sind live, in 4 Längen und 2 Sprachen.
- Vorlesen funktioniert auf Jans iPhone und mindestens einem Android-Gerät.
- Die App ist auf dem Homescreen installierbar und lädt in unter 2 Sekunden (nach dem ersten Besuch).
- Die wöchentliche Aufgabe liefert 4 Wochen in Folge fehlerfrei neue Artikel.
- Jan nutzt die App mindestens 3× pro Woche, über einen Monat.

## 11 Rahmenbedingungen & Risiken

| Risiko | Umgang |
|---|---|
| Qualität der Gerätestimme schwankt (v. a. Android) | Stimmauswahl anbieten; später optional MP3 mit KI-Stimme |
| iOS stoppt Sprachausgabe bei gesperrtem Bildschirm | Bekannte Einschränkung im MVP; Lösung über MP3 in Phase 2 |
| Fehler in KI-geschriebenen Artikeln | Faktencheck-Pflicht und Quellenangaben laut CONTENT_GUIDE |
| Urheberrecht | Nur eigene Texte, nichts kopieren, Quellen verlinken |
| Daten gehen beim Löschen der Browserdaten verloren | Hinweis in den Einstellungen; später Export/Import |
| Rechtliches bei öffentlicher Nutzung | Aktuell privat; vor öffentlicher Bewerbung Impressum und Datenschutzerklärung prüfen |

## 12 Roadmap

1. ✅ Konzept & Entscheidungen
2. ✅ Grundlagen-Dokumente (CLAUDE.md, PRD, Design System, Architecture, Content Guide)
3. Klickbarer Design-Entwurf der Kern-Screens
4. Grundgerüst der PWA mit 1 Beispielthema, live auf GitHub Pages
5. 10 Startthemen
6. Test auf Jans Smartphone, Feedback einarbeiten
7. Wöchentliche geplante Aufgabe einrichten
8. Später: KI-Stimmen, Offline-Modus, Quiz, Export/Import, weitere Kategorien
