// Liest die Euro-Tabelle „Almanya Altın €“ von canlialtinfiyatlari.com/altin/almanya.
// Jede Zeile hat zwei Felder mit festen Kennungen: <ID>_ALIS (Ankauf) und <ID> (Verkauf).
// Wird die Seite umgebaut oder sehen die Zahlen unplausibel aus, wirft die Funktion einen Fehler –
// dann bleibt der letzte gute Stand online (der Zweig „daten“ wird nicht überschrieben).

const FELDER = {
  ons: "XAUEUR",          // Feinunze in Euro
  gram: "GRAMEUR",        // Gram Gold (24 Karat)
  ceyrek: "CEYREKKEUR",
  yarim: "YARIMEUR",
  tam: "TAMEUR",
  resat: "RESATEUR",
  cumhuriyet: "ATAEUR",
  a22: "AYAR22EUR",       // 22 Ayar je Gramm
  a18: "AYAR18EUR",
  a14: "AYAR14EUR",
};

function zahl(html, id) {
  const m = html.match(new RegExp('<td id="' + id + '">\s*([0-9]+(?:\.[0-9]+)?)\s*</td>'));
  if (!m) throw new Error("Feld fehlt: " + id);
  return Number(m[1]);
}

export function parsePreise(html) {
  const preise = {};
  for (const [name, id] of Object.entries(FELDER)) {
    preise[name] = { a: zahl(html, id + "_ALIS"), s: zahl(html, id) };
  }
  // Plausibilität
  for (const [n, p] of Object.entries(preise)) {
    if (!(p.a > 0 && p.s > 0)) throw new Error("Preis ungültig: " + n);
    if (p.a > p.s * 1.001) throw new Error("Ankauf über Verkauf: " + n);
    if (p.a < p.s * 0.9) throw new Error("Spanne unplausibel: " + n);
  }
  const { ons, gram, a22, a18, a14, ceyrek } = preise;
  if (ons.s < 500 || ons.s > 20000) throw new Error("Unzenpreis unplausibel");
  const proGramAusOns = ons.s / 31.1035;
  if (Math.abs(gram.s / proGramAusOns - 1) > 0.05) throw new Error("Gramm und Unze passen nicht zusammen");
  if (Math.abs(a22.s / gram.s - 0.9167) > 0.06) throw new Error("22 Ayar unplausibel");
  if (Math.abs(a18.s / gram.s - 0.75) > 0.06) throw new Error("18 Ayar unplausibel");
  if (Math.abs(a14.s / gram.s - 0.5833) > 0.06) throw new Error("14 Ayar unplausibel");
  if (Math.abs(ceyrek.s / (1.75 * 0.916 * gram.s) - 1) > 0.08) throw new Error("Çeyrek unplausibel");
  const st = html.match(/Son G[^<\n]{3,60}/);
  return {
    quelle: "canlialtinfiyatlari.com/altin/almanya",
    waehrung: "EUR",
    seite_stand: st ? st[0].trim() : "",
    preise,
  };
}
