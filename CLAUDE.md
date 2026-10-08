# Todolist-Push

Verschickt die Push-Nachrichten der **Todolist** (`..\Todolist`). Ein einziges
Skript `sende.mjs`, das bei GitHub alle 15 Minuten läuft
(`.github/workflows/push.yml`). Die App selbst speichert nur die
Geräte-Adressen – Aufbau und Datenbereiche stehen in `..\Todolist\CLAUDE.md`.

**Das GitHub-Projekt ist öffentlich** (sonst reichen die Freiminuten nicht).
Deshalb: keine Mailadressen, Namen oder Schlüssel in die Dateien. Der
Zugang kommt ausschließlich aus dem GitHub-Secret.

## Was verschickt wird

| An | Wann |
|---|---|
| Kind | Erinnerung vor Test/Hausaufgabe/Aufgabe (Feld `erinnerung`, gleiche Rechnung wie `erinnerungenPruefen()` in der App) |
| Kind | neue Aufgabe von den Eltern (`von: eltern`) |
| Eltern | Kind hat etwas erledigt (`erledigtAm`) |
| Eltern | Kind hat selbst etwas eingetragen – Test, Hausaufgabe oder Termin (seit 08.10.2026; vorher nur Tests) |

Neu/erledigt/eingetragen wird nur gemeldet, wenn es höchstens 3 Stunden her
ist (erster Lauf, GitHub-Aussetzer). Verschicktes merkt sich das Skript unter
`push/gesendet/` in der Datenbank. Geräte, die Firebase als ungültig meldet,
werden aus `geraete/` entfernt.

## Einrichtung (einmalig, 26.09.2026)

1. Firebase → Projekteinstellungen → **Dienstkonten** → „Neuen privaten
   Schlüssel generieren“ → JSON-Datei. **Nie ins Git, nie in den Chat.**
2. GitHub-Projekt `todolist-push` (öffentlich), diese Dateien hochladen.
3. GitHub → Settings → Secrets and variables → Actions → **New repository
   secret** `FIREBASE_SERVICE_ACCOUNT` = kompletter Inhalt der JSON-Datei.
4. Actions → „Push-Nachrichten“ → **Run workflow** zum ersten Test.

## Befehle

| Was | Wie |
|---|---|
| Probelauf lokal (schickt nichts, schreibt nichts) | `set FIREBASE_SERVICE_ACCOUNT_DATEI=<Pfad zur JSON>` dann `npm run probe` |
| Von Hand auslösen | GitHub → Actions → Push-Nachrichten → Run workflow |
| Läuft es? | Datenbank `push/letzterLauf` (Zeitstempel) bzw. GitHub → Actions |

## Fallen

- GitHub schaltet Zeitpläne nach **60 Tagen ohne Änderung** ab. Der Schritt
  „Wachhalten“ im Workflow schaltet ihn bei jedem Lauf wieder ein. Kommt
  trotzdem eine Mail „scheduled workflow disabled“: Actions → Enable workflow.
- GitHub startet `*/15` oft einige Minuten später, bei viel Last auch mal
  ausgelassen. Für Erinnerungen reicht das; auf die Minute genau ist es nicht.
- Jede Push-Nachricht muss am Gerät sichtbar angezeigt werden (macht `sw.js`
  der Todolist) – sonst entzieht Safari am iPhone die Erlaubnis.
