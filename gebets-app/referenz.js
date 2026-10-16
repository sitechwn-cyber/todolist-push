// Referenz-Gebetszeiten: die Zeiten der Diyanet (Präsidium für Religiöse Angelegenheiten) über die
// öffentliche Schnittstelle ezanvakti.emushaf.net, die die Diyanet-Tabellen weiterreicht.
// Läuft im Browser (app.js) und bei GitHub (sende.mjs). Ohne Internet oder bei einem Fehler der
// Schnittstelle greift die eigene Berechnung (gebetszeiten.js) – siehe tagesZeiten().
//
// ACHTUNG: Format und Adressen sind nach bestem Wissen umgesetzt, aber noch nicht gegen die echte
// Schnittstelle geprüft (die Cloud-Umgebung konnte sie nicht erreichen). Prüfen auf dem PC mit
// `npm run referenz -- --suche Stuttgart` und `npm run referenz -- <IlceID> referenz/<datei>.csv`.
import { GEBETE, berechne, minutenMit, tagSchluessel, lokalZuMs } from "./gebetszeiten.js";

export const API = "https://ezanvakti.emushaf.net";

const ZEIT = /^\d{1,2}:\d{2}$/;
const FELDER = { imsak: "Imsak", gunes: "Gunes", ogle: "Ogle", ikindi: "Ikindi", aksam: "Aksam", yatsi: "Yatsi" };

/** Antwort von /vakitler/<IlceID> → { "2026-10-15": { imsak: "05:44", gunes: "07:08", … } } */
export function leseVakitler(json) {
  const aus = {};
  if (!Array.isArray(json)) return aus;
  for (const z of json) {
    const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(String(z && z.MiladiTarihKisa || "").trim());
    if (!m) continue;
    const tag = {};
    for (const [id, feld] of Object.entries(FELDER)) {
      const t = String(z[feld] || "").trim();
      if (!ZEIT.test(t)) { tag.kaputt = true; break; }
      tag[id] = t.padStart(5, "0");
    }
    if (!tag.kaputt) aus[`${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`] = tag;
  }
  return aus;
}

async function holeJson(pfad, f = fetch) {
  const r = await f(API + pfad, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`${pfad}: HTTP ${r.status}`);
  return r.json();
}
export const holeVakitler = async (ilceId, f) => leseVakitler(await holeJson(`/vakitler/${encodeURIComponent(ilceId)}`, f));
/** Länder: [{ id, name }] */
export const holeLaender = async (f) => (await holeJson("/ulkeler", f)).map((x) => ({ id: x.UlkeID, name: x.UlkeAdi }));
/** Städte eines Landes: [{ id, name }] */
export const holeStaedte = async (land, f) => (await holeJson(`/sehirler/${encodeURIComponent(land)}`, f)).map((x) => ({ id: x.SehirID, name: x.SehirAdi }));
/** Orte einer Stadt: [{ id, name }] */
export const holeOrte = async (stadt, f) => (await holeJson(`/ilceler/${encodeURIComponent(stadt)}`, f)).map((x) => ({ id: x.IlceID, name: x.IlceAdi }));

/**
 * Zeiten eines Tages (ms, UTC): aus der Referenztabelle, sonst berechnet.
 * @param {object} p
 * @param {{y,m,d}} p.tag
 * @param {string} p.zone      Zeitzone des Ortes
 * @param {number} p.breite    für die Rückfall-Berechnung
 * @param {number} p.laenge
 * @param {Object<string,number>} [p.korrektur]  persönliche Minuten je Gebet (immer obendrauf)
 * @param {Object} [p.tabelle]  Ergebnis von leseVakitler() (oder undefined)
 * @returns {{zeiten:Object<string,number>, quelle:"diyanet"|"berechnet"}}
 */
export function tagesZeiten({ tag, zone, breite, laenge, korrektur = {}, tabelle }) {
  const ref = tabelle && tabelle[tagSchluessel(tag)];
  if (ref) {
    const zeiten = {};
    for (const g of GEBETE) zeiten[g.id] = lokalZuMs(tag, ref[g.id], zone) + (korrektur[g.id] || 0) * 60000;
    return { zeiten, quelle: "diyanet" };
  }
  return { zeiten: berechne(tag, breite, laenge, minutenMit(korrektur)), quelle: "berechnet" };
}
