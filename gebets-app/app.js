import { GEBETE, naechstes, tagVon, tagPlus, tagSchluessel, uhrzeit, kibleRichtung, kibleEntfernung } from "./gebetszeiten.js";
import { tagesZeiten, holeVakitler, holeLaender, holeStaedte, holeOrte } from "./referenz.js";
import { ladeEingebaut } from "./daten/index.js";
import { FIREBASE, VAPID_KEY } from "./config.js";

const $ = (id) => document.getElementById(id);
const TAEGLICH = GEBETE.filter((g) => g.taeglich);

const ORTE = [
  { name: "Waiblingen", lat: 48.83, lon: 9.32, zone: "Europe/Berlin", tabelle: "waiblingen-2026" },
  { name: "Stuttgart", lat: 48.78, lon: 9.18, zone: "Europe/Berlin" },
  { name: "Berlin", lat: 52.52, lon: 13.4, zone: "Europe/Berlin" },
  { name: "Hamburg", lat: 53.55, lon: 10.0, zone: "Europe/Berlin" },
  { name: "München", lat: 48.14, lon: 11.58, zone: "Europe/Berlin" },
  { name: "Köln", lat: 50.94, lon: 6.96, zone: "Europe/Berlin" },
  { name: "Frankfurt", lat: 50.11, lon: 8.68, zone: "Europe/Berlin" },
  { name: "Wien", lat: 48.21, lon: 16.37, zone: "Europe/Vienna" },
  { name: "Zürich", lat: 47.37, lon: 8.54, zone: "Europe/Zurich" },
  { name: "İstanbul", lat: 41.01, lon: 28.98, zone: "Europe/Istanbul" },
  { name: "Ankara", lat: 39.93, lon: 32.86, zone: "Europe/Istanbul" },
  { name: "Mekka", lat: 21.42, lon: 39.83, zone: "Asia/Riyadh" },
  { name: "Medina", lat: 24.47, lon: 39.61, zone: "Asia/Riyadh" },
];

// ---------- Speicher (nur dieses Gerät) ----------
const lesen = (k, ersatz) => { try { return JSON.parse(localStorage.getItem(k)) ?? ersatz; } catch { return ersatz; } };
const schreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* privater Modus */ } };

const standard = () => ({
  ort: ORTE[0], diyanet: null, korrektur: Object.fromEntries(GEBETE.map((g) => [g.id, 0])), vorlauf: 10, erinnerungAn: false,
  gebete: { imsak: true, gunes: false, ogle: true, ikindi: true, aksam: true, yatsi: true },
  id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 24),
});
let S = { ...standard(), ...lesen("gebet.einstellungen", {}) };
S.korrektur = { ...standard().korrektur, ...S.korrektur };
{ const vorgabe = ORTE.find((o) => o.name === S.ort.name && o.lat === S.ort.lat); if (vorgabe) S.ort = vorgabe; } // neue Felder (z. B. eingebaute Tabelle) übernehmen
S.gebete = { ...standard().gebete, ...S.gebete };
const speichern = () => schreiben("gebet.einstellungen", S);
speichern();

let tracker = lesen("gebet.tracker", {});

const toast = (text) => {
  const t = $("toast"); t.textContent = text; t.classList.add("zeigen");
  clearTimeout(toast.z); toast.z = setTimeout(() => t.classList.remove("zeigen"), 3200);
};

// ---------- Tabs ----------
for (const b of document.querySelectorAll(".leiste button")) {
  b.addEventListener("click", () => {
    document.querySelectorAll(".leiste button").forEach((x) => x.classList.toggle("aktiv", x === b));
    document.querySelectorAll(".seite").forEach((s) => s.classList.toggle("aktiv", s.id === "tab-" + b.dataset.tab));
    if (b.dataset.tab === "tracker") zeichneTracker();
  });
}

// ---------- Zeiten ----------
const zone = () => (S.diyanet && S.diyanet.zone) || S.ort.zone;
const ortName = () => (S.diyanet && S.diyanet.name) || S.ort.name;
// Referenztabelle der Diyanet (zuletzt geladen, auch offline nutzbar); fehlt ein Tag → eigene Berechnung
let refTabelle = lesen("gebet.referenz", {});
let refFehler = null;
// Reihenfolge: gewählter Diyanet-Ort → eingebaute Tabelle des Ortes (Waiblingen 2026) → Berechnung
const eingebaut = {};
const tabelle = () => S.diyanet ? (refTabelle.ilce === S.diyanet.ilce ? refTabelle.tage : undefined) : eingebaut[S.ort.tabelle];
async function eingebautLaden() {
  const n = S.ort.tabelle;
  if (!n || eingebaut[n]) return;
  try { eingebaut[n] = await ladeEingebaut(n); zeichneZeiten(); } catch (e) { console.warn("Tabelle", e); }
}
const tagZeiten = (tag) => tagesZeiten({ tag, zone: zone(), breite: S.ort.lat, laenge: S.ort.lon, korrektur: S.korrektur, tabelle: tabelle() });

