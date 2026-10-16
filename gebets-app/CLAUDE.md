# Gebets-App

Web-App (PWA) für Gebetszeiten, nach dem Vorbild der **Semerkand**-App: İmsak, Güneş, Öğle,
İkindi, Akşam, Yatsı mit Countdown, dazu Kıble-Kompass, Erinnerungen per Push und ein
Gebets-Tracker. Kein Konto, keine Werbung, kein Build-Schritt – reine Dateien, laufen auf jedem
statischen Hosting (GitHub Pages, Cloudflare Pages, Firebase Hosting).

> **Ablageort:** liegt vorläufig als Ordner `gebets-app/` im Projekt `todolist-push`. Die Workflows
> in `.github/workflows/` laufen erst, wenn der Ordnerinhalt ein **eigenes Repo** ist (GitHub liest sie
> nur im Repo-Hauptordner). Umziehen: neues Repo `gebets-app` anlegen, Ordnerinhalt hineinkopieren.

## Aufbau

| Datei | Aufgabe |
|---|---|
| `referenz.js` | **Referenz: Diyanet-Zeiten** über `ezanvakti.emushaf.net` (Länder/Städte/Orte, Tagestabelle), `tagesZeiten()` = Referenz, sonst Berechnung |
| `gebetszeiten.js` | Rückfall-Rechenkern (Sonnenstand), Kıble, Zeitzonen-Hilfen. Läuft im Browser **und** bei GitHub |
| `app.js`, `index.html`, `app.css` | Oberfläche (4 Tabs: Zeiten, Kıble, Tracker, Mehr) |
| `config.js` | Firebase-Web-Konfiguration + VAPID-Schlüssel (öffentlich, leer = kein Push) |
| `sw.js` | Offline-Speicher + Push-Nachrichten anzeigen |
| `plane-push.mjs` | Entscheidet, wer wann welche Erinnerung bekommt (reine Funktion) |
| `sende.mjs` | Liest `geraete/`, verschickt per Firebase Cloud Messaging, merkt Verschicktes |
| `.github/workflows/push.yml` | Startet `sende.mjs` alle 5 Minuten (+ von Hand) |
| `database.rules.json` | Datenbankregeln: Geräte dürfen nur ihren eigenen Eintrag schreiben, niemand liest |
| `test.mjs` | `npm test` prüft Referenz-Lesen, Rückfall, Kıble und Versandplanung |
| `referenz-pruefen.mjs` | **Auf dem PC mit Internet ausführen:** Schnittstelle prüfen, Orte suchen (`npm run referenz -- --suche Stuttgart`), mit Tabelle vergleichen |
| `referenz/` | Echte Wochentabellen des Nutzers zum Abgleich (siehe README dort) |

## Gebetszeiten: Referenz Diyanet, Rückfall Berechnung

**Referenz (Standard, seit 16.10.2026):** In der App unter *Mehr → Diyanet-Zeiten* Land → Stadt → Ort wählen
(Deutschland ist vorgewählt). Die App holt die Tagestabelle von `https://ezanvakti.emushaf.net/vakitler/<IlceID>`
(Felder `MiladiTarihKisa`, `Imsak`, `Gunes`, `Ogle`, `Ikindi`, `Aksam`, `Yatsi`), speichert sie im Gerät (6 Std
frisch, auch offline nutzbar) und zeigt genau diese Zeiten. Auch `sende.mjs` holt dieselbe Tabelle für die
Erinnerungen (Gerät speichert `diyanet: {ilce, zone}` in `geraete/`). Persönliche Minuten (*Feinabstimmen*)
kommen immer obendrauf, Standard 0.

**Rückfall:** Fehlt der Ort, das Internet oder der Tag, rechnet `gebetszeiten.js` aus dem Sonnenstand (İmsak 18°,
Yatsı 17°, İkindi einfacher Schatten, Korrekturminuten `DIYANET_MINUTEN`: Güneş −7, Öğle +6, İkindi +5,
Akşam +9, Yatsı +2; Sommer: Nacht nach Winkel/60). Das ist nur eine Näherung: İstanbul passt auf ±1 Min
(`test.mjs`), in Süddeutschland liegt İmsak ca. 5 Min zu spät (Diyanet ≈ 18,8°) – Details unten.

### ⚠ Noch nicht gegen die echte Schnittstelle geprüft
Die Cloud-Umgebung, in der das gebaut wurde, hatte kein Internet zu `ezanvakti.emushaf.net`. Adressen, Feldnamen
und das Datumsformat sind nach bestem Wissen umgesetzt und mit einer nachgebauten Antwort getestet
(`test.mjs`, Browsertest). **Als Erstes auf dem PC prüfen:**
1. `npm run referenz -- --suche Stuttgart` (Ort und IlceID finden; Schnittstelle erreichbar?)
2. `npm run referenz -- <IlceID> referenz/deutschland-ort-unklar-2026-10-15.csv` – muss „✔ alle Werte gleich“
   melden, sonst stimmt Ort oder Datenquelle nicht.
3. Im Browser: läuft der Abruf, oder blockiert CORS die Anfrage? Dann liefert die App die berechneten Zeiten und
   zeigt „konnten nicht geladen werden“. Abhilfe: Cloudflare-Worker als Zwischenstation (siehe Projekt
   `todolist-push/cloudflare`) oder eine andere Diyanet-Quelle in `referenz.js` eintragen.
