# ARCHITECTURE – Todolist-Push

Aufbau und Absicht hinter dem Versand der Push-Nachrichten. Befehle, Fallen
und die Einrichtung stehen in der `CLAUDE.md` – hier steht, *warum* es so
gebaut ist.

---

## 1 Was ist im System

Ein einziges Skript, das im Takt läuft und Nachrichten verschickt. Mehr
nicht – es gibt keine Oberfläche, keinen Server, keine eigene Datenbank.

| Teil | Was er ist |
|---|---|
| `sende.mjs` | das ganze Programm: liest die Datenbank, entscheidet was fällig ist, verschickt, merkt sich Verschicktes |
| `.github/workflows/push.yml` | der Wecker: startet `sende.mjs` alle 15 Minuten bei GitHub und hält den Zeitplan wach |
| `package.json` | eine einzige Abhängigkeit: `firebase-admin` |
| `dienstkonto.json` | der private Schlüssel **nur lokal zum Probelauf** – durch `.gitignore` (`*.json` mit Ausnahmen) vom Git ausgeschlossen |

Die Daten gehören nicht diesem Projekt, sondern der App nebenan
(`..\Todolist`): Datenbank `todolist-sitech` in der Region europe-west1, mit
den Bereichen `erlaubt/`, `aufgaben/`, `geraete/` und `push/`.

## 2 Wer ist wofür zuständig

