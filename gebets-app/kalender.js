// Islamischer Kalender (Hidschri) und religiöse Tage. Reine Rechnung, läuft im Browser und in Node (Test).
// Grundlage ist der Kalender Umm al-Qura aus Intl (islamic-umalqura). Die Diyanet in der Türkei und die
// Mondsichtung vor Ort können um einen Tag abweichen – die App weist darauf hin.

const FORMAT = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" });
const mittag = (t) => Date.UTC(t.y, t.m - 1, t.d, 12);

/** Hidschri-Datum eines Kalendertags {y,m,d} → {j, m, d} (Jahr, Monat 1–12, Tag). */
export function hidschri(tag) {
  const teile = Object.fromEntries(FORMAT.formatToParts(mittag(tag)).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return { j: +teile.year, m: +teile.month, d: +teile.day };
}

/** Tag um n Tage verschieben (Kalendertag {y,m,d}, unabhängig von Zeitzone und Sommerzeit). */
export function plusTage(tag, n) {
  const x = new Date(mittag(tag) + n * 86400000);
  return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() };
}
export const wochentag = (tag) => new Date(mittag(tag)).getUTCDay(); // 0 = Sonntag … 6 = Samstag
export const tagsNummer = (tag) => Math.round(mittag(tag) / 86400000);
export const gleicherTag = (a, b) => a.y === b.y && a.m === b.m && a.d === b.d;
export const schluessel = (t) => `${t.y}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;

export const HIDSCHRI_MONATE = {
  de: ["Muharram", "Safar", "Rabiʻ al-awwal", "Rabiʻ ath-thani", "Dschumada al-ula", "Dschumada ath-thaniya", "Radschab", "Schaʻban", "Ramadan", "Schawwal", "Dhu l-qaʻda", "Dhu l-hiddscha"],
  tr: ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"],
};

/**
 * Regeln der religiösen Tage. art:
 *  - "bayram" Feiertag (dauer = Anzahl Tage), "tag" besonderer Tag, "nacht" Kandil (Abend vor dem genannten Tag,
 *    weil der islamische Tag mit Sonnenuntergang beginnt), "vor" Vortag (Arefe).
 *  - sonderfall "regaib": Donnerstagabend vor dem ersten Freitag des Radschab.
 * m/d = Monat und Tag im Hidschri-Kalender. Namen und Beschreibungen stehen in sprache.js unter f.<id>.
 */
export const REGELN = [
  { id: "neujahr", art: "tag", m: 1, d: 1 },
  { id: "aschura", art: "tag", m: 1, d: 10 },
  { id: "mevlid", art: "nacht", m: 3, d: 12 },
  { id: "dreimonate", art: "tag", m: 7, d: 1 },
  { id: "regaib", art: "nacht", sonder: "regaib" },
  { id: "mirac", art: "nacht", m: 7, d: 27 },
  { id: "berat", art: "nacht", m: 8, d: 15 },
  { id: "ramadan", art: "tag", m: 9, d: 1 },
  { id: "kadir", art: "nacht", m: 9, d: 27 },
  { id: "arefeFitr", art: "vor", m: 10, d: 1 },
  { id: "fitr", art: "bayram", m: 10, d: 1, dauer: 3 },
  { id: "arafat", art: "vor", m: 12, d: 10 },
  { id: "adha", art: "bayram", m: 12, d: 10, dauer: 4 },
];

const cache = new Map();

/** Alle religiösen Tage eines Kalenderjahres, nach Datum sortiert: [{ tag:{y,m,d}, id, art, nr, von }]. */
export function ereignisse(jahr) {
  if (cache.has(jahr)) return cache.get(jahr);
  const start = { y: jahr, m: 1, d: 1 };
  const anzahl = tagsNummer({ y: jahr + 1, m: 1, d: 1 }) - tagsNummer(start);
  const tage = Array.from({ length: anzahl + 1 }, (_, i) => plusTage(start, i));
  const h = tage.map(hidschri);
  const aus = [];
  for (let i = 0; i < anzahl; i++) {
    for (const r of REGELN) {
      if (r.sonder === "regaib") {
        if (wochentag(tage[i]) === 4 && h[i + 1].m === 7 && h[i + 1].d <= 7) aus.push({ tag: tage[i], id: r.id, art: r.art, nr: 1, von: 1 });
      } else if (r.art === "tag" || r.art === "bayram") {
        const dauer = r.dauer || 1;
        if (h[i].m === r.m && h[i].d >= r.d && h[i].d < r.d + dauer) aus.push({ tag: tage[i], id: r.id, art: r.art, nr: h[i].d - r.d + 1, von: dauer });
      } else if (h[i + 1].m === r.m && h[i + 1].d === r.d) {
        aus.push({ tag: tage[i], id: r.id, art: r.art, nr: 1, von: 1 });
      }
    }
  }
  aus.sort((a, b) => tagsNummer(a.tag) - tagsNummer(b.tag));
  cache.set(jahr, aus);
  return aus;
}

/** Religiöse Tage an einem Kalendertag. */
export const ereignisseAm = (tag) => ereignisse(tag.y).filter((e) => gleicherTag(e.tag, tag));

/** Die nächsten n religiösen Tage ab einem Kalendertag (heute eingeschlossen); erster Tag je mehrtägigem Fest. */
export function naechsteEreignisse(ab, n = 8) {
  const liste = [...ereignisse(ab.y), ...ereignisse(ab.y + 1)].filter((e) => e.nr === 1 && tagsNummer(e.tag) >= tagsNummer(ab));
  return liste.slice(0, n);
}
