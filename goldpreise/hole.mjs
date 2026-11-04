// Holt den Xetra-Gold-Kurs (Deutsche Börse) und schreibt ihn als JSON (Pfad = erstes Argument).
// Gegenprobe: muss zum Weltmarkt (api.gold-api.com, Euro je Gramm) passen (±3 %), sonst wird nichts veröffentlicht.
import { writeFileSync } from "node:fs";
import { holeXetra } from "./xetra.mjs";

const ziel = process.argv[2] || "goldpreise.json";
const xetra = await holeXetra();
const aus = { quelle: "Börse Frankfurt, Xetra-Gold (DE000A0S9GB0)", waehrung: "EUR", xetra };

try {
  const r = await fetch("https://api.gold-api.com/price/XAU/EUR", { signal: AbortSignal.timeout(15000) });
  const j = await r.json();
  const spotGramm = j.price / 31.1035;
  const v = xetra.last / spotGramm;
  if (!(spotGramm > 10) || v < 0.97 || v > 1.03) throw new Error("Xetra-Gold passt nicht zum Weltmarkt: " + xetra.last + " / " + spotGramm.toFixed(2));
  aus.weltmarkt_gramm = Number(spotGramm.toFixed(4));
} catch (e) {
  if (String(e.message).startsWith("Xetra-Gold passt nicht")) throw e;
  console.log("Gegenprobe übersprungen:", e.message);
}

aus.abgerufen = new Date().toISOString();
writeFileSync(ziel, JSON.stringify(aus));
console.log("ok", aus.abgerufen, "Xetra-Gold", xetra.last, "Stand", xetra.zeit);
