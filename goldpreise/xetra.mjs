// Xetra-Gold (Deutsche Börse, ISIN DE000A0S9GB0): 1 Stück ≈ 1 Gramm Gold, Kurs in Euro.
// Die Schnittstelle der Börse Frankfurt liefert einen Datenstrom (text/event-stream); wir brauchen nur die erste Zeile "data:{…}".
// Fehlt etwas oder ist es unplausibel, wirft die Funktion – dann bleibt der letzte gute Stand online.

export const ISIN = "DE000A0S9GB0";
export const URL_XETRA = "https://api.boerse-frankfurt.de/v1/data/price_information?isin=" + ISIN + "&mic=XETR";

export function parseDatenstrom(text) {
  const zeile = String(text).split("\n").find((l) => l.startsWith("data:"));
  if (!zeile) throw new Error("Keine Datenzeile von der Börse");
  const d = JSON.parse(zeile.slice(5));
  if (d.isin !== ISIN) throw new Error("Falsches Wertpapier: " + d.isin);
  if (d.currency && d.currency.originalValue && d.currency.originalValue !== "EUR") throw new Error("Währung nicht Euro");
  const last = Number(d.lastPrice);
  if (!(last > 20 && last < 1000)) throw new Error("Kurs unplausibel: " + d.lastPrice);
  if (!d.timestampLastPrice || Number.isNaN(Date.parse(d.timestampLastPrice))) throw new Error("Kein Zeitstempel");
  return {
    last,
    zeit: d.timestampLastPrice,
    vortag: Number(d.closingPricePrevTradingDay) || null,
    hoch: Number(d.dayHigh) || null,
    tief: Number(d.dayLow) || null,
  };
}

export async function holeXetra() {
  const res = await fetch(URL_XETRA, {
    headers: { Accept: "text/event-stream", "User-Agent": "SiTech-Goldmarkt/1.0 (private Nutzung, 1 Abruf je 15 Min.)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error("Börse antwortet mit " + res.status);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let puffer = "";
  while (!/\ndata:.*\n/.test("\n" + puffer)) {
    const { done, value } = await reader.read();
    if (done) break;
    puffer += dec.decode(value, { stream: true });
    if (puffer.length > 200000) break;
  }
  await reader.cancel().catch(() => {});
  return parseDatenstrom(puffer);
}
