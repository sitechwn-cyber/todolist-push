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
| Kind | Nachricht der Eltern (`nachrichten/<kind>/<id>`, Merkzettel `push/nachrichten`, seit 08.10.2026) |
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

## Cloudflare-Wecker (seit 08.10.2026): Versand jede Minute

GitHub startet den 15-Minuten-Takt unzuverlässig. Deshalb stößt ein kostenloser
**Cloudflare Worker** (`cloudflare/worker.js`, Name `todolist-wecker`, Cron jede
Minute) den Workflow per `workflow_dispatch` an – Mitteilungen kommen damit nach
etwa 1–2 Minuten. Der 15-Minuten-Zeitplan bleibt als Rückfall. `concurrency: push`
im Workflow verhindert doppelte Läufe.

- **Der Datenbank-Schlüssel bleibt bei GitHub.** Cloudflare kennt nur das Secret
  `GITHUB_TOKEN`: ein *fine-grained* GitHub-Schlüssel nur für `todolist-push`, nur
  Recht „Actions: Read and write“. Läuft er ab, neuen anlegen und mit
  `CLOUDFLARE-EINRICHTEN.bat` (Schritt 3) bzw. `npx wrangler secret put GITHUB_TOKEN`
  im Ordner `cloudflare` eintragen.
- **Eingerichtet am 08.10.2026 über das Cloudflare-Dashboard** (Konto sitechwn): Worker
  `todolist-wecker` (https://todolist-wecker.sitechwn.workers.dev zeigt nur „läuft“),
  Cron „Every minute“. Im Dashboard steht eine einzeilige Fassung von `worker.js`
  (Repo fest eingetragen) – inhaltlich gleich; bei Änderungen beide angleichen.
  Secret `GITHUB_TOKEN`: Settings → Variables and secrets → Add → Typ *Secret*.
- Alternativ per Kommandozeile: `CLOUDFLARE-EINRICHTEN.bat`
- **Läuft seit 08.10.2026, 12:42 Uhr.** GitHub-Schlüssel `todolist-wecker` (fine-grained, ohne Ablauf).
  Stolperstein beim Anlegen: Repository-Zugriff und Recht wurden nicht übernommen →
  Cloudflare-Log „403 Resource not accessible by personal access token“. Prüfen unter
  github.com/settings/personal-access-tokens → todolist-wecker: muss „Only select
  repositories: todolist-push“ und „Actions: Read and write“ zeigen. (Anmeldung im Browser, Hochladen,
  Schlüssel eingeben). Yasin führt sie selbst aus – Claude gibt keine Schlüssel ein.
- Läuft es? GitHub → Actions: Läufe mit „workflow_dispatch“ im Minutentakt;
  Cloudflare → Workers → todolist-wecker → Logs bei Fehlern.
