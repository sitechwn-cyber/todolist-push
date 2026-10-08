// Todolist-Wecker (Cloudflare Worker, kostenloser Tarif)
// Startet jede Minute den Versand der Push-Nachrichten bei GitHub
// (Workflow "Push-Nachrichten", workflow_dispatch). Der Datenbank-Schlüssel
// bleibt bei GitHub – hier liegt nur GITHUB_TOKEN als Cloudflare-Secret:
// ein fein eingeschränkter Schlüssel, der nur Actions in todolist-push starten darf.

async function anstossen(env) {
  const res = await fetch(`https://api.github.com/repos/${env.REPO}/actions/workflows/push.yml/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "todolist-wecker",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  // GitHub antwortet bei Erfolg mit 204 ohne Inhalt
  if (res.status !== 204) {
    const text = await res.text();
    throw new Error(`GitHub antwortet ${res.status}: ${text.slice(0, 300)}`);
  }
}

export default {
  async scheduled(event, env, ctx) {
    if (!env.GITHUB_TOKEN) { console.error("GITHUB_TOKEN fehlt (wrangler secret put GITHUB_TOKEN)"); return; }
    ctx.waitUntil(anstossen(env).catch((e) => console.error(e.message)));
  },
  // Aufruf der Worker-Adresse im Browser zeigt nur, dass er läuft – nichts Geheimes.
  async fetch() {
    return new Response("Todolist-Wecker läuft – stößt jede Minute den Versand bei GitHub an.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
