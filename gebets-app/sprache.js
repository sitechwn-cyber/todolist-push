// Sprachen der App: Deutsch (de) und Türkisch (tr). Neue Texte immer in BEIDEN Sprachen eintragen –
// `npm test` prüft, dass jeder deutsche Schlüssel auch auf Türkisch vorhanden ist.
// Gebetsnamen (İmsak, Güneş …) sind in beiden Sprachen türkisch und stehen in gebetszeiten.js.

export const TEXTE = {
  de: {
    "app.titel": "Gebetszeiten",
    "kopf.heute": "Heute", "kopf.zurueck": "Vorheriger Tag", "kopf.vor": "Nächster Tag", "kopf.sprache": "Auf Türkisch umstellen",
    "nav.zeiten": "Zeiten", "nav.kible": "Kıble", "nav.kalender": "Kalender", "nav.tracker": "Tracker", "nav.mehr": "Mehr",

    "g.imsak": "Morgendämmerung", "g.gunes": "Sonnenaufgang", "g.ogle": "Mittag", "g.ikindi": "Nachmittag", "g.aksam": "Sonnenuntergang", "g.yatsi": "Nacht",
    "z.naechstes": "Nächstes Gebet",
    "z.rest": "in {zeit}", "z.std": "Std", "z.min": "Min", "z.sek": "Sek",
    "z.verrichtet": "{name} verrichtet",
    "z.quelleDiyanet": "Quelle: Diyanet ({ort}).{fehler}",
    "z.quelleTabelle": "Quelle: Zeitentabelle {ort} 2026 (Semerkand).",
    "z.keineDiyanet": "Für diesen Tag liegen keine Diyanet-Zeiten vor, die Zeit ist berechnet (Näherung).{fehler}",
    "z.berechnet": "Berechnet für {ort} ({breite}° N, {laenge}° O) – eine Näherung. Genauer: unter „Mehr“ einen Diyanet-Ort wählen.",
    "z.diyanetFehler": " Die Diyanet-Zeiten konnten nicht geladen werden ({grund}).",

    "k.kompassStart": "Kompass einschalten",
    "k.hinweis": "Halte das Handy flach und weit weg von Metall und Magneten. Ist der Pfeil oben und grün, schaust du Richtung Kaaba.",
    "k.text": "Richtung Kaaba ab {ort} · {km} km",
    "k.abgelehnt": "Kompass-Zugriff abgelehnt", "k.keinSensor": "Dieses Gerät meldet keinen Kompass. Nutze die Gradzahl oben.", "k.nichtVerfuegbar": "Kompass nicht verfügbar",

    "t.heute": "heute", "t.serie": "Tage in Folge", "t.woche": "letzte 7 Tage", "t.gestern": "Gestern", "t.heuteGross": "Heute",
    "t.hinweis": "Tippe auf einen Punkt, um ein Gebet nachzutragen. Die Daten bleiben nur auf diesem Gerät.",

    "c.titel": "Islamischer Kalender",
    "c.vorMonat": "Vorheriger Monat", "c.nachMonat": "Nächster Monat", "c.heute": "Heute",
    "c.freitag": "Freitag (Cuma) – Tag des Freitagsgebets",
    "c.keineTage": "An diesem Tag gibt es keinen besonderen religiösen Tag.",
    "c.kommend": "Kommende religiöse Tage",
    "c.inTagen": "in {n} Tagen", "c.heuteTag": "heute", "c.morgen": "morgen",
    "c.abend": "am Abend", "c.tagN": "Tag {nr} von {von}",
    "c.hinweis": "Die Daten folgen dem Kalender Umm al-Qura. In der Türkei (Diyanet) und je nach Mondsichtung kann ein Tag abweichen. Kandil-Nächte beginnen am Abend davor.",
    "c.art.bayram": "Feiertag", "c.art.tag": "Besonderer Tag", "c.art.nacht": "Heilige Nacht", "c.art.vor": "Vortag",

    "f.neujahr": "Islamisches Neujahr (Hicri Yılbaşı)", "f.neujahr.t": "Erster Tag des Muharram, Beginn des Hidschri-Jahres.",
    "f.aschura": "Aschura-Tag (Aşure Günü)", "f.aschura.t": "Zehnter Tag des Muharram: Tag des Fastens und des Gedenkens.",
    "f.mevlid": "Mevlid-Kandili", "f.mevlid.t": "Nacht der Geburt des Propheten ﷺ (12. Rabiʻ al-awwal).",
    "f.dreimonate": "Beginn der Drei Heiligen Monate (Üç Aylar)", "f.dreimonate.t": "Beginn des Radschab; danach folgen Schaʻban und Ramadan.",
    "f.regaib": "Regaib-Kandili", "f.regaib.t": "Erste Freitagnacht im Radschab.",
    "f.mirac": "Miraç-Kandili", "f.mirac.t": "Nacht der Himmelsreise des Propheten ﷺ (27. Radschab).",
    "f.berat": "Berat-Kandili", "f.berat.t": "Nacht der Vergebung (15. Schaʻban).",
    "f.ramadan": "Beginn des Ramadan", "f.ramadan.t": "Erster Fastentag des Monats Ramadan.",
    "f.kadir": "Kadir-Gecesi (Nacht der Bestimmung)", "f.kadir.t": "Nacht, in der der Koran offenbart wurde (27. Ramadan).",
    "f.arefeFitr": "Arefe (Vortag des Ramadanfests)", "f.arefeFitr.t": "Letzter Tag des Ramadan.",
    "f.fitr": "Ramadanfest (Ramazan Bayramı)", "f.fitr.t": "Fest des Fastenbrechens, drei Tage (1.–3. Schawwal).",
    "f.arafat": "Arafat-Tag (Arefe)", "f.arafat.t": "Vortag des Opferfests, 9. Dhu l-hiddscha.",
    "f.adha": "Opferfest (Kurban Bayramı)", "f.adha.t": "Fest der Opferung, vier Tage (10.–13. Dhu l-hiddscha).",

    "e.titel": "Diyanet-Zeiten (Wahl)",
    "e.diyanetText": "Standard sind deine Semerkand-Zeiten (Waiblingen) bzw. die Berechnung. Wählst du hier einen Ort aus der Diyanet-Liste, zeigt die App stattdessen genau die Zeiten der Diyanet (Internet nötig, wird zwischengespeichert).",
    "e.land": "Land", "e.stadt": "Stadt", "e.ort": "Ort",
    "e.landLaden": "Antippen zum Laden", "e.landWaehlen": "Land wählen", "e.stadtWaehlen": "Stadt wählen", "e.ortWaehlen": "Ort wählen",
    "e.diyanetEntfernen": "Diyanet-Ort entfernen (zurück zu Semerkand/Berechnung)",
    "e.aktiv": "Aktiv: {name}", "e.keinDiyanet": "Kein Diyanet-Ort gewählt – es gilt die Semerkand-Tabelle bzw. die Berechnung.",
    "e.laden": "Lade Liste …", "e.listeFehler": "Die Diyanet-Liste konnte nicht geladen werden ({grund}). Internet nötig.",
    "e.standort": "Standort (Kıble und Rückfall)", "e.stadtFeld": "Stadt", "e.gps": "📍 Meinen Standort verwenden",
    "e.gpsNein": "Standort wird von diesem Gerät nicht unterstützt.", "e.gpsSuche": "Standort wird ermittelt …",
    "e.gpsAbgelehnt": "Standortzugriff wurde abgelehnt. Wähle eine Stadt aus der Liste.", "e.gpsFehler": "Standort konnte nicht ermittelt werden.",
    "e.meinStandort": "Mein Standort",
    "e.erinnerung": "Erinnerung", "e.wieFrueh": "Wie früh?", "e.zurZeit": "zur Gebetszeit", "e.minVorher": "{n} Minuten vorher",
    "e.pushAn": "🔔 Erinnerungen einschalten", "e.pushAus": "🔕 Erinnerungen ausschalten",
    "e.fein": "Zeiten feinabstimmen", "e.feinText": "Minuten, die zu jeder Zeit addiert werden (auch zu den Diyanet-Zeiten). Normalerweise bei 0 lassen.", "e.feinZurueck": "Auf 0 zurücksetzen",
    "e.ueber": "Über", "e.ueberText": "Die Zeiten kommen aus deiner Semerkand-Tabelle (Waiblingen 2026) oder, wenn gewählt, von der Diyanet. Sonst rechnet die App selbst aus dem Sonnenstand (Näherung). Kein Konto, keine Werbung.",
    "e.sprache": "Sprache",
    "h.titel": "Hadith des Tages", "h.einleitung": "Der Prophet Muhammad ﷺ sagte:", "h.nawawi": "Nawawi 40, Nr. {n}", "h.hinweis": "Übersetzung sinngemäß.",

    "p.iosInstall": "Auf dem iPhone zuerst über Teilen → „Zum Home-Bildschirm“ installieren, dann hier einschalten.",
    "p.keinBrowser": "Dieser Browser kann keine Benachrichtigungen zeigen.", "p.gesperrt": "Benachrichtigungen sind in den Browser-Einstellungen gesperrt.",
    "p.offline": "Erinnerungen kommen auch bei geschlossener App.", "p.nichtEingerichtet": "Push-Versand ist noch nicht eingerichtet: Erinnerungen kommen nur, solange die App geöffnet ist.",
    "p.nichtUnterstuetzt": "Benachrichtigungen werden nicht unterstützt", "p.keineErlaubnis": "Erlaubnis nicht erteilt", "p.an": "Erinnerungen sind an",
    "p.fehler": "Einschalten fehlgeschlagen: {grund}", "p.keinPush": "Push wird von diesem Browser nicht unterstützt",
    "p.vorher": "{name} in {n} Minuten ({zeit})", "p.jetzt": "{name}-Zeit ist da ({zeit})",
  },

  tr: {
    "app.titel": "Namaz Vakitleri",
    "kopf.heute": "Bugün", "kopf.zurueck": "Önceki gün", "kopf.vor": "Sonraki gün", "kopf.sprache": "Almancaya geç",
    "nav.zeiten": "Vakitler", "nav.kible": "Kıble", "nav.kalender": "Takvim", "nav.tracker": "Takip", "nav.mehr": "Daha fazla",

    "g.imsak": "Sabah öncesi (Fecir)", "g.gunes": "Gün doğumu", "g.ogle": "Öğle", "g.ikindi": "İkindi", "g.aksam": "Gün batımı", "g.yatsi": "Gece",
    "z.naechstes": "Sıradaki vakit",
    "z.rest": "{zeit} sonra", "z.std": "sa", "z.min": "dk", "z.sek": "sn",
    "z.verrichtet": "{name} kılındı",
    "z.quelleDiyanet": "Kaynak: Diyanet ({ort}).{fehler}",
    "z.quelleTabelle": "Kaynak: {ort} 2026 vakit tablosu (Semerkand).",
    "z.keineDiyanet": "Bu gün için Diyanet vakitleri yok, vakit hesaplandı (yaklaşık).{fehler}",
    "z.berechnet": "{ort} için hesaplandı ({breite}° K, {laenge}° D) – yaklaşık bir değerdir. Daha doğrusu: „Daha fazla“ bölümünden bir Diyanet yeri seçin.",
    "z.diyanetFehler": " Diyanet vakitleri yüklenemedi ({grund}).",

    "k.kompassStart": "Pusulayı aç",
    "k.hinweis": "Telefonu düz tutun, metal ve mıknatıslardan uzak durun. Ok yukarıda ve yeşil olduğunda Kâbe yönüne bakıyorsunuz.",
    "k.text": "{ort} konumundan Kâbe yönü · {km} km",
    "k.abgelehnt": "Pusula erişimi reddedildi", "k.keinSensor": "Bu cihaz pusula bildirmiyor. Yukarıdaki dereceyi kullanın.", "k.nichtVerfuegbar": "Pusula kullanılamıyor",

    "t.heute": "bugün", "t.serie": "gün üst üste", "t.woche": "son 7 gün", "t.gestern": "Dün", "t.heuteGross": "Bugün",
    "t.hinweis": "Bir namazı sonradan işaretlemek için noktaya dokunun. Veriler yalnızca bu cihazda kalır.",

    "c.titel": "İslami takvim",
    "c.vorMonat": "Önceki ay", "c.nachMonat": "Sonraki ay", "c.heute": "Bugün",
    "c.freitag": "Cuma – Cuma namazı günü",
    "c.keineTage": "Bu günde özel bir dinî gün yok.",
    "c.kommend": "Yaklaşan dinî günler",
    "c.inTagen": "{n} gün sonra", "c.heuteTag": "bugün", "c.morgen": "yarın",
    "c.abend": "akşam", "c.tagN": "{nr}. gün / {von}",
    "c.hinweis": "Tarihler Ümmü'l-Kurâ takvimine göredir. Türkiye'de (Diyanet) ve hilal görünümüne göre bir gün fark olabilir. Kandil geceleri bir önceki akşam başlar.",
    "c.art.bayram": "Bayram", "c.art.tag": "Özel gün", "c.art.nacht": "Kandil", "c.art.vor": "Arife",

    "f.neujahr": "Hicri Yılbaşı", "f.neujahr.t": "Muharrem ayının ilk günü, Hicri yılın başlangıcı.",
    "f.aschura": "Aşure Günü", "f.aschura.t": "Muharremin onuncu günü: oruç ve anma günü.",
    "f.mevlid": "Mevlid Kandili", "f.mevlid.t": "Peygamberimizin ﷺ doğum gecesi (12 Rebiülevvel).",
    "f.dreimonate": "Üç Ayların Başlangıcı", "f.dreimonate.t": "Recep ayının başlangıcı; ardından Şaban ve Ramazan gelir.",
    "f.regaib": "Regaib Kandili", "f.regaib.t": "Recep ayının ilk Cuma gecesi.",
    "f.mirac": "Miraç Kandili", "f.mirac.t": "Peygamberimizin ﷺ Miraç gecesi (27 Recep).",
    "f.berat": "Berat Kandili", "f.berat.t": "Af ve mağfiret gecesi (15 Şaban).",
    "f.ramadan": "Ramazan Başlangıcı", "f.ramadan.t": "Ramazan ayının ilk oruç günü.",
    "f.kadir": "Kadir Gecesi", "f.kadir.t": "Kur'an-ı Kerim'in indirildiği gece (27 Ramazan).",
    "f.arefeFitr": "Ramazan Bayramı Arefesi", "f.arefeFitr.t": "Ramazan ayının son günü.",
    "f.fitr": "Ramazan Bayramı", "f.fitr.t": "Orucun bitiş bayramı, üç gün (1–3 Şevval).",
    "f.arafat": "Kurban Bayramı Arefesi (Arefe)", "f.arafat.t": "Kurban Bayramı'ndan önceki gün, 9 Zilhicce.",
    "f.adha": "Kurban Bayramı", "f.adha.t": "Kurban kesme bayramı, dört gün (10–13 Zilhicce).",

    "e.titel": "Diyanet vakitleri (seçenek)",
    "e.diyanetText": "Varsayılan olarak Semerkand vakitleriniz (Waiblingen) veya hesaplama kullanılır. Buradan Diyanet listesinden bir yer seçerseniz uygulama bunun yerine tam olarak Diyanet vakitlerini gösterir (internet gerekir, önbelleğe alınır).",
    "e.land": "Ülke", "e.stadt": "Şehir", "e.ort": "Yer",
    "e.landLaden": "Yüklemek için dokunun", "e.landWaehlen": "Ülke seçin", "e.stadtWaehlen": "Şehir seçin", "e.ortWaehlen": "Yer seçin",
    "e.diyanetEntfernen": "Diyanet yerini kaldır (Semerkand/hesaplamaya dön)",
    "e.aktiv": "Etkin: {name}", "e.keinDiyanet": "Diyanet yeri seçilmedi – Semerkand tablosu veya hesaplama geçerli.",
    "e.laden": "Liste yükleniyor …", "e.listeFehler": "Diyanet listesi yüklenemedi ({grund}). İnternet gerekir.",
    "e.standort": "Konum (Kıble ve yedek hesap)", "e.stadtFeld": "Şehir", "e.gps": "📍 Konumumu kullan",
    "e.gpsNein": "Bu cihaz konumu desteklemiyor.", "e.gpsSuche": "Konum belirleniyor …",
    "e.gpsAbgelehnt": "Konum erişimi reddedildi. Listeden bir şehir seçin.", "e.gpsFehler": "Konum belirlenemedi.",
    "e.meinStandort": "Konumum",
    "e.erinnerung": "Hatırlatma", "e.wieFrueh": "Ne kadar önce?", "e.zurZeit": "vakit girince", "e.minVorher": "{n} dakika önce",
    "e.pushAn": "🔔 Hatırlatmaları aç", "e.pushAus": "🔕 Hatırlatmaları kapat",
    "e.fein": "Vakitleri ince ayarla", "e.feinText": "Her vakte eklenen dakikalar (Diyanet vakitlerine de). Normalde 0 bırakın.", "e.feinZurueck": "0'a sıfırla",
    "e.ueber": "Hakkında", "e.ueberText": "Vakitler Semerkand tablonuzdan (Waiblingen 2026) veya seçilirse Diyanet'ten gelir. Aksi halde uygulama güneşin konumundan kendisi hesaplar (yaklaşık). Hesap yok, reklam yok.",
    "e.sprache": "Dil",
    "h.titel": "Günün Hadisi", "h.einleitung": "Peygamberimiz Muhammed ﷺ buyurdu ki:", "h.nawawi": "Kırk Hadis, No. {n}", "h.hinweis": "Anlam çevirisidir.",

    "p.iosInstall": "iPhone'da önce Paylaş → „Ana Ekrana Ekle“ ile yükleyin, sonra burada açın.",
    "p.keinBrowser": "Bu tarayıcı bildirim gösteremiyor.", "p.gesperrt": "Bildirimler tarayıcı ayarlarında engellenmiş.",
    "p.offline": "Hatırlatmalar uygulama kapalıyken de gelir.", "p.nichtEingerichtet": "Anlık bildirim henüz kurulmadı: hatırlatmalar yalnızca uygulama açıkken gelir.",
    "p.nichtUnterstuetzt": "Bildirimler desteklenmiyor", "p.keineErlaubnis": "İzin verilmedi", "p.an": "Hatırlatmalar açık",
    "p.fehler": "Açılamadı: {grund}", "p.keinPush": "Bu tarayıcı anlık bildirimi desteklemiyor",
    "p.vorher": "{name} vaktine {n} dakika var ({zeit})", "p.jetzt": "{name} vakti girdi ({zeit})",
  },
};