4. Ob die Tabellen des Nutzers (`referenz/`) von der Diyanet oder von Semerkand stammen, ist offen; die Semerkand-
   Seite war nicht erreichbar. Auf dem PC (Chrome mit der Seite offen) die Zeiten ablesen und mit der Schnittstelle
   vergleichen.

### Befunde zur Berechnung (Stand 16.10.2026)
- Zweite Tabelle (`referenz/deutschland-ort-unklar-2026-10-15.csv`, Süddeutschland): bester Fit 48,75° N /
  9,90° O (nicht Waiblingen; Gegend Schwäbisch Gmünd/Göppingen/Aalen), İmsak ≈ 18,8°, Yatsı 17° und die
  Korrekturminuten passen. Ort der Tabelle: **offen** (Nutzer fragen).
- Fehlt: Juni-Woche (Sommerregel) und Dezember/Januar für denselben Ort.

## Lokal ansehen

`npm start` (oder `python3 -m http.server`) und `http://localhost:3000` öffnen. Service Worker und
Push laufen nur über `localhost` oder HTTPS. Der Kompass braucht ein Handy mit Sensor und HTTPS.

## Push einrichten (einmalig, ~15 Minuten)

Ohne diese Schritte funktioniert alles außer Erinnerungen bei **geschlossener** App.

1. Firebase-Projekt anlegen (oder ein vorhandenes nehmen) → **Realtime Database** erstellen
   (Region europe-west1) → Inhalt von `database.rules.json` unter *Regeln* einfügen.
2. Projekteinstellungen → *Allgemein* → Web-App hinzufügen → Konfiguration in `config.js` eintragen.
3. Projekteinstellungen → *Cloud Messaging* → *Web-Push-Zertifikate* → Schlüsselpaar erzeugen →
   öffentlichen Schlüssel als `VAPID_KEY` in `config.js`.
4. Projekteinstellungen → *Dienstkonten* → „Neuen privaten Schlüssel generieren“ (JSON-Datei).
   **Nie ins Git, nie in den Chat.** Inhalt als GitHub-Secret `FIREBASE_SERVICE_ACCOUNT`
   (Settings → Secrets and variables → Actions → *New repository secret*) eintragen.
5. Dieselbe Seite → *Variables* → `FIREBASE_DATABASE_URL` = Datenbank-Adresse (oder `databaseURL` in
   `config.js` – dann nicht nötig).
6. Actions → „Gebets-Push“ → *Run workflow* zum ersten Test. Lokal: `FIREBASE_SERVICE_ACCOUNT_DATEI=<Pfad>
   npm run probe` (schickt nichts, schreibt nichts).
7. In der App: *Mehr → Erinnerungen einschalten*. **iPhone:** erst in Safari „Zum Home-Bildschirm“.

Läuft es? Datenbank `push/letzterLauf` (Zeitstempel) bzw. GitHub → Actions.

## Hosting

GitHub Pages (Settings → Pages → Branch `main`, Ordner `/`). Bei **privatem** Repo braucht das den
kostenpflichtigen GitHub-Plan – sonst das Repo öffentlich machen (es steht nichts Geheimes drin: die
Firebase-Web-Konfiguration ist öffentlich, Schlüssel liegen nur im GitHub-Secret) oder Cloudflare Pages /
Firebase Hosting nehmen. Bei jeder Änderung an Dateien, die der Service Worker zwischenspeichert, hilft
`VERSION` in `sw.js` hochzuzählen, falls ein Gerät hartnäckig alte Dateien zeigt (normal wird erst das Netz
gefragt).

## Fallen

- GitHub startet `*/5` oft Minuten später oder lässt aus. Erinnerungen werden bis 15 Minuten nach der
  Gebetszeit nachgeholt. Wer es genauer will: Cloudflare-Wecker wie im Projekt `todolist-push`
  (`workflow_dispatch` jede Minute).
- GitHub schaltet Zeitpläne nach **60 Tagen ohne Änderung** ab. Der Schritt „Wachhalten“ schaltet sie bei
  jedem Lauf wieder ein.
- Jede Push-Nachricht muss sichtbar angezeigt werden (macht `sw.js`), sonst entzieht Safari am iPhone die
  Erlaubnis.
- Der Ort wird auf 2 Nachkommastellen (~1 km) gerundet in `geraete/` gespeichert; die Datenbank ist für
  Besucher nicht lesbar. Das GitHub-Protokoll zeigt nur Zahlen, keine Orte.
- Die Hidschri-Zeile nutzt den Umm-al-Qura-Kalender des Browsers; die Diyanet kann um einen Tag abweichen.
- Zeitplan und Gebetszeiten rechnen mit der Zeitzone des gewählten Ortes (`zone`; beim Diyanet-Ort nach Land: Almanya → Europe/Berlin, Türkiye → Europe/Istanbul u. a., sonst Gerätezeitzone), nicht des Geräts.
- Die Hidschri-Zeile der Diyanet-Tabelle (`HicriTarihUzun`) wird noch nicht genutzt.
