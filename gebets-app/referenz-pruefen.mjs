// Prüft die Diyanet-Schnittstelle (referenz.js) auf einem Rechner MIT Internet.
//   node referenz-pruefen.mjs --suche Stuttgart          Orte in Deutschland (Almanya) suchen, zeigt IlceID
//   node referenz-pruefen.mjs --suche Gmünd --land Türkiye
//   node referenz-pruefen.mjs <IlceID>                   zeigt die nächsten Tage
//   node referenz-pruefen.mjs <IlceID> referenz/deutschland-ort-unklar-2026-jahr.csv
//                                                        vergleicht mit einer gespeicherten Tabelle (Minuten Unterschied)
import { readFileSync } from "node:fs";
import { holeLaender, holeStaedte, holeOrte, holeVakitler } from "./referenz.js";
import { GEBETE } from "./gebetszeiten.js";

const arg = process.argv.slice(2);
const wert = (n) => { const i = arg.indexOf(n); return i >= 0 ? arg[i + 1] : null; };
const norm = (s) => String(s).toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

if (arg.includes("--suche")) {
  const suche = norm(wert("--suche")), landName = norm(wert("--land") || "almanya");
  const land = (await holeLaender()).find((l) => norm(l.name).includes(landName));
  if (!land) { console.error("Land nicht gefunden"); process.exit(1); }
  console.log(`Land: ${land.name} (${land.id})`);
  for (const stadt of await holeStaedte(land.id)) {
    for (const ort of await holeOrte(stadt.id)) {
      if (norm(stadt.name).includes(suche) || norm(ort.name).includes(suche)) console.log(`${stadt.name} · ${ort.name}  →  IlceID ${ort.id}`);
    }
  }
  process.exit(0);
}

const ilce = arg[0];
if (!ilce) { console.error("IlceID fehlt (siehe Kopf der Datei)"); process.exit(1); }
const tabelle = await holeVakitler(ilce);
const tage = Object.keys(tabelle).sort();
console.log(`${tage.length} Tage erhalten (${tage[0]} … ${tage[tage.length - 1]})`);
if (!arg[1]) { for (const t of tage.slice(0, 7)) console.log(t, GEBETE.map((g) => tabelle[t][g.id]).join("  ")); process.exit(0); }

const MONATE = { ocak: 1, subat: 2, mart: 3, nisan: 4, mayis: 5, haziran: 6, temmuz: 7, agustos: 8, eylul: 9, ekim: 10, kasim: 11, aralik: 12 };
const min = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
let schlecht = 0, summe = 0;
for (const zeile of readFileSync(arg[1], "utf8").trim().split("\n").slice(1)) {
  const [datum, ...zeiten] = zeile.split(";");
  const [d, mon, y] = datum.split(" ");
  const schluessel = `${y}-${String(MONATE[norm(mon)]).padStart(2, "0")}-${d.padStart(2, "0")}`;
  const ref = tabelle[schluessel];
  if (!ref) { console.log(schluessel, "nicht in der Schnittstelle"); continue; }
  const diffs = GEBETE.map((g, i) => min(ref[g.id]) - min(zeiten[i]));
  schlecht += diffs.filter((x) => x !== 0).length; summe += diffs.length;
  console.log(schluessel, "Schnittstelle − Datei (Min):", diffs.join(" "));
}
console.log(schlecht === 0 ? "✔ alle Werte gleich" : `✘ ${schlecht} von ${summe} Werten weichen ab`);
