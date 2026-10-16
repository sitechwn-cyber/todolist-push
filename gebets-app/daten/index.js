// Eingebaute Zeitentabellen (gelten für einen Ort und ein Jahr). Nachladen erst bei Bedarf.
export const EINGEBAUT = {
  "waiblingen-2026": () => import("./waiblingen-2026.js"),
};
export async function ladeEingebaut(id) {
  const lader = EINGEBAUT[id];
  return lader ? (await lader()).default : undefined;
}
