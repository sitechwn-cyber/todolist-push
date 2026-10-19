// Döner-App: automatischer Tagesabschluss um 00:00 – reine Logik (ohne Datenbank), dadurch testbar.
// Wird von sende-doener.mjs benutzt, geprüft von test-abschluss.mjs.
//
// Regel: Alle Bestellungen, die von einem FRÜHEREN Tag (Berliner Zeit) stammen, werden je Tag und
// Gruppe (ERKEKLER / BAYANLAR) als Bericht ins Archiv gelegt und danach gelöscht. Bestellungen von
// heute bleiben stehen. Läuft der Wecker um 00:00 nicht, holt der nächste Lauf es nach.
// Die Nummer (counter) geht nur auf 1 zurück, wenn danach gar keine Bestellung mehr da ist
// (sonst gäbe es doppelte Nummern – der Zähler ist für beide Gruppen gemeinsam).
//
// Eingabe:  orders            orders/<id>
//           archivSchluessel  schon vorhandene Schlüssel unter archiv/doener
//           jetzt             Zeit in ms
// Ausgabe:  eintraege              [{ schluessel, daten }]  -> archiv/doener/<schluessel>
//           loeschen               { "orders/<id>": null, "bestellnummern/<nr>": null, ... }
//           zaehlerZuruecksetzen   true/false

const TZ = "Europe/Berlin";
const tagFmt = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }); // JJJJ-MM-TT
export const tagVon = (ms) => tagFmt.format(ms);
const zahl = (v) => Number(v) || 0;
const gruppeVon = (o) => (o && o.kunde === "BAYANLAR" ? "BAYANLAR" : "ERKEKLER");
const euro = (n) => n.toFixed(2).replace(".", ",");
const deDatum = (tag) => tag.split("-").reverse().join(".");

// Bericht wie in der App (buildReport): Bestellzeilen, Summen, "Verkaufte Artikel" mit Menge und Umsatz.
export function berichtCsv(liste) {
  liste = liste.slice().sort((a, b) => Date.parse(a[1].zeit) - Date.parse(b[1].zeit));
  const rows = [["Nummer", "Datum", "Uhrzeit", "Warteschlange", "Bestellart", "Name", "Mitarbeiter", "Artikel", "Notiz", "Gesamt (€)", "Status", "Bezahlt"]];
  for (const [, o] of liste) {
    const artikelText = (o.items || []).map((i) => `${i.menge}x ${i.art}${i.groesse ? ` (${i.groesse})` : ""}${(i.options && i.options.length) ? " +" + i.options.map((op) => op.name).join("+") : ""}`).join(" | ");
    const z = new Date(o.zeit);
    rows.push([
      o.nummer, deDatum(tagVon(z)), z.toLocaleTimeString("de-DE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }),
      o.kunde, o.bestellart === "mitnehmen" ? "Mitnehmen" : "Vor Ort", o.name || "", o.mitarbeiter || "", artikelText, o.notiz || "",
      euro(zahl(o.gesamt)), o.status === "fertig" ? "fertig" : "offen", o.bezahlt ? "ja" : "nein",
    ]);
  }
  const summe = (l) => l.reduce((s, [, o]) => s + zahl(o.gesamt), 0);
  const kassiert = summe(liste.filter(([, o]) => o.bezahlt));
  rows.push([]);
  rows.push(["Gesamtumsatz", euro(summe(liste)) + " €"]);
  rows.push(["Kassiert", euro(kassiert) + " €"]);
  rows.push(["Offen", euro(summe(liste) - kassiert) + " €"]);
  rows.push(["Bestellungen gesamt", liste.length]);
  // Gleiche Produkte zusammenfassen: Menge und Einnahmen je Artikel (mit Größe)
  const artikel = new Map(), extras = new Map();
  for (const [, o] of liste) {
    for (const item of o.items || []) {
      const menge = zahl(item.menge), name = item.art + (item.groesse ? " (" + item.groesse + ")" : "");
      const a = artikel.get(name) || { name, menge: 0, umsatz: 0 };
      a.menge += menge; a.umsatz += zahl(item.preis); artikel.set(name, a);
      for (const op of item.options || []) extras.set("+ " + op.name, (extras.get("+ " + op.name) || 0) + menge);
    }
  }
  rows.push([]); rows.push(["Verkaufte Artikel"]); rows.push(["Artikel", "Menge gesamt", "Umsatz (€)"]);
  [...artikel.values()].sort((a, b) => b.menge - a.menge || a.name.localeCompare(b.name, "de")).forEach((a) => rows.push([a.name, a.menge, euro(a.umsatz)]));
  if (extras.size) { rows.push([]); rows.push(["Extras", "Menge"]); [...extras.entries()].sort((a, b) => b[1] - a[1]).forEach(([n, m]) => rows.push([n, m])); }
  return "﻿" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
}

export function planeAbschluss({ orders, archivSchluessel, jetzt }) {
  const heute = tagVon(jetzt);
  const alleEintraege = Object.entries(orders || {});
  const mitZeit = alleEintraege.filter(([, o]) => o && o.zeit && Number.isFinite(Date.parse(o.zeit)));
  const alt = mitZeit.filter(([, o]) => tagVon(Date.parse(o.zeit)) < heute);
  const belegt = new Set(archivSchluessel || []);
  const eintraege = [], loeschen = {};

  const gruppen = new Map(); // "JJJJ-MM-TT|GRUPPE" -> [[id, o], ...]
  for (const e of alt) {
    const k = tagVon(Date.parse(e[1].zeit)) + "|" + gruppeVon(e[1]);
    if (!gruppen.has(k)) gruppen.set(k, []);
    gruppen.get(k).push(e);
  }
  for (const [k, liste] of [...gruppen.entries()].sort()) {
    const [tag, gruppe] = k.split("|");
    let min = 0, schluessel;
    do { schluessel = `${tag}_${String(Math.floor(min / 60) * 100 + (min % 60)).padStart(4, "0")}_${gruppe}`; min++; } while (belegt.has(schluessel));
    belegt.add(schluessel);
    const umsatz = liste.reduce((s, [, o]) => s + zahl(o.gesamt), 0);
    const kassiert = liste.reduce((s, [, o]) => s + (o.bezahlt ? zahl(o.gesamt) : 0), 0);
    eintraege.push({ schluessel, daten: { datum: tag, gruppe, art: "auto", erstellt: jetzt, anzahl: liste.length, umsatz: Math.round(umsatz * 100) / 100, kassiert: Math.round(kassiert * 100) / 100, csv: berichtCsv(liste) } });
    for (const [id, o] of liste) { loeschen["orders/" + id] = null; if (o.nrKey) loeschen["bestellnummern/" + o.nrKey] = null; }
  }
  // Eintraege ohne Zeit werden nie angefasst (nichts geht verloren) und zaehlen als "uebrig".
  const uebrig = alleEintraege.length - alt.length;
  return { eintraege, loeschen, zaehlerZuruecksetzen: alt.length > 0 && uebrig === 0 };
}
