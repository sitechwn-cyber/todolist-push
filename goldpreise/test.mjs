// Prüft den Leser gegen eine gespeicherte Beispielseite und gegen kaputte Eingaben.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { parsePreise } from "./parse.mjs";

const html = readFileSync(new URL("./beispiel.html", import.meta.url), "utf8");
const r = parsePreise(html);
assert.equal(r.waehrung, "EUR");
assert.ok(r.preise.gram.a > 0 && r.preise.gram.s >= r.preise.gram.a);
assert.ok(r.preise.ons.s > 500);
for (const k of ["ceyrek", "yarim", "tam", "resat", "cumhuriyet", "a22", "a18", "a14"]) assert.ok(r.preise[k].s > 0, k);

// Seite umgebaut: Feld fehlt -> Fehler
assert.throws(() => parsePreise(html.replace('id="GRAMEUR"', 'id="ANDERS"')));
// Unplausible Zahl (Gramm 10x zu hoch) -> Fehler
assert.throws(() => parsePreise(html.replace(/(<td id="GRAMEUR">)[0-9.]+/, "$11154.1000")));
// Ankauf über Verkauf -> Fehler
assert.throws(() => parsePreise(html.replace(/(<td id="GRAMEUR_ALIS">)[0-9.]+/, "$1200.0")));
console.log("Goldpreise-Leser: alle Prüfungen ok");
