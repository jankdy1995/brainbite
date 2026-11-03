# Content Guide – Brainbite

Regeln für jeden Artikel. Verbindlich für alle, die Inhalte erstellen oder ändern, insbesondere für die wöchentliche geplante Aufgabe.

---

## 01 Grundsatz

Ein Brainbite-Artikel erklärt **ein** Thema so, dass man es in der gewählten Zeit wirklich versteht. Er ist korrekt, in eigenen Worten geschrieben, angenehm zu lesen **und** zu hören.

## 02 Längen & Wortzahlen

Jede Länge ist ein **eigenständiger Text**, keine gekürzte Fassung des längeren. Die 5-Minuten-Version ist eine kompakte Erklärung; die 20-Minuten-Version geht in die Tiefe, mit Geschichte, Mechanismen, Beispielen und offenen Fragen.

| Länge | DE Ziel (Toleranz ±10 %) | EN Ziel (Toleranz ±10 %) | Abschnitte |
|---|---|---|---|
| 5 Min | 1.000 (900–1.100) | 1.150 (1.035–1.265) | 3 |
| 10 Min | 2.000 (1.800–2.200) | 2.300 (2.070–2.530) | 4–5 |
| 15 Min | 3.000 (2.700–3.300) | 3.450 (3.105–3.795) | 5–6 |
| 20 Min | 4.000 (3.600–4.400) | 4.600 (4.140–5.060) | 6–8 |

Grundlage: ca. 200 Wörter pro Minute Lesetempo auf Deutsch, ca. 230 auf Englisch. Gezählt werden Überschriften, Absätze und „Das Wichtigste in Kürze“.

## 03 Aufbau

1. **Einstieg** (1 Absatz, ohne Überschrift): eine Frage, ein überraschender Fakt oder eine Alltagssituation, die neugierig macht.
2. **Abschnitte** mit kurzen, aussagekräftigen Zwischenüberschriften, von einfach zu komplex.
3. **„Das Wichtigste in Kürze“ / „Key takeaways“:** genau 3 Punkte, je ein Satz.

Absätze: 3–6 Sätze. Sätze: im Schnitt unter 20 Wörtern.

## 04 Stil & Ton

- **Deutsch:** Du-Form, freundlich, klar, wie eine kluge Freundin, die etwas erklärt. **Englisch:** gleicher Ton, natürliches Englisch.
- Fachbegriffe beim ersten Auftreten in einem Halbsatz erklären.
- Konkrete Beispiele und Vergleiche aus dem Alltag.
- Kein Füllstoff, keine Floskeln („In der heutigen schnelllebigen Welt …“), keine Übertreibungen.
- Neutral bei umstrittenen Themen: Positionen fair darstellen, keine eigene Meinung.

## 05 Fürs Vorlesen schreiben

Jeder Text wird auch von einer Gerätestimme gelesen. Deshalb:
- **Keine** Tabellen, Listen im Fließtext, Emojis, Fußnoten, URLs oder Formeln im Artikeltext.
- Abkürzungen ausschreiben („zum Beispiel“ statt „z. B.“, „ungefähr“ statt „ca.“). Ausnahme: gängige Akronyme wie DNA, KI, NASA.
- Zahlen sprechbar schreiben: „rund 150 Millionen Kilometer“ statt „1,5 × 10⁸ km“.
- Wenig Klammern; Einschübe lieber als eigenen Satz.
- Einheiten ausschreiben („Grad Celsius“, „Kilometer pro Stunde“).

## 06 Recherche & Quellen

- Mindestens **3 seriöse Quellen** pro Thema, davon mindestens 2 außerhalb von Wikipedia.
- Bevorzugt: Universitäten und Forschungsinstitute (z. B. Max-Planck, Helmholtz, NASA, ESA), Behörden und Statistikämter (Destatis, Bundesbank, EZB), Fachgesellschaften, Übersichtsarbeiten, Qualitätsjournalismus mit Wissenschaftsressort.
- Wikipedia ist als Einstieg erlaubt, aber nie die einzige Quelle für eine Zahl.
- Jede Quelle mit Titel, Herausgeber, URL und Abrufdatum in `sources` eintragen.