let tagVersatz = 0; // 0 = heute
const heuteAmOrt = () => tagVon(Date.now(), zone());
const gezeigterTag = () => tagPlus(heuteAmOrt(), tagVersatz);

function zeichneZeiten() {
  const jetzt = Date.now();
  const tag = gezeigterTag();
  const { zeiten: z, quelle } = tagZeiten(tag);
  const nae = naechstes(jetzt, zone(), (t) => tagZeiten(t).zeiten);
  $("ortName").textContent = ortName();
  $("datumText").textContent = new Date(Date.UTC(tag.y, tag.m - 1, tag.d, 12)).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  try {
    $("hidschriText").textContent = new Intl.DateTimeFormat("de-DE-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(tag.y, tag.m - 1, tag.d, 12));
  } catch { $("hidschriText").textContent = ""; }
  $("tagHeute").style.visibility = tagVersatz === 0 ? "hidden" : "visible";

  const schluessel = tagSchluessel(tag);
  const erledigt = tracker[schluessel] || {};
  $("zeitenListe").innerHTML = GEBETE.map((g) => {
    const vorbei = z[g.id] <= jetzt;
    const istNaechstes = nae && nae.gebet.id === g.id && tagSchluessel(nae.tag) === schluessel;
    return `<li class="${vorbei ? "vorbei" : ""} ${istNaechstes ? "jetzt" : ""}">
      <div class="namen"><div class="name">${g.name} <span class="unter">${g.arabisch}</span></div><div class="unter">${g.deutsch}</div></div>
      <div class="zeit">${uhrzeit(z[g.id], zone())}</div>
      <button class="haken ${g.taeglich ? "" : "leer"} ${erledigt[g.id] ? "an" : ""}" data-g="${g.id}" aria-label="${g.name} verrichtet">${erledigt[g.id] ? "✓" : ""}</button>
    </li>`;
  }).join("");
  const fehler = refFehler ? " Die Diyanet-Zeiten konnten nicht geladen werden (" + refFehler + ")." : "";
  $("rechenHinweis").textContent = quelle === "tabelle"
    ? (S.diyanet ? `Quelle: Diyanet (${S.diyanet.name}).${fehler}` : `Quelle: Zeitentabelle ${S.ort.name} 2026 (Semerkand).`)
    : S.diyanet
      ? `Für diesen Tag liegen keine Diyanet-Zeiten vor, die Zeit ist berechnet (Näherung).${fehler}`
      : `Berechnet für ${S.ort.name} (${S.ort.lat.toFixed(2)}° N, ${S.ort.lon.toFixed(2)}° O) – eine Näherung. Genauer: unter „Mehr“ einen Diyanet-Ort wählen.`;
  zeichneNaechstes();
}

function zeichneNaechstes() {
  const nae = naechstes(Date.now(), zone(), (t) => tagZeiten(t).zeiten);
  if (!nae) return;
  $("naechstesName").textContent = nae.gebet.name;
  $("naechstesZeit").textContent = uhrzeit(nae.zeit, zone());
  const rest = Math.max(0, Math.round((nae.zeit - Date.now()) / 1000));
  const h = Math.floor(rest / 3600), m = Math.floor((rest % 3600) / 60), s = rest % 60;
  $("naechstesRest").textContent = `in ${h ? h + " Std " : ""}${String(m).padStart(h ? 2 : 1, "0")} Min ${String(s).padStart(2, "0")} Sek`;
}

$("zeitenListe").addEventListener("click", (e) => {
  const b = e.target.closest(".haken");
  if (b && b.dataset.g) umschalten(tagSchluessel(gezeigterTag()), b.dataset.g);
});
$("tagZurueck").onclick = () => { tagVersatz--; zeichneZeiten(); };
$("tagVor").onclick = () => { tagVersatz++; zeichneZeiten(); };
$("tagHeute").onclick = () => { tagVersatz = 0; zeichneZeiten(); };

// ---------- Tracker ----------
function umschalten(tag, id) {
  tracker[tag] = { ...(tracker[tag] || {}) };
  if (tracker[tag][id]) delete tracker[tag][id]; else tracker[tag][id] = true;
  if (!Object.keys(tracker[tag]).length) delete tracker[tag];
  schreiben("gebet.tracker", tracker);
  zeichneZeiten(); zeichneTracker();
}
const anzahl = (tag) => TAEGLICH.filter((g) => (tracker[tagSchluessel(tag)] || {})[g.id]).length;

function zeichneTracker() {
  const heute = heuteAmOrt();
  const tage = Array.from({ length: 7 }, (_, i) => tagPlus(heute, -i));
  $("trkHeute").textContent = `${anzahl(heute)}/5`;
  let serie = 0, start = anzahl(heute) === 5 ? 0 : 1;
  for (let i = start; i < 400; i++) { if (anzahl(tagPlus(heute, -i)) === 5) serie++; else break; }
  $("trkSerie").textContent = serie;
  const summe = tage.reduce((a, t) => a + anzahl(t), 0);
  $("trkWoche").textContent = Math.round((summe / 35) * 100) + "%";
  const name = (t, i) => i === 0 ? "Heute" : i === 1 ? "Gestern"
    : new Date(Date.UTC(t.y, t.m - 1, t.d, 12)).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });
  $("trkRaster").innerHTML = `<div class="zeile kopfz"><span></span>${TAEGLICH.map((g) => `<span>${g.name}</span>`).join("")}</div>`
    + tage.map((t, i) => `<div class="zeile"><span class="tag">${name(t, i)}</span>${TAEGLICH.map((g) => {
      const an = (tracker[tagSchluessel(t)] || {})[g.id];
      return `<button class="punkt ${an ? "an" : ""}" data-t="${tagSchluessel(t)}" data-g="${g.id}" aria-label="${g.name}">${an ? "✓" : ""}</button>`;
    }).join("")}</div>`).join("");
}
$("trkRaster").addEventListener("click", (e) => {
  const b = e.target.closest(".punkt");
  if (b) umschalten(b.dataset.t, b.dataset.g);
});

