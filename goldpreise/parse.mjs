// Liest die Euro-Tabelle „Altin Fiyatlari Euro“ von altineuro.com (Ankauf = ALIŞ, Verkauf = SATIŞ).
// Die Seite enthält danach eine zweite Tabelle mit denselben Namen in Lira – es zählt nur das erste
// Vorkommen jeder Zeile (Euro steht oben); Plausibilitätsprüfungen fangen ein Vertauschen ab.
// Wird die Seite umgebaut oder sehen die Zahlen unplausibel aus, wirft die Funktion einen Fehler –
// dann bleibt der letzte gute Stand online (der Zweig „daten“ wird nicht überschrieben).

const ZEILEN = {
  gram: "Gram Altın (24K)",
  ceyrek: "Çeyrek Altın",
  yarim: "Yarım Altın",
  tam: "Tam Altın",
  gremse: "2.5 Altın (Gremse)",
  resat: "Reşat Altın",
  hamit: "Hamit Altın",
  cumhuriyet: "Cumhuriyet Altını (ATA)",
  a22: "22 Ayar Bilezik (g)",
  a18: "18 Ayar Altın (g)",
  a14: "14 Ayar Altın (g)",
};

export function parsePreise(html) {
  const gefunden = new Map();
  for (const m of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const tds = [...m[1].matchAll(/<td[^>]*>\s*([^<]*?)\s*<\/td>/g)].map((x) => x[1]);
    if (tds.length < 3) continue;
    const name = tds[0];
    if (gefunden.has(name)) continue; // zweites Vorkommen = Lira-Tabelle
    const a = Number(tds[1]), s = Number(tds[2]);
    if (Number.isFinite(a) && Number.isFinite(s)) gefunden.set(name, { a, s });
  }
  const preise = {};
  for (const [key, name] of Object.entries(ZEILEN)) {
    const p = gefunden.get(name);
    if (!p) throw new Error("Zeile fehlt: " + name);
    preise[key] = p;
  }
  // Plausibilität
  for (const [n, p] of Object.entries(preise)) {
    if (!(p.a > 0 && p.s > 0)) throw new Error("Preis ungültig: " + n);
    if (p.a > p.s * 1.001) throw new Error("Ankauf über Verkauf: " + n);
    if (p.a < p.s * 0.85) throw new Error("Spanne unplausibel: " + n);
  }
  const { gram, a22, a18, a14, ceyrek, cumhuriyet, tam } = preise;
  if (gram.s < 10 || gram.s > 1000) throw new Error("Grammpreis unplausibel (Lira-Tabelle erwischt?)");
  if (Math.abs(a22.s / gram.s - 0.9167) > 0.06) throw new Error("22 Ayar unplausibel");
  if (Math.abs(a18.s / gram.s - 0.75) > 0.06) throw new Error("18 Ayar unplausibel");
  if (Math.abs(a14.s / gram.s - 0.5833) > 0.06) throw new Error("14 Ayar unplausibel");
  if (Math.abs(ceyrek.a / (1.75 * 0.916 * gram.a) - 1) > 0.15) throw new Error("Çeyrek unplausibel");
  if (Math.abs(tam.a / (7.01 * 0.916 * gram.a) - 1) > 0.15) throw new Error("Tam unplausibel");
  if (Math.abs(cumhuriyet.a / (7.21 * 0.916 * gram.a) - 1) > 0.15) throw new Error("Cumhuriyet unplausibel");
  const st = html.match(/<small>([^<]*\(TRS\))<\/small>/);
  return {
    quelle: "altineuro.com",
    waehrung: "EUR",
    seite_stand: st ? st[1].trim() : "",
    preise,
  };
}
