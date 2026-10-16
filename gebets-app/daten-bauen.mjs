// Baut aus einer Referenz-CSV (referenz/…csv, Spalten: Miladi Tarih;İmsak;Güneş;Öğle;İkindi;Akşam;Yatsı)
// die eingebaute Zeitentabelle daten/<name>.js.   Aufruf: node daten-bauen.mjs <csv> <name>
// Beispiel: node daten-bauen.mjs referenz/deutschland-ort-unklar-2026-jahr.csv waiblingen-2026
// Ein „*“ vor einer Zeit (Diyanet: Wert wird gehalten, weil die Dämmerung nicht tief genug geht) wird entfernt.
import { readFileSync, writeFileSync } from "node:fs";
const [csv, name] = process.argv.slice(2);
if (!csv || !name) { console.error("Aufruf: node daten-bauen.mjs <csv> <name>"); process.exit(1); }
const norm = (s) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
const MONATE = { ocak: 1, subat: 2, mart: 3, nisan: 4, mayis: 5, haziran: 6, temmuz: 7, agustos: 8, eylul: 9, ekim: 10, kasim: 11, aralik: 12 };
const IDS = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
const tage = {};
for (const zeile of readFileSync(csv, "utf8").trim().split("\n").slice(1)) {
  const [datum, ...z] = zeile.split(";");
  const [d, mon, y] = datum.split(" ");
  const m = MONATE[norm(mon)];
  if (!m || z.length !== 6) throw new Error("Zeile nicht lesbar: " + zeile);
  const werte = z.map((t) => t.trim().replace(/^\*/, ""));
  if (!werte.every((t) => /^\d{2}:\d{2}$/.test(t))) throw new Error("Uhrzeit nicht lesbar: " + zeile);
  tage[`${y}-${String(m).padStart(2, "0")}-${d.padStart(2, "0")}`] = Object.fromEntries(IDS.map((id, i) => [id, werte[i]]));
}
writeFileSync(`daten/${name}.js`, `// Erzeugt von daten-bauen.mjs aus ${csv} – nicht von Hand ändern.\nexport default ${JSON.stringify(tage)};\n`);
console.log(`${Object.keys(tage).length} Tage → daten/${name}.js`);
