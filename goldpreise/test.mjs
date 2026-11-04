// Prüft den Leser gegen einen gespeicherten Beispiel-Datenstrom und gegen kaputte Eingaben.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { parseDatenstrom } from "./xetra.mjs";

const text = readFileSync(new URL("./beispiel-xetra.txt", import.meta.url), "utf8");
const r = parseDatenstrom(text);
assert.equal(r.last, 115.35);
assert.equal(r.zeit, "2026-11-04T13:51:00+01:00");
assert.equal(r.vortag, 112.9);

assert.throws(() => parseDatenstrom("event: x\n\n"));                                             // keine Datenzeile
assert.throws(() => parseDatenstrom(text.replace("DE000A0S9GB0", "DE0000000000")));              // falsches Papier
assert.throws(() => parseDatenstrom(text.replace('"lastPrice":115.35', '"lastPrice":11535')));    // unplausibel
assert.throws(() => parseDatenstrom(text.replace('"EUR"', '"USD"')));                             // Währung
assert.throws(() => parseDatenstrom(text.replace(/,"timestampLastPrice":"[^"]*"/, "")));          // kein Zeitstempel
console.log("Xetra-Leser: alle Prüfungen ok");
