// Prüft Gebetszeiten, Kıble und die Versandplanung. Aufruf: npm test
import assert from "node:assert/strict";
import { berechne, GEBETE, uhrzeit, kibleRichtung, kibleEntfernung, naechstes, tagVon, tagPlus, tagSchluessel } from "./gebetszeiten.js";
import { plane } from "./plane-push.mjs";

const min = (ms, zone) => { const [h, m] = uhrzeit(ms, zone).split(":").map(Number); return h * 60 + m; };
const nahe = (ist, soll, tol, text) => assert.ok(Math.abs(ist - soll) <= tol, `${text}: ${ist} statt ~${soll}`);
const hm = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

// Referenz: echte Wochentabelle (İstanbul, 15.–21.10.2026, Datei vom Nutzer), Abweichung ≤ 1 Min.
{
  const tabelle = {
    15: ["05:44", "07:08", "12:55", "16:00", "18:32", "19:51"], 16: ["05:45", "07:09", "12:55", "15:58", "18:30", "19:49"],
    17: ["05:46", "07:10", "12:55", "15:57", "18:29", "19:48"], 18: ["05:47", "07:11", "12:54", "15:56", "18:27", "19:47"],
    19: ["05:48", "07:13", "12:54", "15:55", "18:26", "19:45"], 20: ["05:49", "07:14", "12:54", "15:54", "18:24", "19:44"],
    21: ["05:50", "07:15", "12:54", "15:53", "18:23", "19:42"],
  };
  for (const [d, soll] of Object.entries(tabelle)) {
    const z = berechne({ y: 2026, m: 10, d: +d }, 41.01, 28.98);
    GEBETE.forEach((g, i) => nahe(min(z[g.id], "Europe/Istanbul"), hm(soll[i]), 1, `İstanbul ${d}.10. ${g.name}`));
  }
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
