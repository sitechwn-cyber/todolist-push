// Firebase-Zugangsdaten der App (Web-Konfiguration). Das sind KEINE Geheimnisse – sie stehen
// in jeder Web-App offen. Geheim ist nur der Dienstkonto-Schlüssel (GitHub-Secret, nie hier).
// Solange apiKey leer ist, läuft die App ohne Push: Erinnerungen kommen dann nur, wenn die App offen ist.
// Einrichtung: siehe CLAUDE.md, Abschnitt „Push einrichten“.
export const FIREBASE = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  messagingSenderId: "",
  appId: "",
};
// Firebase → Projekteinstellungen → Cloud Messaging → Web-Push-Zertifikate → Schlüsselpaar (öffentlicher Schlüssel)
export const VAPID_KEY = "";