const SPRACHEN = ["de", "tr"];
const SCHLUESSEL = "gebet.sprache";
const gewaehlt = () => { try { return localStorage.getItem(SCHLUESSEL); } catch { return null; } };
const geraet = () => (typeof navigator !== "undefined" && /^tr\b/i.test(navigator.language || "") ? "tr" : "de");

export let sprache = SPRACHEN.includes(gewaehlt()) ? gewaehlt() : geraet();
export function setzeSprache(s) {
  if (!SPRACHEN.includes(s)) return;
  sprache = s;
  try { localStorage.setItem(SCHLUESSEL, s); } catch { /* privater Modus */ }
}
export const andereSprache = () => (sprache === "de" ? "tr" : "de");
export const lokale = () => (sprache === "tr" ? "tr-TR" : "de-DE");

/** Text holen; {platzhalter} werden ersetzt. Fehlt ein Schlüssel, erscheint der Schlüssel selbst (fällt im Test auf). */
export function t(schluessel, werte = {}) {
  const text = TEXTE[sprache][schluessel] ?? TEXTE.de[schluessel] ?? schluessel;
  return text.replace(/\{(\w+)\}/g, (_, k) => (werte[k] ?? `{${k}}`));
}

/** Statische Texte der Seite: data-t (Text), data-t-aria (aria-label), data-t-title (title), data-t-ph (placeholder). */
export function uebersetzeSeite(wurzel = document) {
  document.documentElement.lang = sprache;
  document.title = t("app.titel");
  for (const e of wurzel.querySelectorAll("[data-t]")) e.textContent = t(e.dataset.t);
  for (const e of wurzel.querySelectorAll("[data-t-aria]")) e.setAttribute("aria-label", t(e.dataset.tAria));
  for (const e of wurzel.querySelectorAll("[data-t-title]")) e.title = t(e.dataset.tTitle);
}