// ---------- Kıble ----------
function zeichneKible() {
  const grad = kibleRichtung(S.ort.lat, S.ort.lon);
  $("kibleGrad").textContent = Math.round(grad) + "°";
  $("kibleText").textContent = `Richtung Kaaba ab ${S.ort.name} · ${Math.round(kibleEntfernung(S.ort.lat, S.ort.lon)).toLocaleString("de-DE")} km`;
  setzeKompass(null);
}
let kAnzeige = { rose: 0, zeiger: 0 }, kTreffer = false, kGlatt = null;
const kleinsterWeg = (von, nach) => von + ((((nach - von) % 360) + 540) % 360) - 180;
function setzeKompass(heading) {
  const kible = kibleRichtung(S.ort.lat, S.ort.lon);
  const h = heading ?? 0;
  kAnzeige.rose = kleinsterWeg(kAnzeige.rose, -h);
  kAnzeige.zeiger = kleinsterWeg(kAnzeige.zeiger, kible - h);
  $("kompassRose").style.transform = `rotate(${kAnzeige.rose}deg)`;
  $("kibleZeiger").style.transform = `rotate(${kAnzeige.zeiger}deg)`;
  const treffer = heading !== null && Math.abs(((kible - h + 540) % 360) - 180) < 4;
  $("kompass").classList.toggle("treffer", treffer);
  if (treffer && !kTreffer && navigator.vibrate) navigator.vibrate(60);
  kTreffer = treffer;
}
function beiAusrichtung(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading;
  else if (e.alpha != null && (e.absolute || e.type === "deviceorientationabsolute")) h = 360 - e.alpha;
  if (h === null) return;
  // Glätten (Kreis-Mittel), sonst zittert die Nadel
  kGlatt = kGlatt === null ? h : kleinsterWeg(kGlatt, h) * 0.25 + kGlatt * 0.75;
  setzeKompass(((kGlatt % 360) + 360) % 360);
}
$("kompassStart").onclick = async () => {
  try {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      if ((await DeviceOrientationEvent.requestPermission()) !== "granted") { toast("Kompass-Zugriff abgelehnt"); return; }
    }
    window.addEventListener("deviceorientationabsolute", beiAusrichtung, true);
    window.addEventListener("deviceorientation", beiAusrichtung, true);
    $("kompassStart").style.display = "none";
    setTimeout(() => { if (kGlatt === null) toast("Dieses Gerät meldet keinen Kompass. Nutze die Gradzahl oben."); }, 2500);
  } catch { toast("Kompass nicht verfügbar"); }
};

