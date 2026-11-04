// Holt die Almanya-Euro-Goldpreise und schreibt sie als JSON (Pfad = erstes Argument).
// Ruft nur diese eine Seite auf, einmal je Lauf (alle 15 Minuten), mit erkennbarem User-Agent.
import { writeFileSync } from "node:fs";
import { parsePreise } from "./parse.mjs";

const URL_SEITE = "https://canlialtinfiyatlari.com/altin/almanya";
const ziel = process.argv[2] || "goldpreise.json";

const res = await fetch(URL_SEITE, {
  headers: { "User-Agent": "SiTech-Goldmarkt/1.0 (private Nutzung, 1 Abruf je 15 Min.)", "Accept-Language": "tr,de;q=0.8" },
  signal: AbortSignal.timeout(20000),
});
if (!res.ok) throw new Error("Seite antwortet mit " + res.status);
const html = await res.text();
const aus = parsePreise(html);
aus.abgerufen = new Date().toISOString();
writeFileSync(ziel, JSON.stringify(aus));
console.log("ok", aus.abgerufen, "Gramm", aus.preise.gram.a, "/", aus.preise.gram.s);
