// Todolist-Push: verschickt die Push-Nachrichten der Todolist.
// Läuft alle 15 Minuten bei GitHub (.github/workflows/push.yml).
//
// Liest aus der Datenbank:  erlaubt/, aufgaben/, geraete/
// Merkt sich Verschicktes:  push/gesendet/<kind>/<id>  (nur für dieses Skript,
//                           die Datenbankregeln sperren es für alle Apps)
//
// Zugang: Dienstkonto-Schlüssel von Firebase, als GitHub-Secret
// FIREBASE_SERVICE_ACCOUNT (Inhalt der JSON-Datei). Lokal zum Testen:
// FIREBASE_SERVICE_ACCOUNT_DATEI=<Pfad> node sende.mjs --probe
//   --probe  zeigt nur an, was verschickt würde, und schreibt nichts.
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";

const DB_URL = "https://todolist-sitech-default-rtdb.europe-west1.firebasedatabase.app";
const PROBE = process.argv.includes("--probe");
// Ereignisse, die älter sind, werden nicht mehr gemeldet (z. B. beim ersten
// Lauf oder wenn GitHub lange ausgesetzt hat).
const HOECHSTENS_ALT = 3 * 3600000;

const zugang = process.env.FIREBASE_SERVICE_ACCOUNT
  || (process.env.FIREBASE_SERVICE_ACCOUNT_DATEI && readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_DATEI, "utf8"));
if (!zugang) { console.error("Kein Dienstkonto-Schlüssel (FIREBASE_SERVICE_ACCOUNT)."); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(zugang)), databaseURL: DB_URL });
const db = getDatabase();

// ---------- Zeit in Deutschland (GitHub rechnet in UTC) ----------
const TZ = "Europe/Berlin";
function berlinTeile(ms) {
  const t = {};
  for (const p of new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(ms)) t[p.type] = p.value;
  return t;
}
const versatz = (ms) => { const t = berlinTeile(ms); return Date.UTC(+t.year, +t.month - 1, +t.day, +t.hour, +t.minute) - Math.floor(ms / 60000) * 60000; };
function berlinZeitpunkt(datum, uhrzeit) {
  const [y, m, d] = datum.split("-").map(Number);
  const [h, mi] = (uhrzeit || "00:00").split(":").map(Number);
  const roh = Date.UTC(y, m - 1, d, h, mi);
  let ms = roh - versatz(roh);
  const v2 = versatz(ms);
  if (roh - v2 !== ms) ms = roh - v2;
  return ms;
}
const berlinDatum = (ms) => { const t = berlinTeile(ms); return `${t.year}-${t.month}-${t.day}`; };

const ART = { hausaufgabe: "📚", test: "📝", aufgabe: "🏠", termin: "🗓️" };
const EINGETRAGEN = { hausaufgabe: "eine Hausaufgabe", test: "einen Test", aufgabe: "eine Aufgabe", termin: "einen Termin" };
const WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
function wannText(a, jetzt) {
  if (!a.faellig) return "";
  const heute = berlinDatum(jetzt), morgen = berlinDatum(jetzt + 86400000);
  const [y, m, d] = a.faellig.split("-").map(Number);
  let t = a.faellig === heute ? "heute" : a.faellig === morgen ? "morgen"
    : `${WT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.`;
  if (a.uhrzeit) t += ` um ${a.uhrzeit}`;
  return t;
}
const zeile = (a) => `${ART[a.art] || "🏠"} ${a.titel}`;

// ---------- Daten holen ----------
const lies = async (p) => (await db.ref(p).get()).val() || {};
const [erlaubt, aufgaben, geraete, gesendet] = await Promise.all(["erlaubt", "aufgaben", "geraete", "push/gesendet"].map(lies));
const jetzt = Date.now();
const nachrichten = []; // { an: [personKey…] | "eltern", titel, text, tag }
const merken = {};      // Pfad unter push/gesendet → Wert