// ---------- Einstellungen ----------
function zeichneEinstellungen() {
  const optionen = ORTE.map((o, i) => `<option value="${i}">${o.name}</option>`);
  const eigen = !ORTE.some((o) => o.name === S.ort.name);
  if (eigen) optionen.unshift(`<option value="eigen">${S.ort.name}</option>`);
  $("ortAuswahl").innerHTML = optionen.join("");
  $("ortAuswahl").value = eigen ? "eigen" : String(ORTE.findIndex((o) => o.name === S.ort.name));
  $("vorlauf").value = String(S.vorlauf);
  $("erinnerungGebete").innerHTML = GEBETE.map((g) => `<label><input type="checkbox" data-g="${g.id}" ${S.gebete[g.id] ? "checked" : ""}> ${g.name}</label>`).join("");
  $("minutenFelder").innerHTML = GEBETE.map((g) => `<label>${g.name}<input type="number" step="1" min="-30" max="30" data-g="${g.id}" value="${S.korrektur[g.id] || 0}"></label>`).join("");
  $("dStatus").textContent = S.diyanet ? `Aktiv: ${S.diyanet.name}` : "Kein Diyanet-Ort gewählt – es gilt die Semerkand-Tabelle bzw. die Berechnung.";
  $("dEntfernen").style.display = S.diyanet ? "block" : "none";
  zeichnePushStatus();
}
$("ortAuswahl").onchange = (e) => {
  if (e.target.value === "eigen") return;
  S.ort = ORTE[+e.target.value]; eingebautLaden(); aenderung(); // Diyanet-Ort bleibt (andere Zeitzone/Ort nur für Kıble und Rückfall)
};
$("gpsKnopf").onclick = () => {
  if (!navigator.geolocation) { $("gpsHinweis").textContent = "Standort wird von diesem Gerät nicht unterstützt."; return; }
  $("gpsHinweis").textContent = "Standort wird ermittelt …";
  navigator.geolocation.getCurrentPosition((p) => {
    S.ort = { name: "Mein Standort", lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), zone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    $("gpsHinweis").textContent = "";
    aenderung(); zeichneEinstellungen();
  }, (f) => { $("gpsHinweis").textContent = f.code === 1 ? "Standortzugriff wurde abgelehnt. Wähle eine Stadt aus der Liste." : "Standort konnte nicht ermittelt werden."; }, { timeout: 15000, maximumAge: 600000 });
};
$("vorlauf").onchange = (e) => { S.vorlauf = +e.target.value; aenderung(); };
$("erinnerungGebete").addEventListener("change", (e) => { if (e.target.dataset.g) { S.gebete[e.target.dataset.g] = e.target.checked; aenderung(); } });
$("minutenFelder").addEventListener("change", (e) => {
  if (e.target.dataset.g) { S.korrektur[e.target.dataset.g] = Math.max(-30, Math.min(30, Math.round(+e.target.value) || 0)); aenderung(); }
});
$("minutenZurueck").onclick = () => { S.korrektur = { ...standard().korrektur }; aenderung(); zeichneEinstellungen(); };