## 07 Urheberrecht (nicht verhandelbar)

- **Nie Text kopieren** oder eng umformulieren. Quellen lesen, verstehen, dann komplett in eigenen Worten schreiben.
- Struktur und Reihenfolge einer einzelnen Quelle nicht nachbauen.
- Zitate nur, wenn der Wortlaut selbst wichtig ist: höchstens ein kurzes Zitat (unter 15 Wörtern) pro Artikel, mit Namen.
- Keine Bilder im MVP.

## 08 Faktencheck

- Jede Zahl, jedes Datum, jeder Name und jede Kausalbehauptung ist durch mindestens eine Quelle gedeckt.
- Widersprechen sich Quellen: die seriösere nehmen oder die Spanne nennen („Schätzungen liegen zwischen …“).
- Unsicheres weglassen statt raten.
- Zeitabhängige Fakten (Rekorde, Preise, „aktuell“) vermeiden oder mit „Stand: Monat Jahr“ versehen. **Zeitlose Themen bevorzugen.**
- Kein medizinischer, rechtlicher oder Finanzrat. Erklären ja, Empfehlungen für Einzelne nein.
- `factCheckedAt` auf das Prüfdatum setzen.

## 09 Zweisprachigkeit

- Die englische Fassung ist **keine wörtliche Übersetzung**, sondern eine natürliche englische Fassung mit denselben Fakten und demselben Aufbau.
- Beispiele dürfen angepasst werden (z. B. Meilen-Vergleich ergänzen), Fakten nicht.
- Titel und Teaser in beiden Sprachen in `index.json`.

## 10 Themenwahl

- Zeitlos, interessant, in 5 **und** 20 Minuten sinnvoll erklärbar.
- Vor einem neuen Thema `content/index.json` prüfen: keine Dopplungen, keine zu ähnlichen Themen kurz hintereinander.
- Kategorien abwechseln; wöchentlich **1 Thema pro Kategorie**.
- Heikle Themen (Politik, Religion, Krankheiten im Detail) meiden oder sehr neutral halten.

**Wissenschaft & Natur:** Physik, Astronomie, Chemie, Biologie, Medizin-Grundlagen, Erde & Klima, Tiere & Pflanzen, Gehirn.
**Technik & Wirtschaft:** Informatik & KI, Internet, Energie, Ingenieurwesen, Volkswirtschaft, Geld & Finanzen (erklärend), Unternehmen & Märkte, Erfindungen.

## 11 Titel, Teaser, IDs

- **Titel:** kurz (max. ca. 40 Zeichen), konkret: „Warum wir schlafen“, nicht „Schlaf – ein Überblick“.
- **Teaser:** 1 Satz, max. ca. 120 Zeichen, weckt Neugier, verrät nicht alles.
- **ID:** englisch, kleingeschrieben, mit Bindestrichen (`black-holes`), dauerhaft unveränderlich.
- **Tags:** 2–4 Stück, deutsch, kleingeschrieben.

## 12 Dateiformat

Siehe `docs/ARCHITECTURE.md`, Abschnitt 04. Kurz: pro Thema `content/topics/<id>.de.json` und `<id>.en.json` mit allen vier Längen; Metadaten und Wortzahlen in `content/index.json`. Nur reiner Text, kein HTML oder Markdown.

## 13 Checkliste vor dem Commit

- [ ] Thema nicht doppelt, Kategorie passt
- [ ] 4 Längen × 2 Sprachen vorhanden, Wortzahlen in der Toleranz
- [ ] Aufbau: Einstieg, Abschnitte, genau 3 Kernpunkte
- [ ] Vorlese-tauglich (keine Abkürzungen, Listen, Formeln, URLs im Text)
- [ ] ≥ 3 Quellen, davon ≥ 2 außerhalb Wikipedia, alle Felder ausgefüllt
- [ ] Alle Fakten geprüft, `factCheckedAt` gesetzt
- [ ] Eigene Worte, nichts kopiert
- [ ] `index.json` ergänzt (Titel, Teaser, Wortzahlen DE/EN, `publishedAt`)
- [ ] `node scripts/validate-content.mjs` ist grün
