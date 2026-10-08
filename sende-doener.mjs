// Döner-Push: verschickt die Push-Nachrichten der Döner-App (Firebase-Projekt tekke-55b28).
// Läuft im selben GitHub-Ablauf wie sende.mjs (.github/workflows/push.yml), jede Minute
// angestoßen vom Cloudflare-Wecker. Die Entscheidungen (wer bekommt was) stehen in
// doener-logik.mjs und werden von test-doener.mjs geprüft.
//
// Liest:   orders/, pushgeraete/doener/, staff/doener/
// Merkt:   push/gesendet/<orderId> (nur für dieses Skript, in den Datenbankregeln gesperrt)
//
// Zugang: Dienstkonto-Schlüssel des Projekts tekke-55b28, als GitHub-Secret
// FIREBASE_SERVICE_ACCOUNT_DOENER. Lokal zum Testen:
// FIREBASE_SERVICE_ACCOUNT_DOENER_DATEI=<Pfad> node sende-doener.mjs --probe
//   --probe  zeigt nur an, was verschickt würde, und schreibt nichts.
// Fehlt der Schlüssel, passiert nichts (kein Fehler) – so bleibt der Ablauf grün, bis alles eingerichtet ist.
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
import { plane } from "./doener-logik.mjs";

const PROBE = process.argv.includes("--probe");
const zugang = process.env.FIREBASE_SERVICE_ACCOUNT_DOENER
  || (process.env.FIREBASE_SERVICE_ACCOUNT_DOENER_DATEI && readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_DOENER_DATEI, "utf8"));
if (!zugang) { console.log("Döner-Push: kein Dienstkonto-Schlüssel eingerichtet – übersprungen."); process.exit(0); }

initializeApp({ credential: cert(JSON.parse(zugang)), databaseURL: "https://tekke-55b28-default-rtdb.europe-west1.firebasedatabase.app" });
const db = getDatabase();
const lies = async (p) => (await db.ref(p).get()).val() || {};
const [orders, geraete, staff, gesendet] = await Promise.all(["orders", "pushgeraete/doener", "staff/doener", "push/gesendet"].map(lies));
const jetzt = Date.now();
const { nachrichten, merken, entfernen } = plane({ orders, geraete, staff, gesendet, jetzt });

const messaging = getMessaging();
const kaputt = new Set(entfernen);
let verschickt = 0;
for (const n of nachrichten) {
  console.log(`${PROBE ? "PROBE " : ""}${n.titel} | ${n.text} → ${n.ziele.length} Gerät(e)`);
  if (PROBE) continue;
  for (const z of n.ziele) {
    try {
      await messaging.send({
        token: z.token,
        data: { titel: n.titel, text: n.text, tag: n.tag },
        webpush: { headers: { Urgency: "high", TTL: "3600" } },
        apns: { headers: { "apns-priority": "10" } },
      });
      verschickt++;
    } catch (e) {
      const code = e.code || e.errorInfo?.code || "";
      console.warn("  nicht zugestellt:", z.id, code || e.message);
      // Gerät gibt es nicht mehr (App gelöscht, Erlaubnis entzogen) → Adresse entfernen
      if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) kaputt.add(z.id);
    }
  }
}

if (!PROBE) {
  if (Object.keys(merken).length) await db.ref("push/gesendet").update(merken);
  if (kaputt.size) await db.ref("pushgeraete/doener").update(Object.fromEntries([...kaputt].map((id) => [id, null])));
  await db.ref("push/letzterLauf").set(jetzt);
} else if (kaputt.size) console.log(`PROBE würde ${kaputt.size} Gerät(e) entfernen.`);
console.log(`Döner: ${nachrichten.length} Nachricht(en), ${verschickt} zugestellt, ${kaputt.size} Gerät(e) aufgeräumt.`);
process.exit(0);