for (const [kind, liste] of Object.entries(aufgaben)) {
  if (!erlaubt[kind]) continue; // entferntes Kind: nichts mehr schicken
  const name = erlaubt[kind].name || "Kind";
  for (const [id, a] of Object.entries(liste || {})) {
    const g = (gesendet[kind] || {})[id] || {};
    const pfad = `${kind}/${id}`;

    // 1) Erinnerung ans Kind (gleiche Rechnung wie erinnerungenPruefen() in der App)
    if (!a.erledigt && a.faellig && a.erinnerung >= 0) {
      const faellig = berlinZeitpunkt(a.faellig, a.uhrzeit);
      const an = faellig - a.erinnerung * 60000;
      const ende = faellig + (a.uhrzeit ? 0 : 86400000);
      if (jetzt >= an && jetzt <= ende && g.erinnert !== an) {
        nachrichten.push({ an: [kind], titel: "🔔 Erinnerung", text: `${zeile(a)} – ${wannText(a, jetzt)}`, tag: "erinnerung-" + id });
        merken[`${pfad}/erinnert`] = an;
      }
    }
    // 2) Neue Aufgabe von den Eltern ans Kind
    if (a.von === "eltern" && !a.erledigt && !g.neu && a.erstellt && jetzt - a.erstellt <= HOECHSTENS_ALT) {
      nachrichten.push({ an: [kind], titel: "📌 Neue Aufgabe", text: zeile(a) + (a.faellig ? ` – bis ${wannText(a, jetzt)}` : ""), tag: "neu-" + id });
      merken[`${pfad}/neu`] = true;
    }
    // 3) Kind hat erledigt → Eltern
    if (a.erledigt && a.erledigtAm && g.erledigt !== a.erledigtAm && jetzt - a.erledigtAm <= HOECHSTENS_ALT) {
      nachrichten.push({ an: "eltern", titel: `✅ ${name} hat erledigt`, text: zeile(a), tag: "erledigt-" + id });
      merken[`${pfad}/erledigt`] = a.erledigtAm;
    }
    // 4) Kind hat selbst etwas eingetragen (Test, Hausaufgabe, Termin …) → Eltern
    if (a.von === "kind" && !g.eingetragen && a.erstellt && jetzt - a.erstellt <= HOECHSTENS_ALT) {
      const was = EINGETRAGEN[a.art] || "etwas";
      nachrichten.push({ an: "eltern", titel: `${ART[a.art] || "📌"} ${name} hat ${was} eingetragen`, text: a.titel + (a.faellig ? ` – ${wannText(a, jetzt)}` : ""), tag: "eingetragen-" + id });
      merken[`${pfad}/eingetragen`] = true;
    }
  }
}

// Einträge gelöschter Aufgaben aus dem Sendeplan entfernen
for (const [kind, ids] of Object.entries(gesendet)) {
  for (const id of Object.keys(ids || {})) if (!(aufgaben[kind] || {})[id]) merken[`${kind}/${id}`] = null;
}

// ---------- Verschicken ----------
function empfaenger(an) {
  const liste = [];
  for (const [person, geraeteVon] of Object.entries(geraete)) {
    for (const [gid, gr] of Object.entries(geraeteVon || {})) {
      if (an === "eltern" ? gr.rolle === "eltern" : an.includes(person) && gr.rolle === "kind") liste.push({ person, gid, token: gr.token });
    }
  }
  return liste;
}
const messaging = getMessaging();
const kaputt = {};
let verschickt = 0;
for (const n of nachrichten) {
  const ziele = empfaenger(n.an);
  console.log(`${PROBE ? "PROBE " : ""}${n.titel} | ${n.text} → ${ziele.length} Gerät(e)`);
  if (PROBE) continue;
  for (const z of ziele) {
    try {
      await messaging.send({
        token: z.token,
        data: { titel: n.titel, text: n.text, tag: n.tag },
        webpush: { headers: { Urgency: "high", TTL: "86400" } },
        apns: { headers: { "apns-priority": "10" } }
      });
      verschickt++;
    } catch (e) {
      const code = e.code || e.errorInfo?.code || "";
      console.warn("  nicht zugestellt:", z.person, code || e.message);
      // Gerät gibt es nicht mehr (App gelöscht, Erlaubnis entzogen) → Adresse entfernen
      if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) kaputt[`${z.person}/${z.gid}`] = null;
    }
  }
}

if (!PROBE) {
  if (Object.keys(merken).length) await db.ref("push/gesendet").update(merken);
  if (Object.keys(kaputt).length) await db.ref("geraete").update(kaputt);
  await db.ref("push/letzterLauf").set(jetzt);
}
console.log(`${nachrichten.length} Nachricht(en), ${verschickt} zugestellt, ${Object.keys(kaputt).length} alte Geräte entfernt.`);
process.exit(0);
