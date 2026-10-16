// Prüft Gebetszeiten, Kıble und die Versandplanung. Aufruf: npm test
import assert from "node:assert/strict";
import { berechne, GEBETE, uhrzeit, kibleRichtung, kibleEntfernung, naechstes, tagVon, tagPlus, tagSchluessel, lokalZuMs } from "./gebetszeiten.js";
import { leseVakitler, tagesZeiten } from "./referenz.js";
import { plane, benoetigteOrte } from "./plane-push.mjs";
import { TEXTE } from "./sprache.js";
import { HADITHE, FREITAGS_HADITHE, QUELLEN, hadithFuer } from "./hadithe.js";
import { hidschri, ereignisse, ereignisseAm, naechsteEreignisse, REGELN, schluessel as tagKey } from "./kalender.js";

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
  const n = naechstes(z.yatsi + 60000, "Europe/Berlin", (tag) => berechne(tag, 48.83, 9.32));
  assert.equal(n.gebet.id, "imsak");
  assert.equal(tagSchluessel(n.tag), "2026-10-16");
}

// Versandplanung
{
  const g = { token: "T", lat: 48.83, lon: 9.32, zone: "Europe/Berlin", vorlauf: 10, gebete: { ogle: true, ikindi: false }, korrektur: {} };
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
// Referenz (Diyanet-Antwort, Format wie ezanvakti.emushaf.net): lesen, Vorrang vor Berechnung, Rückfall
{
  const antwort = [
    { MiladiTarihKisa: "15.10.2026", Imsak: "05:49", Gunes: "07:33", Ogle: "13:12", Ikindi: "16:03", Aksam: "18:40", Yatsi: "20:11" },
    { MiladiTarihKisa: "16.10.2026", Imsak: "5:52", Gunes: "07:34", Ogle: "13:11", Ikindi: "16:01", Aksam: "18:37", Yatsi: "20:08" },
    { MiladiTarihKisa: "kaputt", Imsak: "x" },
    { MiladiTarihKisa: "17.10.2026", Imsak: "", Gunes: "07:37", Ogle: "13:11", Ikindi: "16:00", Aksam: "18:36", Yatsi: "20:07" },
  ];
  const tab = leseVakitler(antwort);
  assert.deepEqual(Object.keys(tab), ["2026-10-15", "2026-10-16"], "nur gültige Tage");
  assert.equal(tab["2026-10-16"].imsak, "05:52", "Uhrzeit mit führender Null");
  assert.deepEqual(leseVakitler(null), {});
  const tag = { y: 2026, m: 10, d: 15 };
  const r = tagesZeiten({ tag, zone: "Europe/Berlin", breite: 48.83, laenge: 9.32, tabelle: tab });
  assert.equal(r.quelle, "tabelle");
  assert.equal(uhrzeit(r.zeiten.imsak, "Europe/Berlin"), "05:49");
  assert.equal(uhrzeit(r.zeiten.yatsi, "Europe/Berlin"), "20:11");
  assert.equal(tagesZeiten({ tag, zone: "Europe/Berlin", breite: 48.83, laenge: 9.32, korrektur: { ogle: 3 }, tabelle: tab }).zeiten.ogle - r.zeiten.ogle, 3 * 60000, "Korrektur obendrauf");
  assert.equal(tagesZeiten({ tag: { y: 2026, m: 10, d: 30 }, zone: "Europe/Berlin", breite: 48.83, laenge: 9.32, tabelle: tab }).quelle, "berechnet", "Tag fehlt → Rückfall");
  assert.equal(tagesZeiten({ tag, zone: "Europe/Berlin", breite: 48.83, laenge: 9.32 }).quelle, "berechnet", "ohne Tabelle");
  // Sommer-/Winterzeit: 25.10.2026 endet die Sommerzeit (03:00 → 02:00)
  assert.equal(uhrzeit(lokalZuMs({ y: 2026, m: 10, d: 24 }, "12:00", "Europe/Berlin"), "Europe/Berlin"), "12:00");
  assert.equal(uhrzeit(lokalZuMs({ y: 2026, m: 10, d: 26 }, "12:00", "Europe/Berlin"), "Europe/Berlin"), "12:00");
  assert.equal(lokalZuMs({ y: 2026, m: 10, d: 26 }, "12:00", "Europe/Berlin") - lokalZuMs({ y: 2026, m: 10, d: 24 }, "12:00", "Europe/Berlin"), 49 * 3600000);
  // Versandplanung mit Referenztabelle
  const gerat = { token: "T", lat: 48.83, lon: 9.32, zone: "Europe/Berlin", vorlauf: 10, gebete: { ogle: true }, korrektur: {}, diyanet: { ilce: 9999, zone: "Europe/Berlin" } };
  assert.deepEqual(benoetigteOrte({ a: gerat, b: gerat, c: { ...gerat, diyanet: undefined } }), [9999]);
  const ogleRef = r.zeiten.ogle; // 13:12
  const mit = plane({ geraete: { a: gerat }, gesendet: {}, jetzt: ogleRef - 9 * 60000, tabellen: { 9999: tab } });
  assert.equal(mit.nachrichten.length, 1);
  assert.match(mit.nachrichten[0].text, /Öğle in 10 Minuten \(13:12\)/, "Uhrzeit aus der Referenz");
  assert.equal(plane({ geraete: { a: gerat }, gesendet: {}, jetzt: ogleRef - 11 * 60000, tabellen: { 9999: tab } }).nachrichten.length, 0);
  // Referenz nicht erreichbar → Berechnung statt Absturz
  assert.equal(plane({ geraete: { a: gerat }, gesendet: {}, jetzt: berechne(tag, 48.83, 9.32).ogle, tabellen: {} }).nachrichten.length, 1, "Rückfall berechnet");
}
// Eingebaute Jahrestabelle (Waiblingen 2026, Diyanet-Format)
{
  const { default: jahr } = await import("./daten/waiblingen-2026.js");
  assert.equal(Object.keys(jahr).length, 365);
  const korr = (id) => ({});
  assert.equal(jahr["2026-10-15"].imsak, "05:49");
  assert.equal(jahr["2026-06-10"].imsak, "01:24", "Sternchen entfernt");
  const z = (d) => tagesZeiten({ tag: { y: 2026, m: +d.slice(5, 7), d: +d.slice(8) }, zone: "Europe/Berlin", breite: 48.83, laenge: 9.32, tabelle: jahr });
  for (let tag = 0; tag < 365; tag++) {
    const t = tagPlus({ y: 2026, m: 1, d: 1 }, tag);
    const { zeiten, quelle } = z(tagSchluessel(t));
    assert.equal(quelle, "tabelle");
    const reihe = GEBETE.map((g) => zeiten[g.id]);
    for (let i = 1; i < reihe.length; i++) assert.ok(reihe[i] > reihe[i - 1], `Reihenfolge ${tagSchluessel(t)} ${GEBETE[i].id}`);
  }
  // Yatsı nach Mitternacht gehört ans Tagesende (1. Juni: 00:00 des 2. Juni)
  const juni = z("2026-06-01").zeiten;
  assert.equal(uhrzeit(juni.yatsi, "Europe/Berlin"), "00:00");
  assert.equal(tagSchluessel(tagVon(juni.yatsi, "Europe/Berlin")), "2026-06-02");
  // Zeitumstellung 29.03.: Öğle springt in der Uhrzeit von 12:32 auf 13:32
  assert.equal(uhrzeit(z("2026-03-28").zeiten.ogle, "Europe/Berlin"), "12:32");
  assert.equal(uhrzeit(z("2026-03-29").zeiten.ogle, "Europe/Berlin"), "13:32");
  // Nächstes Gebet kurz nach Mitternacht im Sommer: Yatsı des Vortags (00:03) kommt noch
  const nach = lokalZuMs({ y: 2026, m: 6, d: 4 }, "00:01", "Europe/Berlin");
  const n2 = naechstes(nach, "Europe/Berlin", (t) => z(tagSchluessel(t)).zeiten);
  assert.equal(n2.gebet.id, "yatsi");
  // Erinnerung aus der eingebauten Tabelle
  const geraet = { token: "T", lat: 48.83, lon: 9.32, zone: "Europe/Berlin", vorlauf: 10, gebete: { imsak: true }, korrektur: {}, tabelle: "waiblingen-2026" };
  const um = lokalZuMs({ y: 2026, m: 10, d: 15 }, "05:49", "Europe/Berlin");
  const pl = plane({ geraete: { a: geraet }, gesendet: {}, jetzt: um - 5 * 60000, eingebaut: { "waiblingen-2026": jahr } });
  assert.equal(pl.nachrichten.length, 1);
  assert.match(pl.nachrichten[0].text, /İmsak in 10 Minuten \(05:49\)/);
}

// Sprachen: jeder deutsche Schlüssel hat eine türkische Übersetzung (und umgekehrt), Platzhalter stimmen überein
{
  const de = Object.keys(TEXTE.de), tr = Object.keys(TEXTE.tr);
  assert.deepEqual(de.filter((k) => !(k in TEXTE.tr)), [], "Schlüssel ohne Türkisch");
  assert.deepEqual(tr.filter((k) => !(k in TEXTE.de)), [], "Schlüssel ohne Deutsch");
  const ph = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
  for (const k of de) assert.equal(ph(TEXTE.tr[k]), ph(TEXTE.de[k]), `Platzhalter in ${k}`);
  for (const r of REGELN) { assert.ok(TEXTE.de["f." + r.id] && TEXTE.de["f." + r.id + ".t"], "Feiertag ohne Text: " + r.id); }
}

// Kalender: Hidschri-Datum und religiöse Tage (Umm al-Qura)
{
  assert.deepEqual(hidschri({ y: 2026, m: 3, d: 20 }), { j: 1447, m: 10, d: 1 }); // 1. Schawwal = Ramadanfest
  assert.deepEqual(hidschri({ y: 2026, m: 5, d: 27 }), { j: 1447, m: 12, d: 10 }); // 10. Dhu l-hiddscha = Opferfest
  assert.deepEqual(hidschri({ y: 2026, m: 10, d: 16 }), { j: 1448, m: 5, d: 5 });
  const ev = ereignisse(2026);
  const tage = (id) => ev.filter((e) => e.id === id).map((e) => tagKey(e.tag));
  assert.deepEqual(tage("fitr"), ["2026-03-20", "2026-03-21", "2026-03-22"]);
  assert.deepEqual(tage("adha"), ["2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30"]);
  assert.deepEqual(tage("arafat"), ["2026-05-26"]);
  assert.deepEqual(tage("arefeFitr"), ["2026-03-19"]);
  assert.deepEqual(tage("ramadan"), ["2026-02-18"]);
  assert.deepEqual(tage("neujahr"), ["2026-06-16"]);
  assert.deepEqual(tage("aschura"), ["2026-06-25"]);
  assert.deepEqual(tage("berat"), ["2026-02-02"]);
  assert.equal(tage("regaib").length, 1);
  assert.equal(new Date(Date.UTC(2026, 11, 10, 12)).getUTCDay(), 4); // Regaib am Donnerstagabend
  assert.equal(ereignisseAm({ y: 2026, m: 3, d: 21 })[0].nr, 2);
  const nae = naechsteEreignisse({ y: 2026, m: 10, d: 16 }, 3).map((e) => e.id);
  assert.deepEqual(nae, ["dreimonate", "regaib", "mirac"]);
  // Jahreswechsel: kommende Tage greifen ins nächste Jahr
  assert.ok(naechsteEreignisse({ y: 2026, m: 12, d: 30 }, 2).length === 2);
}

// Hadithe: vollständig, ohne Dubletten, Quellen bekannt, Tag für Tag wechselnd, Freitags eigene
{
  for (const h of [...HADITHE, ...FREITAGS_HADITHE]) {
    assert.ok(h.de && h.tr && h.q.length, "Hadith unvollständig: " + (h.de || "").slice(0, 30));
    for (const k of h.q) assert.ok(QUELLEN[k], "unbekannte Quelle " + k);
  }
  assert.ok(HADITHE.length >= 60, "zu wenige Hadithe: " + HADITHE.length);
  assert.equal(new Set(HADITHE.map((h) => h.de)).size, HADITHE.length, "doppelter Hadith");
  assert.notEqual(hadithFuer(20000, 1).de, hadithFuer(20001, 2).de);
  assert.ok(FREITAGS_HADITHE.includes(hadithFuer(20000, 5)));
  assert.ok(HADITHE.includes(hadithFuer(-5, 3)));
}
console.log("Alle Prüfungen bestanden.");
