const esc = (t = "") => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const list = (a = []) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
const sec = (h, b) => b ? `<section class="reveal in"><h3>${h}</h3>${b}</section>` : "";
async function go() {
  const slug = new URLSearchParams(location.search).get("p");
  const el = document.getElementById("pj");
  try {
    const all = await (await fetch(`data/projects.json?t=${Date.now()}`, { cache: "no-store" })).json();
    const x = all.find((q) => q.slug === slug);
    if (!x) { el.innerHTML = `<h2>Project not found</h2><p><a href="index.html#projects">Back to projects</a></p>`; return; }
    document.title = `${x.title} · Ananthu S`;
    el.innerHTML = `<p class="yr">${esc(x.year)}</p><h2>${esc(x.title)}</h2><p class="lead">${esc(x.description)}</p>
      <div class="chips">${(x.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      <p class="pl">${(x.links || []).map((l) => `<a class="btn main" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</p>
      ${sec("Overview", x.overview && `<p>${esc(x.overview)}</p>`)}${sec("The problem", x.problem && `<p>${esc(x.problem)}</p>`)}
      ${sec("Highlights", x.points?.length && list(x.points))}
      ${sec("How it works", x.architecture?.length && `<ol class="flow">${x.architecture.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`)}
      ${sec("Stack", x.stack?.length && `<div class="chips">${x.stack.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>`)}
      ${sec("Challenges", x.challenges?.length && list(x.challenges))}`;
  } catch { el.innerHTML = `<p>Could not load data/projects.json.</p>`; }
}
go();
