// Döner-Push: reine Planungslogik (ohne Datenbank, ohne Versand) – dadurch testbar.
// Wird von sende-doener.mjs benutzt, geprüft von test-doener.mjs.
//
// Eingabe:  orders        orders/<id> der Döner-App (status offen|fertig, zeit ISO, uid, nummer, nrKey, name, bestellart, items)
//           geraete       pushgeraete/doener/<id> = { token, rolle: personal|kunde, uid, bestellung? }
//           staff         staff/doener/<uid> (wer Mitarbeiter ist)
//           gesendet      push/gesendet/<orderId> = { neu?: true, fertig?: true } (Merkzettel dieses Versenders)
//           jetzt         Zeit in ms
// Ausgabe:  nachrichten   [{ titel, text, tag, ziele: [{ id, token }] }]
//           merken        { "<orderId>/neu": true, ... }  (null = Eintrag löschen)
//           entfernen     [geraeteId, ...]  Geräte, die nicht mehr gebraucht werden

export const HOECHSTENS_ALT = 3 * 3600000; // Ältere Bestellungen werden nicht mehr gemeldet

const nummer = (o) => String(o.nrKey || o.nummer || "?").replace(/^0+(?=\d)/, "");

export function plane({ orders, geraete, staff, gesendet, jetzt }) {
  const nachrichten = [], merken = {}, entfernen = new Set();
  const personal = Object.entries(geraete || {}).filter(([, g]) => g && g.rolle === "personal" && g.token).map(([id, g]) => ({ id, token: g.token }));

  for (const [id, o] of Object.entries(orders || {})) {
    if (!o) continue;
    const g = (gesendet || {})[id] || {};
    const alter = jetzt - (Date.parse(o.zeit) || 0);

    // 1) Neue Bestellung eines KUNDEN -> alle Mitarbeiter und Admins
    //    (Bestellungen, die Mitarbeiter selbst an der Theke eingeben, melden sich nicht)
    if (o.status === "offen" && !g.neu && alter <= HOECHSTENS_ALT && o.uid && !(staff || {})[o.uid]) {
      const art = o.bestellart === "mitnehmen" ? "Mitnehmen" : "Vor Ort";
      const n = Array.isArray(o.items) ? o.items.length : 0;
      nachrichten.push({
        titel: `🛎️ Neue Bestellung Nr. ${nummer(o)}`,
        text: `${o.name || "Kunde"} · ${o.kunde || ""} · ${art} · ${n} Artikel`.replace(/ · +·/g, " ·"),
        tag: "neu-" + id, ziele: personal,
      });
      merken[`${id}/neu`] = true;
    }

    // 2) Bestellung ist fertig -> der Kunde, der sie aufgegeben hat
    if (o.status === "fertig" && !g.fertig) {
      const ziele = Object.entries(geraete || {}).filter(([, d]) => d && d.rolle === "kunde" && d.bestellung === id && d.token).map(([gid, d]) => ({ id: gid, token: d.token }));
      if (ziele.length) {
        nachrichten.push({ titel: "✅ Ihre Bestellung ist fertig", text: `Nr. ${nummer(o)} ist fertig – bitte abholen.`, tag: "fertig-" + id, ziele });
        ziele.forEach((z) => entfernen.add(z.id)); // einmalige Adresse, danach nicht mehr nötig
      }
      merken[`${id}/fertig`] = true;
    }
  }

  // Geräte von Bestellungen, die es nicht mehr gibt (Tagesabschluss, Storno), aufräumen
  for (const [gid, d] of Object.entries(geraete || {})) {
    if (d && d.rolle === "kunde" && !(orders || {})[d.bestellung]) entfernen.add(gid);
  }
  // Merkzettel gelöschter Bestellungen entfernen
  for (const id of Object.keys(gesendet || {})) if (!(orders || {})[id]) merken[id] = null;

  return { nachrichten, merken, entfernen: [...entfernen] };
}
