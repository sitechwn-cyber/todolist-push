// Prüft Gebetszeiten, Kıble und die Versandplanung. Aufruf: npm test
import assert from "node:assert/strict";
import { berechne, GEBETE, uhrzeit, kibleRichtung, kibleEntfernung, naechstes, tagVon, tagPlus, tagSchluessel } from "./gebetszeiten.js";
import { plane } from "./plane-push.mjs";

const min = (ms, zone) => { const [h, m] = uhrzeit(ms, zone).split(":").map(Number); return h * 60 + m; };
const nahe = (ist, soll, tol, text) => assert.ok(Math.abs(ist - soll) <= tol, `${text}: ${ist} statt ~${soll}`);
const hm = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

// Referenzwerte (echte Sonnenaufgänge/-untergänge, Diyanet-Minuten abgezogen/addiert), Toleranz 4 Min.
{
  const z = berechne({ y: 2026, m: 10, d: 15 }, 41.01, 28.98); // Istanbul
  nahe(min(z.gunes, "Europe/Istanbul"), hm("07:08"), 4, "Istanbul Güneş");
  nahe(min(z.aksam, "Europe/Istanbul"), hm("18:30"), 4, "Istanbul Akşam");
}
{
  const z = berechne({ y: 2026, m: 10, d: 15 }, 48.83, 9.32); // Waiblingen
  nahe(min(z.aksam, "Europe/Berlin"), hm("18:40"), 4, "Waiblingen Akşam");
  nahe(min(z.ogle, "Europe/Berlin"), hm("13:13"), 4, "Waiblingen Öğle");
}

// Reihenfolge und Plausibilität über das ganze Jahr, auch Sommer in hohen Breiten
for (const [breite, laenge, zone] of [[48.83, 9.32, "Europe/Berlin"], [53.55, 10.0, "Europe/Berlin"], [41.01, 28.98, "Europe/Istanbul"], [21.42, 39.83, "Asia/Riyadh"]]) {
  for (let tag = 0; tag < 366; tag += 5) {
    const t = tagPlus({ y: 2026, m: 1, d: 1 }, tag);
    const z = berechne(t, breite, laenge);
    const reihe = GEBETE.map((g) => z[g.id]);
    assert.ok(reihe.every(Number.isFinite), `Zahl erwartet ${tagSchluessel(t)} ${breite}`);
    for (let i = 1; i < reihe.length; i++) assert.ok(reihe[i] > reihe[i - 1], `Reihenfolge ${tagSchluessel(t)} ${breite}: ${GEBETE[i].id}`);
    assert.ok(reihe[5] - reihe[0] < 23 * 3600000, `Tag zu lang ${tagSchluessel(t)}`);
  }
}

// Kıble: Stuttgart ≈ 128°, Istanbul ≈ 151°, Mekka-Nähe zeigt nicht ins Leere
nahe(kibleRichtung(48.78, 9.18), 128, 2, "Kıble Stuttgart");
nahe(kibleRichtung(41.01, 28.98), 151, 2, "Kıble Istanbul");
nahe(kibleEntfernung(48.83, 9.32), 4070, 100, "Entfernung Waiblingen–Mekka");

// naechstes(): nach Yatsı kommt İmsak von morgen
{
  const z = berechne({ y: 2026, m: 10, d: 15 }, 48.83, 9.32);
  const n = naechstes(z.yatsi + 60000, 48.83, 9.32, "Europe/Berlin");
  assert.equal(n.gebet.id, "imsak");
  assert.equal(tagSchluessel(n.tag), "2026-10-16");
}

// Versandplanung
{
  const g = { token: "T", lat: 48.83, lon: 9.32, zone: "Europe/Berlin", vorlauf: 10, gebete: { ogle: true, ikindi: false }, minuten: {} };
  const z = berechne({ y: 2026, m: 10, d: 15 }, 48.83, 9.32);
  const ogle = z.ogle;
  const ohne = (jetzt, gesendet = {}) => plane({ geraete: { a: g }, gesendet, jetzt });
  assert.equal(ohne(ogle - 11 * 60000).nachrichten.length, 0, "zu früh");
  const a = ohne(ogle - 9 * 60000);
  assert.equal(a.nachrichten.length, 1, "fällig");
  assert.match(a.nachrichten[0].text, /Öğle in 10 Minuten \(13:\d\d\)/);
  assert.ok(a.merken["a/2026-10-15-ogle"]);
  assert.equal(ohne(ogle - 9 * 60000, { a: { "2026-10-15-ogle": true } }).nachrichten.length, 0, "schon gesendet");
  assert.equal(ohne(ogle + 20 * 60000).nachrichten.length, 0, "zu spät");
  assert.equal(ohne(ogle + 5 * 60000).nachrichten.length, 1, "Nachholen");
  assert.equal(ohne(z.ikindi - 60000).nachrichten.length, 0, "İkindi aus");
  const alt = ohne(ogle - 9 * 60000, { a: { "2026-10-10-ogle": true }, weg: { x: true } });
  assert.equal(alt.merken["a/2026-10-10-ogle"], null, "alter Merkzettel");
  assert.equal(alt.merken["weg"], null, "Gerät weg");
  assert.equal(plane({ geraete: { a: { ...g, zone: "Kaputt/Zone" } }, gesendet: {}, jetzt: ogle }).nachrichten.length, 0, "ungültige Zeitzone");
  assert.equal(plane({ geraete: { a: { ...g, token: "" } }, gesendet: {}, jetzt: ogle - 60000 }).nachrichten.length, 0, "ohne Token");
}
console.log("Alle Prüfungen bestanden.");
