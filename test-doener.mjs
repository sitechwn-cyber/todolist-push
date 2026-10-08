// Test der Döner-Planungslogik: node test-doener.mjs
import { plane, HOECHSTENS_ALT } from "./doener-logik.mjs";
const R = [];
const ok = (n, c) => R.push((c ? "OK   " : "FAIL ") + n);
const jetzt = Date.parse("2026-10-08T12:00:00Z");
const vor = (min) => new Date(jetzt - min * 60000).toISOString();
const staff = { uStaff: { role: "staff" }, uAdmin: { role: "admin" } };
const geraete = {
  p1: { rolle: "personal", token: "T-P1", uid: "uStaff" },
  p2: { rolle: "personal", token: "T-P2", uid: "uAdmin" },
  k1: { rolle: "kunde", token: "T-K1", uid: "uK1", bestellung: "o1" },
  k2: { rolle: "kunde", token: "T-K2", uid: "uK2", bestellung: "o2" },
  k9: { rolle: "kunde", token: "T-K9", uid: "uK9", bestellung: "weg" },
};
const items = [{ name: "Döner" }, { name: "Ayran" }];

// 1) Neue Kundenbestellung -> Mitarbeiter UND Admin
let r = plane({ orders: { o1: { status: "offen", zeit: vor(2), uid: "uK1", nrKey: "012", name: "Ali", kunde: "ERKEKLER", bestellart: "mitnehmen", items } }, geraete, staff, gesendet: {}, jetzt });
const neu = r.nachrichten.find((n) => n.tag === "neu-o1");
ok("Neue Bestellung wird gemeldet", !!neu);
ok("an beide Mitarbeiter-Geräte (Mitarbeiter + Admin)", neu && neu.ziele.map((z) => z.id).sort().join() === "p1,p2");
ok("Nummer ohne führende Nullen im Titel", neu && neu.titel.includes("Nr. 12") && !neu.titel.includes("012"));
ok("Text mit Name, Art und Anzahl", neu && neu.text.includes("Ali") && neu.text.includes("Mitnehmen") && neu.text.includes("2 Artikel"));
ok("Kunde bekommt NICHT die Mitarbeiter-Meldung", neu && !neu.ziele.some((z) => z.id.startsWith("k")));
ok("Neu wird gemerkt", r.merken["o1/neu"] === true);
// nicht doppelt
r = plane({ orders: { o1: { status: "offen", zeit: vor(2), uid: "uK1", nrKey: "012", items } }, geraete, staff, gesendet: { o1: { neu: true } }, jetzt });
ok("Schon gemeldete Bestellung meldet sich nicht noch einmal", !r.nachrichten.some((n) => n.tag === "neu-o1"));
// Mitarbeiter-Eingabe an der Theke
r = plane({ orders: { o3: { status: "offen", zeit: vor(1), uid: "uStaff", nrKey: "013", items } }, geraete, staff, gesendet: {}, jetzt });
ok("Eigene Theken-Bestellung der Mitarbeiter löst keine Meldung aus", r.nachrichten.length === 0);
// zu alt
r = plane({ orders: { o4: { status: "offen", zeit: vor(HOECHSTENS_ALT / 60000 + 10), uid: "uK4", nrKey: "014", items } }, geraete, staff, gesendet: {}, jetzt });
ok("Alte Bestellung (> 3 h) wird nicht mehr gemeldet", r.nachrichten.length === 0);
// ohne Geräte
r = plane({ orders: { o5: { status: "offen", zeit: vor(1), uid: "uK5", nrKey: "015", items } }, geraete: {}, staff, gesendet: {}, jetzt });
ok("Ohne Mitarbeiter-Geräte: keine Zustellung, aber als erledigt gemerkt", r.nachrichten[0].ziele.length === 0 && r.merken["o5/neu"] === true);

// 2) Fertig -> nur der Kunde dieser Bestellung
r = plane({ orders: { o1: { status: "fertig", zeit: vor(20), uid: "uK1", nrKey: "012", items }, o2: { status: "offen", zeit: vor(5), uid: "uK2", nrKey: "013", items } }, geraete, staff, gesendet: { o1: { neu: true }, o2: { neu: true } }, jetzt });
const fertig = r.nachrichten.find((n) => n.tag === "fertig-o1");
ok("Fertige Bestellung wird dem Kunden gemeldet", !!fertig);
ok("nur an das Gerät dieser Bestellung", fertig && fertig.ziele.length === 1 && fertig.ziele[0].id === "k1");
ok("Text nennt die Nummer", fertig && fertig.text.includes("Nr. 12"));
ok("Offene Bestellung eines anderen Kunden bekommt nichts", !r.nachrichten.some((n) => n.tag === "fertig-o2"));
ok("Kunden-Adresse wird nach dem Versand entfernt", r.entfernen.includes("k1") && !r.entfernen.includes("k2"));
ok("Fertig wird gemerkt", r.merken["o1/fertig"] === true);
r = plane({ orders: { o1: { status: "fertig", zeit: vor(20), uid: "uK1", nrKey: "012", items } }, geraete, staff, gesendet: { o1: { neu: true, fertig: true } }, jetzt });
ok("Fertig meldet sich nicht doppelt", !r.nachrichten.some((n) => n.tag === "fertig-o1"));
// Fertig ohne Kunden-Gerät
r = plane({ orders: { o6: { status: "fertig", zeit: vor(20), uid: "uK6", nrKey: "016", items } }, geraete, staff, gesendet: { o6: { neu: true } }, jetzt });
ok("Fertig ohne Kunden-Gerät: keine Nachricht, kein Fehler", r.nachrichten.length === 0 && r.merken["o6/fertig"] === true);

// 3) Aufräumen
r = plane({ orders: {}, geraete, staff, gesendet: { alt1: { neu: true } }, jetzt });
ok("Kunden-Geräte gelöschter Bestellungen werden entfernt", r.entfernen.includes("k9") && r.entfernen.includes("k1") && r.entfernen.includes("k2"));
ok("Mitarbeiter-Geräte bleiben", !r.entfernen.includes("p1") && !r.entfernen.includes("p2"));
ok("Merkzettel gelöschter Bestellungen wird geleert", r.merken["alt1"] === null);
// robust gegen leere Daten
r = plane({ orders: null, geraete: null, staff: null, gesendet: null, jetzt });
ok("Leere Datenbank: kein Absturz, nichts zu tun", r.nachrichten.length === 0 && r.entfernen.length === 0);

console.log(R.join("\n"));
console.log(R.some((x) => x.startsWith("FAIL")) ? "\nES GIBT FEHLER" : "\nALLE TESTS OK");
process.exit(R.some((x) => x.startsWith("FAIL")) ? 1 : 0);