// ---------- Diyanet-Ort wählen und Referenzzeiten laden ----------
const ZONEN = { "ALMANYA": "Europe/Berlin", "TÜRKİYE": "Europe/Istanbul", "TURKIYE": "Europe/Istanbul", "AVUSTURYA": "Europe/Vienna", "İSVİÇRE": "Europe/Zurich", "HOLLANDA": "Europe/Amsterdam", "FRANSA": "Europe/Paris", "BELÇİKA": "Europe/Brussels", "İNGİLTERE": "Europe/London", "SUUDİ ARABİSTAN": "Asia/Riyadh" };
async function liste(art, id) {
  const k = `gebet.liste.${art}.${id ?? ""}`;
  const c = lesen(k, null);
  if (c && c.length) return c;
  const l = art === "land" ? await holeLaender() : art === "stadt" ? await holeStaedte(id) : await holeOrte(id);
  schreiben(k, l);
  return l;
}
const fuelle = (sel, l, leer) => { $(sel).innerHTML = `<option value="">${leer}</option>` + l.map((x) => `<option value="${x.id}">${x.name}</option>`).join(""); };
const gewaehlt = (sel) => { const o = $(sel).selectedOptions[0]; return o && o.value ? { id: o.value, name: o.textContent } : null; };
async function diyanetFuellen(stufe) {
  try {
    $("dStatus").textContent = "Lade Liste …";
    if (stufe === "land") {
      const l = await liste("land");
      fuelle("dLand", l, "Land wählen");
      const de = l.find((x) => /^almanya$/i.test(x.name));
      if (de) { $("dLand").value = de.id; await diyanetFuellen("stadt"); return; }
    } else if (stufe === "stadt") {
      const land = gewaehlt("dLand");
      fuelle("dStadt", land ? await liste("stadt", land.id) : [], "Stadt wählen"); fuelle("dOrt", [], "Ort wählen");
    } else {
      const stadt = gewaehlt("dStadt");
      fuelle("dOrt", stadt ? await liste("ort", stadt.id) : [], "Ort wählen");
    }
    zeichneEinstellungen();
  } catch (e) {
    $("dStatus").textContent = "Die Diyanet-Liste konnte nicht geladen werden (" + (e.message || e) + "). Internet nötig.";
  }
}
$("dLand").onchange = () => diyanetFuellen("stadt");
$("dStadt").onchange = () => diyanetFuellen("ort");
$("dOrt").onchange = async () => {
  const ort = gewaehlt("dOrt"), land = gewaehlt("dLand"), stadt = gewaehlt("dStadt");
  if (!ort) return;
  const name = stadt && stadt.name !== ort.name ? `${stadt.name} · ${ort.name}` : ort.name;
  S.diyanet = { ilce: +ort.id, name, zone: ZONEN[(land.name || "").toLocaleUpperCase("tr")] || Intl.DateTimeFormat().resolvedOptions().timeZone };
  speichern(); zeichneEinstellungen(); tagVersatz = 0;
  await referenzLaden(true); syncGeraet();
};
$("dEntfernen").onclick = () => { S.diyanet = null; speichern(); zeichneEinstellungen(); zeichneZeiten(); syncGeraet(); };
let dGeladen = false;
$("dLand").addEventListener("focus", () => { if (!dGeladen) { dGeladen = true; diyanetFuellen("land"); } }, { once: true });

async function referenzLaden(erzwingen = false) {
  if (!S.diyanet) { refFehler = null; return; }
  const frisch = refTabelle.ilce === S.diyanet.ilce && Date.now() - (refTabelle.abgerufen || 0) < 6 * 3600000;
  if (frisch && !erzwingen) return;
  try {
    const tage = await holeVakitler(S.diyanet.ilce);
    if (!Object.keys(tage).length) throw new Error("keine Zeiten erhalten");
    refTabelle = { ilce: S.diyanet.ilce, abgerufen: Date.now(), tage };
    schreiben("gebet.referenz", refTabelle);
    refFehler = null;
  } catch (e) { refFehler = e.message || String(e); }
  zeichneZeiten();
}

function aenderung() {
  speichern(); zeichneZeiten(); zeichneKible(); syncGeraet();
}

// ---------- Push (Firebase) & lokale Erinnerung ----------
const pushKonfiguriert = !!(FIREBASE.apiKey && FIREBASE.databaseURL && VAPID_KEY);
let fb = null; // { db, messaging, token }
const istIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const installiert = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

const skript = (src) => new Promise((ok, fehler) => {
  const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = fehler; document.head.appendChild(s);
});
async function firebaseLaden() {
  if (fb) return fb;
  const v = "10.14.1";
  for (const n of ["app", "database", "messaging"]) await skript(`https://www.gstatic.com/firebasejs/${v}/firebase-${n}-compat.js`);
  if (!firebase.messaging.isSupported()) throw new Error("Push wird von diesem Browser nicht unterstützt");
  firebase.initializeApp(FIREBASE);
  fb = { db: firebase.database(), messaging: firebase.messaging(), token: null };
  return fb;
}
async function syncGeraet() {
  if (!fb || !fb.token) return;
  try {
    await fb.db.ref("geraete/" + S.id).set({
      token: fb.token,
      lat: +S.ort.lat.toFixed(2), lon: +S.ort.lon.toFixed(2), zone: S.ort.zone,
      vorlauf: S.vorlauf, gebete: S.gebete, korrektur: S.korrektur, aktualisiert: Date.now(),
      ...(S.ort.tabelle ? { tabelle: S.ort.tabelle } : {}),
      ...(S.diyanet ? { diyanet: { ilce: S.diyanet.ilce, zone: S.diyanet.zone } } : {}),
    });
  } catch (e) { console.warn("Sync fehlgeschlagen", e); }
}
async function tokenHolen() {
  const f = await firebaseLaden();
  const reg = await navigator.serviceWorker.ready;
  f.token = await f.messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
  await syncGeraet();
}