| Zuständigkeit | Besitzer |
|---|---|
| Aufgaben, Kinder, Geräteadressen anlegen und ändern | die App `..\Todolist` – dieses Projekt schreibt dort **nie** hinein |
| entscheiden, welche Nachricht fällig ist | die vier Regelblöcke in der Schleife in `sende.mjs` |
| Doppelversand verhindern | `push/gesendet/<kind>/<id>` in der Datenbank – nur dieses Skript darf dort schreiben |
| tote Geräteadressen entfernen | `sende.mjs`, anhand der Fehlercodes von Firebase |
| Zeitrechnung in deutscher Zeit | die drei Hilfsfunktionen `berlinTeile`, `versatz`, `berlinZeitpunkt` |
| den Takt halten | `push.yml` (Zeitplan + Schritt „Wachhalten") |
| den Zugang liefern | das GitHub-Secret `FIREBASE_SERVICE_ACCOUNT` – sonst nichts und niemand |
| „läuft es noch?" beantworten | `push/letzterLauf` in der Datenbank |

## 3 Warum ist es so gebaut

- **Eigenes Projekt statt Teil der Todolist.** Die App läuft im Browser, ein
  Browser kann keinen Zeitplan halten und darf den Dienstkonto-Schlüssel
  niemals sehen. Versand und Oberfläche müssen deshalb getrennt sein.
- **GitHub Actions statt Firebase Cloud Functions.** Cloud Functions
  verlangen den Bezahlplan mit Kreditkarte. GitHub reicht für einen
  15-Minuten-Takt und kostet nichts.
- **Das GitHub-Projekt ist öffentlich.** Nur so reichen die Freiminuten.
  Genau daraus folgt die härteste Regel des Projekts: keine Namen, keine
  Mailadressen, keine Schlüssel in den Dateien.
- **Ein Skript statt Module.** Rund 150 Zeilen. Jede Aufteilung würde mehr
  Dateien erzeugen als Verständnis.
- **Zeitrechnung von Hand.** GitHub rechnet in UTC, die Familie lebt in
  deutscher Zeit mit Sommer-/Winterumstellung. Deshalb wird die Fälligkeit
  ausdrücklich in `Europe/Berlin` umgerechnet und nicht der Serverzeit
  überlassen.
- **Drei-Stunden-Grenze für Neuigkeiten.** Beim ersten Lauf oder nach einem
  GitHub-Aussetzer soll nicht die halbe Woche auf einmal aufs Handy fallen.
  Erinnerungen haben diese Grenze bewusst **nicht** – die haben ihr eigenes
  Zeitfenster.
- **Verschicktes wird in der Datenbank vermerkt, nicht im Projekt.** Jeder
  Lauf startet auf einem frischen GitHub-Rechner; ein Gedächtnis auf der
  Festplatte gäbe es nicht.

## 4 Was darf was anfassen

Erlaubte Richtung:

```
Todolist-App  ──schreibt──►  aufgaben/ erlaubt/ geraete/
                                   │ (nur lesen)
                                   ▼
                              sende.mjs  ──schreibt──►  push/gesendet, push/letzterLauf
                                   │                    geraete/<person>/<gid> (nur löschen)
                                   ▼
                               Firebase Messaging  ──►  Handys
```

- `sende.mjs` **liest** `erlaubt/`, `aufgaben/`, `geraete/`.
- `sende.mjs` **schreibt** ausschließlich unter `push/` – plus das Entfernen
  toter Geräteeinträge unter `geraete/`.
- **Verboten:**
  - eine Aufgabe ändern, erledigen oder löschen (das macht der Mensch in der App)
  - `erlaubt/` anfassen – wer dazugehört, entscheidet die App
  - den Schlüssel irgendwo anders herbekommen als aus der Umgebung
    (`FIREBASE_SERVICE_ACCOUNT`), erst recht nicht aus einer Datei im Git
  - Namen, Mailadressen oder Telefonnummern in eine Datei dieses Projekts
    schreiben – das Projekt ist öffentlich einsehbar
  - aus der App heraus unter `push/` schreiben; die Datenbankregeln sperren
    das für alle Apps

## 5 Wie fließen die Daten

**Der normale Lauf (alle 15 Minuten)**

1. GitHub startet `push.yml`, holt die Dateien, installiert `firebase-admin`.
2. `sende.mjs` startet, nimmt den Schlüssel aus `FIREBASE_SERVICE_ACCOUNT`.
   Fehlt er, bricht es sofort ab – lieber nichts als halb.
3. Es liest in einem Rutsch `erlaubt/`, `aufgaben/`, `geraete/` und
   `push/gesendet`.
4. Für jedes Kind und jede Aufgabe prüft es vier Fälle:
   Erinnerung fällig · neue Aufgabe von den Eltern · vom Kind erledigt ·
   vom Kind ein Test eingetragen. Jeder Treffer wird gesammelt, zusammen mit
   dem Vermerk, der ihn künftig verhindert.
5. Einträge zu gelöschten Aufgaben werden aus `push/gesendet` geräumt.
6. Erst jetzt wird verschickt: je Nachricht alle passenden Geräte
   (`rolle: kind` beim betroffenen Kind, `rolle: eltern` für die Eltern).
7. Meldet Firebase eine Adresse als ungültig, wird sie vorgemerkt.
8. Am Ende, in einem Schwung: Vermerke speichern, tote Geräte entfernen,
   `push/letzterLauf` setzen.

**Der Probelauf** (`npm run probe`) geht denselben Weg bis Schritt 6, zeigt
nur an, was verschickt würde, und schreibt nichts.

**Beim Kind** nimmt der Service Worker der Todolist (`sw.js`) die Nachricht
entgegen und zeigt sie an.

## 6 Was darf nie kaputtgehen

- **Kein Schlüssel und keine Person in den Dateien.** Das Projekt ist
  öffentlich. Ein einmal veröffentlichter Dienstkonto-Schlüssel gibt
  Fremden vollen Zugriff auf die Datenbank und muss bei Firebase sofort
  zurückgezogen werden.
- **Kein Doppelversand.** Die Vermerke unter `push/gesendet` sind die einzige
  Bremse. Wer sie beim Umbauen übergeht, beschießt die Familie bei jedem Lauf
  aufs Neue mit denselben Nachrichten.
- **`sende.mjs` fasst keine Aufgabe an.** Ein Versandskript, das Daten der
  App ändert, zerstört Vertrauen in die App selbst.
- **Jede Push-Nachricht muss am Gerät sichtbar angezeigt werden** (macht der
  Service Worker der Todolist). Stille Nachrichten entzieht Safari am iPhone
  die Erlaubnis – danach kommt gar nichts mehr an.
- **Der Zeitplan darf nicht einschlafen.** GitHub schaltet ihn nach 60 Tagen
  ohne Änderung ab; der Schritt „Wachhalten" verhindert das. Kommt trotzdem
  die Mail „scheduled workflow disabled": Actions → Enable workflow.
- **Ein einzelnes kaputtes Gerät darf den Lauf nicht abbrechen** – deshalb
  steht der Versand je Gerät in `try/catch`.

## 7 Wo gehört neuer Code hin

| Vorhaben | Ort |
|---|---|
| neue Art von Nachricht | ein weiterer Block in der Schleife über die Aufgaben, mit **eigenem** Vermerk in `merken[…]` |
| anderer Text/anderes Symbol | `ART`, `zeile()`, `wannText()` – nicht mitten im Regelblock |
| anderer Takt | `cron` in `push.yml` |
| neuer Empfängerkreis (z. B. Großeltern) | `empfaenger()` – und die Rolle muss die App beim Anmelden des Geräts setzen |
| etwas, das die App wissen muss | **nicht hier** – das gehört in `..\Todolist` |
| neue Abhängigkeit | `package.json`; jede weitere kostet Startzeit bei jedem Lauf |

## 8 Wann stoppt Claude und fragt

Claude ändert nichts selbständig und fragt zuerst, wenn:

- eine Änderung dazu führen könnte, dass **Nachrichten doppelt** oder an die
  **falsche Person** gehen
- etwas außerhalb von `push/` **geschrieben** werden soll
- ein **Name, eine Nummer oder ein Schlüssel** in eine Datei wandern würde –
  das Projekt ist öffentlich
- der **Takt enger** als 15 Minuten werden soll (GitHub-Freiminuten)
- die **Datenbankregeln** angefasst werden müssten
- ein Verhalten geändert wird, das die App genauso rechnet
  (`erinnerungenPruefen()`) – dann müssen beide Seiten zusammen geändert werden

Wenn Claude stoppt: den Konflikt benennen, zeigen was passiert wenn man es
so macht, und die kleinste Lösung vorschlagen.
