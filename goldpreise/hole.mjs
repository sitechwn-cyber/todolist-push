// Holt die Euro-Goldpreise von altineuro.com und schreibt sie als JSON (Pfad = erstes Argument).
// Ruft nur diese eine Seite auf, einmal je Lauf (alle 15 Minuten), mit erkennbarem User-Agent.
// Gegenprobe: der Grammpreis muss zum Weltmarkt (api.gold-api.com, Euro) passen, sonst wird nichts veröffentlicht.
import { writeFileSync } from "node:fs";
import { parsePreise } from "./parse.mjs";

const URL_SEITE = "https://altineuro.com/";
const ziel = process.argv[2] || "goldpreise.json";

const res = await fetch(URL_SEITE, {
  headers: { "User-Agent": "SiTech-Goldmarkt/1.0 (private Nutzung, 1 Abruf je 15 Min.)", "Accept-Language": "tr,de;q=0.8" },
  signal: AbortSignal.timeout(20000),
});
if (!res.ok) throw new Error("Seite antwortet mit " + res.status);
const aus = parsePreise(await res.text());

try {
  const r = await fetch("https://api.gold-api.com/price/XAU/EUR", { signal: AbortSignal.timeout(15000) });
  const j = await r.json();
  const spotGramm = j.price / 31.1035;
  const verhaeltnis = aus.preise.gram.a / spotGramm;
  if (!(spotGramm > 10) || verhaeltnis < 0.9 || verhaeltnis > 1.1) {
    throw new Error("Grammpreis passt nicht zum Weltmarkt: " + aus.preise.gram.a + " / " + spotGramm.toFixed(2));
  }
  aus.weltmarkt_gramm = Number(spotGramm.toFixed(4));
} catch (e) {
  if (String(e.message).startsWith("Grammpreis passt nicht")) throw e;
  console.log("Gegenprobe übersprungen:", e.message); // Weltmarktseite nicht erreichbar – kein Grund, den Stand zu verwerfen
}

aus.abgerufen = new Date().toISOString();
writeFileSync(ziel, JSON.stringify(aus));
console.log("ok", aus.abgerufen, "Gramm", aus.preise.gram.a, "/", aus.preise.gram.s);
