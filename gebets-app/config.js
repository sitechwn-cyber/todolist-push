// Firebase-Zugangsdaten der App (Web-Konfiguration). Das sind KEINE Geheimnisse – sie stehen
// in jeder Web-App offen. Geheim ist nur der Dienstkonto-Schlüssel (GitHub-Secret, nie hier).
// Projekt: sitech-cockpit (mitbenutzt, Web-App „Gebets-App“). Solange apiKey leer ist, läuft die App ohne Push: Erinnerungen kommen dann nur, wenn die App offen ist.
// Einrichtung: siehe CLAUDE.md, Abschnitt „Push einrichten“.
export const FIREBASE = {
  apiKey: "AIzaSyCRf59Zf_RcHHkRJyXevFzyBuPiORHj648",
  authDomain: "sitech-cockpit.firebaseapp.com",
  databaseURL: "https://sitech-cockpit-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sitech-cockpit",
  messagingSenderId: "237143585060",
  appId: "1:237143585060:web:3efe35b817f56b899443b1",
};
// Firebase → Projekteinstellungen → Cloud Messaging → Web-Push-Zertifikate → Schlüsselpaar (öffentlicher Schlüssel)
export const VAPID_KEY = "BPOE-MhhQgHGncKWuJd1UN_wiP-9aFrMdAXkvonxhJg51w1YOxhWW6AL96VxrubHmtNKhEft00OBo62KrHm2nBU";