function zeichnePushStatus() {
  const b = $("pushKnopf"), h = $("pushHinweis");
  b.textContent = S.erinnerungAn ? "🔕 Erinnerungen ausschalten" : "🔔 Erinnerungen einschalten";
  b.classList.toggle("zweit", S.erinnerungAn);
  const teile = [];
  if (istIos && !installiert) teile.push("Auf dem iPhone zuerst über Teilen → „Zum Home-Bildschirm“ installieren, dann hier einschalten.");
  if (!("Notification" in window)) teile.push("Dieser Browser kann keine Benachrichtigungen zeigen.");
  else if (Notification.permission === "denied") teile.push("Benachrichtigungen sind in den Browser-Einstellungen gesperrt.");
  if (S.erinnerungAn) teile.push(pushKonfiguriert ? "Erinnerungen kommen auch bei geschlossener App." : "Push-Versand ist noch nicht eingerichtet: Erinnerungen kommen nur, solange die App geöffnet ist.");
  h.textContent = teile.join(" ");
}
$("pushKnopf").onclick = async () => {
  try {
    if (S.erinnerungAn) {
      S.erinnerungAn = false; speichern();
      if (fb) { try { await fb.db.ref("geraete/" + S.id).remove(); await fb.messaging.deleteToken(); } catch { /* egal */ } fb.token = null; }
      zeichnePushStatus(); return;
    }
    if (!("Notification" in window)) { toast("Benachrichtigungen werden nicht unterstützt"); return; }
    if ((await Notification.requestPermission()) !== "granted") { toast("Erlaubnis nicht erteilt"); zeichnePushStatus(); return; }
    S.erinnerungAn = true; speichern();
    if (pushKonfiguriert) await tokenHolen();
    toast("Erinnerungen sind an");
    zeichnePushStatus();
  } catch (e) {
    console.warn(e); S.erinnerungAn = !!(fb && fb.token); speichern();
    toast("Einschalten fehlgeschlagen: " + (e.message || e)); zeichnePushStatus();
  }
};

// Rückfall ohne Push-Server: nur bei geöffneter App
const lokalGemeldet = new Set();
async function lokalPruefen() {
  if (!S.erinnerungAn || (fb && fb.token) || !("Notification" in window) || Notification.permission !== "granted") return;
  const jetzt = Date.now();
  const heute = heuteAmOrt();
  for (const tag of [heute, tagPlus(heute, 1)]) {
    const z = tagZeiten(tag).zeiten;
    for (const g of GEBETE) {
      if (!S.gebete[g.id]) continue;
      const faellig = z[g.id] - S.vorlauf * 60000;
      const schluessel = tagSchluessel(tag) + g.id;
      if (jetzt >= faellig && jetzt <= z[g.id] + 10 * 60000 && !lokalGemeldet.has(schluessel)) {
        lokalGemeldet.add(schluessel);
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(`🕌 ${g.name}`, {
          body: S.vorlauf > 0 ? `${g.name} in ${S.vorlauf} Minuten (${uhrzeit(z[g.id], zone())})` : `${g.name}-Zeit ist da (${uhrzeit(z[g.id], zone())})`,
          tag: "gebet-" + schluessel, icon: "icons/icon-192.png", badge: "icons/icon-192.png",
        });
      }
    }
  }
}

// ---------- Start ----------
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch((e) => console.warn("sw", e));
document.querySelectorAll(".k-striche").forEach((g) => {
  g.innerHTML = Array.from({ length: 36 }, (_, i) => `<line x1="0" y1="-100" x2="0" y2="${i % 9 === 0 ? -94 : -97}" transform="rotate(${i * 10})"/>`).join("");
});
zeichneEinstellungen(); zeichneZeiten(); zeichneKible(); zeichneTracker();
referenzLaden(); eingebautLaden();
if (S.erinnerungAn && pushKonfiguriert && "Notification" in window && Notification.permission === "granted") tokenHolen().catch((e) => console.warn(e));

let letzterTag = tagSchluessel(heuteAmOrt());
setInterval(() => {
  const t = tagSchluessel(heuteAmOrt());
  if (t !== letzterTag) { letzterTag = t; zeichneZeiten(); zeichneTracker(); } else zeichneNaechstes();
  lokalPruefen();
}, 1000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) { referenzLaden(); zeichneZeiten(); lokalPruefen(); } });
