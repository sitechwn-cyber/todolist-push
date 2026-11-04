// Prüft den Leser gegen eine gespeicherte Beispielseite und gegen kaputte Eingaben.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { parsePreise } from "./parse.mjs";

const html = readFileSync(new URL("./beispiel.html", import.meta.url), "utf8");
const r = parsePreise(html);
assert.equal(r.waehrung, "EUR");
assert.ok(r.preise.gram.a > 10 && r.preise.gram.a < 1000 && r.preise.gram.s >= r.preise.gram.a);
for (const k of ["ceyrek", "yarim", "tam", "gremse", "resat", "hamit", "cumhuriyet", "a22", "a18", "a14"]) assert.ok(r.preise[k].s > 0, k);
assert.ok(r.seite_stand.includes("TRS"));

// Seite umgebaut: Zeile fehlt -> Fehler
assert.throws(() => parsePreise(html.replaceAll("Çeyrek Altın", "Anders")));
// Lira-Tabelle statt Euro-Tabelle (Reihenfolge vertauscht) -> Fehler
const i = html.indexOf("<table"), j = html.indexOf("<table", i + 10);
if (j > 0) assert.throws(() => parsePreise(html.slice(0, i) + html.slice(j)));
// Ankauf über Verkauf -> Fehler
assert.throws(() => parsePreise(html.replace(/(<td id="GRAMEUR_BUY">)[0-9.]+/, "$1999.0")));
console.log("Goldpreise-Leser: alle Prüfungen ok");
