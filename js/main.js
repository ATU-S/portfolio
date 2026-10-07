const $ = (s) => document.querySelector(s);
const esc = (t = "") => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const chips = (a = []) => `<div class="chips">${a.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>`;
const FILES = ["profile", "skills", "projects", "experience", "education", "certifications"];
const load = (n) => fetch(`data/${n}.json?t=${Date.now()}`, { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(n); return r.text(); });
let last = "", booted = false;

async function sync() {
  let raw;
  try { raw = await Promise.all(FILES.map(load)); }
  catch (e) {
    if (!booted) document.body.insertAdjacentHTML("afterbegin", `<p style="padding:20px;background:#fee">Could not load data/${esc(e.message)}.json. Run <code>python -m http.server</code> locally or deploy to GitHub Pages.</p>`);
    return;
  }
  const sig = raw.join("|");
  if (sig === last) return;
  let d;
  try { d = Object.fromEntries(FILES.map((n, i) => [n, JSON.parse(raw[i])])); }
  catch (e) { console.warn("JSON error, keeping previous content:", e.message); return; }
  last = sig;
  render(d);
  if (!booted) { booted = true; motion(); }
  observe();
}

function render({ profile: p, skills, projects, experience: exp, education: edu, certifications: certs }) {
  const first = !booted;
  document.title = `${p.name} · ${p.role}`;
  $("#brand").textContent = p.name;
  $("#status").textContent = p.status;
  $("#headline").textContent = p.headline;
  if (first || $("#name").dataset.n !== p.name) {
    $("#name").dataset.n = p.name;
    $("#name").setAttribute("aria-label", p.name);
    $("#name").innerHTML = [...p.name].map((c, i) => c === " " ? `<span class="sp"></span>` : `<span class="ch" aria-hidden="true" style="--i:${i}">${esc(c)}</span>`).join("");
  }
  $("#cta").innerHTML = `<a class="btn main" href="#projects">See my work</a><a class="btn" href="${esc(p.resume)}" target="_blank" rel="noopener">Resume</a><a class="btn" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a>`;
  const t = p.ticker.map((x) => `<span>${esc(x)}</span>`).join("");
  $("#ticker").innerHTML = t + t;
  $("#about-text").innerHTML = p.about.map((x) => `<p>${esc(x)}</p>`).join("");
  $("#facts").innerHTML = p.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");
  $("#skills").innerHTML = skills.map((s) => `<div class="skill"><h3>${esc(s.group)}</h3><p>${esc(s.note)}</p>${chips(s.items)}</div>`).join("");

  $("#projects-list").innerHTML = projects.map((x) => `
    <article class="proj reveal"><div class="yr">${esc(x.year)}</div>
      <div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p>
      ${x.points?.length ? `<ul>${x.points.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}${chips(x.tags)}</div>
      <div class="acts"><a href="project.html?p=${encodeURIComponent(x.slug || "")}">Details</a>${(x.links || []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>
    </article>`).join("");

  $("#timeline").innerHTML = exp.map((x) => `
    <li class="reveal"><div class="when">${esc(x.period)}</div><h3>${esc(x.role)} <span>· ${esc(x.org)}</span></h3>
    ${x.summary ? `<p>${esc(x.summary)}</p>` : ""}${x.points?.length ? `<ul>${x.points.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}${chips(x.tags)}</li>`).join("");

  $("#edu").innerHTML = edu.map((x) => `
    <li class="reveal"><div><b>${esc(x.degree)}</b><small>${esc(x.school)} · ${esc(x.period)}</small></div><div class="r"><b>${esc(x.score)}</b></div></li>`).join("");
  $("#certs").innerHTML = certs.map((c) => {
    const href = c.file || c.url;
    return `<li class="reveal"><div><b>${esc(c.title)}</b><small>${esc(c.issuer)}${c.year ? " · " + esc(c.year) : ""}</small></div>
      <div class="r">${href ? `<a class="view" href="${esc(href)}" target="_blank" rel="noopener">View</a>` : `<span class="none">Verified</span>`}</div></li>`;
  }).join("");

  $("#mail").textContent = p.email; $("#mail").href = `mailto:${p.email}`;
  $("#links").innerHTML = `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a><a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a><a href="tel:${esc(p.phone.replace(/\s/g, ""))}">${esc(p.phone)}</a><span>${esc(p.location)}</span>`;
  $("#foot").textContent = `© ${new Date().getFullYear()} ${p.name}`;
}

let io;
function observe() {
  io ||= new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".reveal:not(.in)").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
}

function motion() {
  const nav = $("#nav"), tl = $("#timeline");
  const onScroll = () => {
    nav.classList.toggle("solid", scrollY > 20);
    const r = tl.getBoundingClientRect();
    tl.style.setProperty("--p", Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height)));
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

sync();
// Live preview: while running locally, edits to data/*.json appear within ~2s without reloading.
if (["localhost", "127.0.0.1", ""].includes(location.hostname)) setInterval(sync, 2000);
