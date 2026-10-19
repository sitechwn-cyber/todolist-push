// Test des automatischen Döner-Abschlusses: node test-abschluss.mjs
import { planeAbschluss, berichtCsv, tagVon } from "./doener-abschluss.mjs";
const R = [];
const ok = (n, c) => R.push((c ? "OK   " : "FAIL ") + n);
// 19.10.2026 00:00:30 Berliner Zeit (Sommerzeit endet erst 25.10.) = 18.10. 22:00:30 UTC
const jetzt = Date.parse("2026-10-18T22:00:30Z");
const o = (zeit, kunde, gesamt, extra = {}) => ({ zeit, kunde, gesamt, nummer: 1, nrKey: "001", name: "Ali", status: "fertig", bestellart: "mitnehmen", items: [{ menge: 2, art: "Döner", groesse: "", preis: gesamt }], ...extra });

ok("Tagesschlüssel in Berliner Zeit (23:30 Berlin = gestern)", tagVon(Date.parse("2026-10-18T21:30:00Z")) === "2026-10-18");
ok("Tagesschlüssel: 00:30 Berlin = heute", tagVon(Date.parse("2026-10-18T22:30:00Z")) === "2026-10-19");

let r = planeAbschluss({ orders: {
  a: o("2026-10-18T15:00:00Z", "ERKEKLER", 14, { nrKey: "001", bezahlt: true }),
  b: o("2026-10-18T16:00:00Z", "ERKEKLER", 7, { nrKey: "002", items: [{ menge: 1, art: "Döner", groesse: "", preis: 7 }] }),
  c: o("2026-10-18T17:00:00Z", "BAYANLAR", 3.5, { nrKey: "003", items: [{ menge: 1, art: "Pommes", groesse: "groß", preis: 3.5 }] }),
}, archivSchluessel: [], jetzt });
ok("Zwei Archiv-Einträge (je Gruppe einer)", r.eintraege.length === 2);
const m = r.eintraege.find((e) => e.daten.gruppe === "ERKEKLER");
ok("Schlüssel Tag_0000_Gruppe", m && m.schluessel === "2026-10-18_0000_ERKEKLER");
ok("Anzahl und Umsatz stimmen", m && m.daten.anzahl === 2 && m.daten.umsatz === 21);
ok("Kassiert nur bezahlte", m && m.daten.kassiert === 14);
ok("Art ist auto", m && m.daten.art === "auto");
ok("Gleiche Produkte zusammengefasst (Döner 3×, 21,00)", m && /"Döner";"3";"21,00"/.test(m.daten.csv));
ok("CSV ohne Extras-Abschnitt, wenn keine", m && !m.daten.csv.includes("Extras"));
ok("Alle drei Bestellungen werden gelöscht", ["orders/a", "orders/b", "orders/c"].every((k) => r.loeschen[k] === null));
ok("Nummerneinträge werden gelöscht", ["bestellnummern/001", "bestellnummern/002", "bestellnummern/003"].every((k) => r.loeschen[k] === null));
ok("Nummer zurück auf 1, wenn nichts übrig", r.zaehlerZuruecksetzen === true);

r = planeAbschluss({ orders: { a: o("2026-10-18T15:00:00Z", "ERKEKLER", 7), h: o("2026-10-18T22:00:10Z", "ERKEKLER", 7, { nrKey: "004" }) }, archivSchluessel: [], jetzt });
ok("Bestellung von heute bleibt stehen", r.loeschen["orders/h"] === undefined && r.loeschen["orders/a"] === null);
ok("Nummer läuft weiter, wenn heute schon bestellt wurde", r.zaehlerZuruecksetzen === false);

r = planeAbschluss({ orders: { h: o("2026-10-18T22:00:10Z", "ERKEKLER", 7) }, archivSchluessel: [], jetzt });
ok("Nur heutige Bestellungen: nichts zu tun", r.eintraege.length === 0 && Object.keys(r.loeschen).length === 0 && r.zaehlerZuruecksetzen === false);
ok("Leere Liste: nichts zu tun", planeAbschluss({ orders: null, archivSchluessel: [], jetzt }).eintraege.length === 0);

r = planeAbschluss({ orders: { a: o("2026-10-18T15:00:00Z", "ERKEKLER", 7) }, archivSchluessel: ["2026-10-18_0000_ERKEKLER"], jetzt });
ok("Schlüssel schon belegt -> nächster freier (0001)", r.eintraege[0].schluessel === "2026-10-18_0001_ERKEKLER");

r = planeAbschluss({ orders: { a: o("2026-10-16T15:00:00Z", "ERKEKLER", 7, { nrKey: "001" }), b: o("2026-10-17T15:00:00Z", "ERKEKLER", 7, { nrKey: "002" }) }, archivSchluessel: [], jetzt });
ok("Mehrere ältere Tage: je Tag ein Eintrag", r.eintraege.map((e) => e.schluessel).join() === "2026-10-16_0000_ERKEKLER,2026-10-17_0000_ERKEKLER");

r = planeAbschluss({ orders: { a: o("2026-10-18T15:00:00Z", "ERKEKLER", 7, { items: [{ menge: 1, art: "Döner", groesse: "", preis: 8, options: [{ name: "Scharf" }] }] }) }, archivSchluessel: [], jetzt });
ok("Extras erscheinen im Bericht", r.eintraege[0].daten.csv.includes('"+ Scharf";"1"'));
ok("Unbekannte Gruppe landet bei ERKEKLER (nichts geht verloren)", planeAbschluss({ orders: { a: o("2026-10-18T15:00:00Z", "???", 7) }, archivSchluessel: [], jetzt }).eintraege[0].daten.gruppe === "ERKEKLER");
const ohneZeit = planeAbschluss({ orders: { x: { kunde: "ERKEKLER", gesamt: 5 }, a: o("2026-10-18T15:00:00Z", "ERKEKLER", 7) }, archivSchluessel: [], jetzt });
ok("Bestellung ohne Zeit wird nie gelöscht", ohneZeit.loeschen["orders/x"] === undefined && ohneZeit.zaehlerZuruecksetzen === false);
ok("Bericht enthält deutsches Datum", berichtCsv([["a", o("2026-10-18T15:00:00Z", "ERKEKLER", 7)]]).includes("18.10.2026"));

console.log(R.join("\n"));
console.log(R.some((x) => x.startsWith("FAIL")) ? "\nES GIBT FEHLER" : "\nALLE TESTS OK");
process.exit(R.some((x) => x.startsWith("FAIL")) ? 1 : 0);
