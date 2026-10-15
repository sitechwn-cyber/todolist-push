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
| `gebetszeiten.js` | Rechenkern: Gebetszeiten aus dem Sonnenstand, Kıble, Zeitzonen-Hilfen. Läuft im Browser **und** bei GitHub – eine Quelle, dieselben Zeiten |
| `app.js`, `index.html`, `app.css` | Oberfläche (4 Tabs: Zeiten, Kıble, Tracker, Mehr) |
| `config.js` | Firebase-Web-Konfiguration + VAPID-Schlüssel (öffentlich, leer = kein Push) |
| `sw.js` | Offline-Speicher + Push-Nachrichten anzeigen |
| `plane-push.mjs` | Entscheidet, wer wann welche Erinnerung bekommt (reine Funktion) |
| `sende.mjs` | Liest `geraete/`, verschickt per Firebase Cloud Messaging, merkt Verschicktes |
| `.github/workflows/push.yml` | Startet `sende.mjs` alle 5 Minuten (+ von Hand) |
| `database.rules.json` | Datenbankregeln: Geräte dürfen nur ihren eigenen Eintrag schreiben, niemand liest |
| `test.mjs` | `npm test` prüft Zeiten, Kıble und Versandplanung |

## Gebetszeiten (Diyanet-Art wie Semerkand)

Die Zeiten werden aus dem Sonnenstand berechnet (kein Internet, keine API): İmsak 18°, Yatsı 17°,
İkindi einfacher Schatten, Güneş/Akşam bei 0,833°, dazu feste Korrekturminuten (`DIYANET_MINUTEN`:
Güneş −7, Öğle +6, İkindi +5, Akşam +9, Yatsı +2). Im Sommer erreicht die Dämmerung in Deutschland den
Winkel nicht → die Nacht wird nach Winkel/60 aufgeteilt („angle based“).

**Stand des Abgleichs (15.10.2026):** Die Minutenwerte sind auf eine echte Wochentabelle abgestimmt
(İstanbul, 15.–21.10.2026, Datei `namaz-vakitleri-haftalik.xls` vom Nutzer): alle 42 Werte stimmen auf
±1 Minute, geprüft in `test.mjs`. **Noch nicht geprüft:** deutsche Orte (z. B. Waiblingen), Sommer und
Winter. Ob die Tabelle von Semerkand oder von der Diyanet stammt, ist offen – die Quelle der
Semerkand-App selbst ist nicht belegt. Nächster Abgleich: eine Woche für Waiblingen (Sommer und Winter)
in Semerkand ansehen, in `test.mjs` ergänzen und bei Abweichung die Minuten/Sommerregel anpassen.
Pro Gerät lässt sich nachstellen unter *Mehr → Zeiten feinabstimmen*.

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
- Zeitplan und Gebetszeiten rechnen mit der Zeitzone des gewählten Ortes (`zone`), nicht des Geräts.
