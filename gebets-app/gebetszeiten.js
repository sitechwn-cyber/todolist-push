// Gebetszeiten ohne Internet berechnet (Sonnenstand), Winkel nach Diyanet-Art wie die
// Semerkand-App: İmsak 18°, Yatsı 17°, İkindi einfacher Schatten (Faktor 1).
// Läuft im Browser (app.js) und bei GitHub (sende.mjs) – derselbe Code, dieselben Zeiten.
// Rechenweg nach PrayTimes.org (Hamid Zarrabi-Zadeh).

export const GEBETE = [
  { id: "imsak", name: "İmsak", deutsch: "Morgendämmerung", arabisch: "الفجر", taeglich: true },
  { id: "gunes", name: "Güneş", deutsch: "Sonnenaufgang", arabisch: "الشروق", taeglich: false },
  { id: "ogle", name: "Öğle", deutsch: "Mittag", arabisch: "الظهر", taeglich: true },
  { id: "ikindi", name: "İkindi", deutsch: "Nachmittag", arabisch: "العصر", taeglich: true },
  { id: "aksam", name: "Akşam", deutsch: "Sonnenuntergang", arabisch: "المغرب", taeglich: true },
  { id: "yatsi", name: "Yatsı", deutsch: "Nacht", arabisch: "العشاء", taeglich: true },
];

// Sicherheitsminuten der Diyanet (Zeit „Güneş“ früher, die anderen später), damit die Zeiten
// zu denen der Semerkand-/Diyanet-Kalender passen. In den Einstellungen pro Gebet änderbar.
export const DIYANET_MINUTEN = { imsak: 0, gunes: -7, ogle: 5, ikindi: 4, aksam: 7, yatsi: 0 };

const WINKEL = { imsak: 18, yatsi: 17, horizont: 0.833 };

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const sin = (d) => Math.sin(rad(d));
const cos = (d) => Math.cos(rad(d));
const tan = (d) => Math.tan(rad(d));
const arcsin = (x) => deg(Math.asin(x));
const arccos = (x) => deg(Math.acos(x));
const arctan2 = (y, x) => deg(Math.atan2(y, x));
const arccot = (x) => deg(Math.atan(1 / x));
const fixWinkel = (a) => ((a % 360) + 360) % 360;
const fixStunde = (h) => ((h % 24) + 24) % 24;

function julianisch(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

function sonne(jd) {
  const D = jd - 2451545.0;
  const g = fixWinkel(357.529 + 0.98560028 * D);
  const q = fixWinkel(280.459 + 0.98564736 * D);
  const L = fixWinkel(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = fixStunde(arctan2(cos(e) * sin(L), cos(L)) / 15);
  return { deklination: arcsin(sin(e) * sin(L)), gleichung: q / 15 - RA };
}

/**
 * Gebetszeiten eines Tages.
 * @param {{y:number,m:number,d:number}} datum  Kalendertag am Ort (m = 1–12)
 * @param {number} breite  Grad Nord
 * @param {number} laenge  Grad Ost
 * @param {Object<string,number>} [minuten]  Korrektur pro Gebet in Minuten (Standard: Diyanet)
 * @returns {Object<string,number>} Zeitpunkte in ms seit 1970 (UTC), je Gebet-ID
 */
export function berechne(datum, breite, laenge, minuten = DIYANET_MINUTEN) {
  const jd = julianisch(datum.y, datum.m, datum.d) - laenge / 360;
  const mittag = (t) => fixStunde(12 - sonne(jd + t).gleichung);
  const winkelZeit = (winkel, t, vorMittag) => {
    const dekl = sonne(jd + t).deklination;
    const v = arccos((-sin(winkel) - sin(dekl) * sin(breite)) / (cos(dekl) * cos(breite))) / 15;
    return mittag(t) + (vorMittag ? -v : v);
  };

  const t = {
    imsak: winkelZeit(WINKEL.imsak, 5 / 24, true),
    gunes: winkelZeit(WINKEL.horizont, 6 / 24, true),
    ogle: mittag(12 / 24),
    aksam: winkelZeit(WINKEL.horizont, 18 / 24, false),
    yatsi: winkelZeit(WINKEL.yatsi, 18 / 24, false),
  };
  {
    const dekl = sonne(jd + 13 / 24).deklination;
    const winkel = -arccot(1 + tan(Math.abs(breite - dekl)));
    t.ikindi = winkelZeit(winkel, 13 / 24, false);
  }

  // Hohe Breiten (Deutschland im Sommer): Dämmerung erreicht den Winkel nicht oder kommt
  // unplausibel früh/spät → Anteil der Nacht nach Winkel/60 („angle based“).
  const nacht = fixStunde(t.gunes + 24 - t.aksam);
  const diff = (a, b) => fixStunde(b - a);
  const anteilImsak = (WINKEL.imsak / 60) * nacht;
  const anteilYatsi = (WINKEL.yatsi / 60) * nacht;
  if (Number.isNaN(t.imsak) || diff(t.imsak, t.gunes) > anteilImsak) t.imsak = t.gunes - anteilImsak;
  if (Number.isNaN(t.yatsi) || diff(t.aksam, t.yatsi) > anteilYatsi) t.yatsi = t.aksam + anteilYatsi;

  const tag0 = Date.UTC(datum.y, datum.m - 1, datum.d);
  const aus = {};
  for (const g of GEBETE) {
    const stundeUtc = t[g.id] - laenge / 15; // Ortszeit der Sonne → UTC
    aus[g.id] = Math.round(tag0 + stundeUtc * 3600000 + (minuten[g.id] || 0) * 60000);
  }
  return aus;
}

// ---------- Kalendertag und Uhrzeit in einer Zeitzone ----------
export function teile(ms, zone) {
  const o = {};
  for (const p of new Intl.DateTimeFormat("en-US", {
    timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(ms)) o[p.type] = +p.value;
  return o;
}
export const tagVon = (ms, zone) => { const p = teile(ms, zone); return { y: p.year, m: p.month, d: p.day }; };
export const tagSchluessel = (t) => `${t.y}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;
export function tagPlus(t, n) {
  const x = new Date(Date.UTC(t.y, t.m - 1, t.d + n));
  return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() };
}
export function uhrzeit(ms, zone) {
  const p = teile(ms, zone);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

/** Nächstes Gebet ab `jetzt` (heute, sonst İmsak von morgen). */
export function naechstes(jetzt, breite, laenge, zone, minuten) {
  const heute = tagVon(jetzt, zone);
  for (const tag of [heute, tagPlus(heute, 1)]) {
    const z = berechne(tag, breite, laenge, minuten);
    for (const g of GEBETE) if (z[g.id] > jetzt) return { gebet: g, zeit: z[g.id], tag };
  }
  return null;
}

// ---------- Kıble ----------
const KAABA = { breite: 21.4225, laenge: 39.8262 };
/** Richtung nach Mekka in Grad (0 = Norden, im Uhrzeigersinn). */
export function kibleRichtung(breite, laenge) {
  const dl = rad(KAABA.laenge - laenge);
  const p1 = rad(breite), p2 = rad(KAABA.breite);
  return fixWinkel(deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))));
}
/** Entfernung nach Mekka in km. */
export function kibleEntfernung(breite, laenge) {
  const dp = rad(KAABA.breite - breite), dl = rad(KAABA.laenge - laenge);
  const a = Math.sin(dp / 2) ** 2 + Math.cos(rad(breite)) * Math.cos(rad(KAABA.breite)) * Math.sin(dl / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
