// Hook (PreToolUse, Write|Edit): Das Projekt ist öffentlich.
// Blockiert Änderungen, die private Schlüssel, Zugangs-Token oder Mailadressen enthalten.
// Exit 2 = blockieren (Grund geht an Claude zurück), Exit 0 = erlaubt.
let eingabe = '';
process.stdin.on('data', (d) => (eingabe += d));
process.stdin.on('end', () => {
  let daten;
  try { daten = JSON.parse(eingabe); } catch { process.exit(0); }
  const t = daten.tool_input || {};
  const text = [t.content, t.new_string, ...(t.edits || []).map((e) => e.new_string)]
    .filter((x) => typeof x === 'string').join('\n');
  if (!text) process.exit(0);

  const funde = [];
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) funde.push('privater Schlüssel (BEGIN PRIVATE KEY)');
  if (/"private_key(_id)?"\s*:/.test(text)) funde.push('Dienstkonto-Schlüssel ("private_key")');
  if (/\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}/.test(text)) funde.push('GitHub-Token');

  const mails = (text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [])
    .filter((m) => !/noreply|example\.(com|org)$/i.test(m));
  if (mails.length) funde.push('Mailadresse (' + [...new Set(mails)].join(', ') + ')');

  if (funde.length) {
    process.stderr.write(
      'Blockiert: Das GitHub-Projekt ist öffentlich. Gefunden: ' + funde.join('; ') +
      '. Zugangsdaten gehören ins GitHub-Secret, nicht in Dateien.\n');
    process.exit(2);
  }
  process.exit(0);
});
