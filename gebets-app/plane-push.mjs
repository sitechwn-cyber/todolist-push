// Entscheidet, welche Gebets-Erinnerungen jetzt fällig sind. Reine Funktion (ohne Firebase),
// damit sie ohne Zugang getestet werden kann (test-plane.mjs). Genutzt von sende.mjs.
import { GEBETE, DIYANET_MINUTEN, berechne, tagVon, tagPlus, tagSchluessel, uhrzeit } from "./gebetszeiten.js";

// So lange nach der Gebetszeit wird eine verpasste Erinnerung noch nachgeholt (GitHub-Aussetzer).
const NACHHOL_MS = 15 * 60000;

/**
 * @param {{geraete:Object, gesendet:Object, jetzt:number}} p
 *   geraete  = Datenbank geraete/ { <id>: {token, lat, lon, zone, vorlauf, gebete, minuten} }
 *   gesendet = Datenbank push/gesendet/ { <id>: { "<datum>-<gebet>": true } }
 * @returns {{nachrichten:Array, merken:Object, entfernen:string[]}}
 */
export function plane({ geraete, gesendet, jetzt }) {
  const nachrichten = [], merken = {};
  for (const [id, g] of Object.entries(geraete || {})) {
    if (!g || typeof g.token !== "string" || !g.token || !Number.isFinite(g.lat) || !Number.isFinite(g.lon)) continue;
    const zone = typeof g.zone === "string" ? g.zone : "Europe/Berlin";
    let heute;
    try { heute = tagVon(jetzt, zone); } catch { continue; } // ungültige Zeitzone
    const vorlauf = Number.isFinite(g.vorlauf) ? Math.max(0, Math.min(60, g.vorlauf)) : 10;
    const minuten = { ...DIYANET_MINUTEN, ...(g.minuten || {}) };
    const schon = (gesendet || {})[id] || {};
    for (const tag of [heute, tagPlus(heute, 1)]) {
      const z = berechne(tag, g.lat, g.lon, minuten);
      for (const gebet of GEBETE) {
        if (!(g.gebete || {})[gebet.id] || !Number.isFinite(z[gebet.id])) continue;
        const key = `${tagSchluessel(tag)}-${gebet.id}`;
        const faellig = z[gebet.id] - vorlauf * 60000;
        if (jetzt < faellig || jetzt > z[gebet.id] + NACHHOL_MS || schon[key]) continue;
        const um = uhrzeit(z[gebet.id], zone);
        nachrichten.push({
          id, token: g.token, tag: "gebet-" + key,
          titel: `🕌 ${gebet.name}`,
          text: vorlauf > 0 ? `${gebet.name} in ${vorlauf} Minuten (${um})` : `${gebet.name}-Zeit ist da (${um})`,
        });
        merken[`${id}/${key}`] = true;
      }
    }
    // Merkzettel aufräumen: Einträge älter als gestern
    const grenze = tagSchluessel(tagPlus(heute, -1));
    for (const key of Object.keys(schon)) if (key.slice(0, 10) < grenze) merken[`${id}/${key}`] = null;
  }
  // Merkzettel von Geräten, die es nicht mehr gibt
  for (const id of Object.keys(gesendet || {})) if (!(geraete || {})[id]) merken[id] = null;
  return { nachrichten, merken };
}
