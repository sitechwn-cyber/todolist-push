// Gebets-Push: verschickt die Erinnerungen der Gebets-App (läuft bei GitHub, .github/workflows/push.yml).
//
// Liest:   geraete/        (schreibt die App: Push-Adresse, Ort, Einstellungen pro Gerät)
// Merkt:   push/gesendet/<geraeteId>/<datum>-<gebet>  (nur für dieses Skript, in den Regeln gesperrt)
// Die Entscheidungen stehen in plane-push.mjs (getestet mit test-plane.mjs).
//
// Zugang: Dienstkonto-Schlüssel von Firebase als GitHub-Secret FIREBASE_SERVICE_ACCOUNT.
// Datenbank-Adresse als GitHub-Variable/Secret FIREBASE_DATABASE_URL (oder in config.js: databaseURL).
// Lokal zum Testen: FIREBASE_SERVICE_ACCOUNT_DATEI=<Pfad> node sende.mjs --probe
//   --probe  zeigt nur an, was verschickt würde, und schreibt nichts.
// Fehlt der Schlüssel, passiert nichts (kein Fehler) – so bleibt der Ablauf grün, bis alles eingerichtet ist.
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
import { plane } from "./plane-push.mjs";
import { FIREBASE } from "./config.js";

const PROBE = process.argv.includes("--probe");
const zugang = process.env.FIREBASE_SERVICE_ACCOUNT
  || (process.env.FIREBASE_SERVICE_ACCOUNT_DATEI && readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_DATEI, "utf8"));
if (!zugang) { console.log("Gebets-Push: kein Dienstkonto-Schlüssel eingerichtet – übersprungen."); process.exit(0); }
const dbUrl = process.env.FIREBASE_DATABASE_URL || FIREBASE.databaseURL;
if (!dbUrl) { console.error("Keine Datenbank-Adresse (FIREBASE_DATABASE_URL oder config.js)."); process.exit(1); }

initializeApp({ credential: cert(JSON.parse(zugang)), databaseURL: dbUrl });
const db = getDatabase();
const lies = async (p) => (await db.ref(p).get()).val() || {};
const [geraete, gesendet] = await Promise.all(["geraete", "push/gesendet"].map(lies));
const jetzt = Date.now();
const { nachrichten, merken } = plane({ geraete, gesendet, jetzt });
// Das Protokoll ist öffentlich: nur Zahlen, keine Orte, keine Adressen.
console.log(`Geräte: ${Object.keys(geraete).length}`);

const messaging = getMessaging();
const kaputt = {};
let verschickt = 0;
for (const n of nachrichten) {
  console.log(`${PROBE ? "PROBE " : ""}${n.titel} | ${n.text}`);
  if (PROBE) continue;
  try {
    await messaging.send({
      token: n.token,
      data: { titel: n.titel, text: n.text, tag: n.tag },
      webpush: { headers: { Urgency: "high", TTL: "1800" } },
      apns: { headers: { "apns-priority": "10" } },
    });
    verschickt++;
  } catch (e) {
    const code = e.code || e.errorInfo?.code || "";
    console.warn("  nicht zugestellt:", code || e.message);
    // Gerät gibt es nicht mehr (App gelöscht, Erlaubnis entzogen) → Adresse entfernen
    if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) kaputt[n.id] = null;
  }
}

if (!PROBE) {
  if (Object.keys(merken).length) await db.ref("push/gesendet").update(merken);
  if (Object.keys(kaputt).length) await db.ref("geraete").update(kaputt);
  await db.ref("push/letzterLauf").set(jetzt);
}
console.log(`${nachrichten.length} Nachricht(en), ${verschickt} zugestellt, ${Object.keys(kaputt).length} alte Geräte entfernt.`);
process.exit(0);
