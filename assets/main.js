(() => {
  document.documentElement.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  $("#yr").textContent = new Date().getFullYear();

  /* ---------- terminal typing ---------- */
  const lines = [
    ["p", "$ "], ["", "whoami\n"],
    ["g", "omkar.behera"], ["d", "  // security-focused software engineer\n\n"],
    ["p", "$ "], ["", "scan --profile --verbose\n"],
    ["g", "[+] "], ["", "observability ..... dynatrace      "], ["g", "OK\n"],
    ["g", "[+] "], ["", "web testing ....... burp, owasp    "], ["g", "OK\n"],
    ["g", "[+] "], ["", "network ........... wireshark, nmap "], ["g", "OK\n"],
    ["g", "[+] "], ["", "training .......... thm, portswigger"], ["g", " OK\n\n"],
    ["p", "$ "], ["", "status\n"],
    ["d", "→ "], ["", "open to security analyst / pentest roles"],
  ];
  const term = $("#term");
  if (reduce) {
    term.innerHTML = lines.map(([c, t]) => `<span class="${c}">${t}</span>`).join("") + '<span class="caret"></span>';
  } else {
    let i = 0, j = 0, span = null;
    const caret = document.createElement("span"); caret.className = "caret";
    term.appendChild(caret);
    const step = () => {
      if (i >= lines.length) return;
      const [cls, txt] = lines[i];
      if (!span) { span = document.createElement("span"); span.className = cls; term.insertBefore(span, caret); }
      const fast = cls !== "";
      span.textContent += txt.slice(j, j + (fast ? 3 : 1)); j += fast ? 3 : 1;
      if (j >= txt.length) { i++; j = 0; span = null; }
      setTimeout(step, txt[j - 1] === "\n" ? 260 : (fast ? 12 : 34 + Math.random() * 40));
    };
    setTimeout(step, 600);
  }

  /* ---------- live traffic sparkline ---------- */
  const cv = $("#spark"), ctx = cv.getContext("2d");
  const pts = Array.from({ length: 70 }, () => 30 + Math.random() * 20);
  let pkts = 10482;
  const draw = () => {
    const w = cv.width = cv.clientWidth * devicePixelRatio, h = cv.height = 90 * devicePixelRatio;
    ctx.clearRect(0, 0, w, h);
    const step = w / (pts.length - 1);
    ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1;
    for (let y = 1; y < 4; y++) { ctx.beginPath(); ctx.moveTo(0, h * y / 4); ctx.lineTo(w, h * y / 4); ctx.stroke(); }
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,59,59,.45)"); grad.addColorStop(1, "rgba(255,59,59,0)");
    ctx.beginPath(); ctx.moveTo(0, h);
    pts.forEach((v, k) => ctx.lineTo(k * step, h - v / 100 * h));
    ctx.lineTo(w, h); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath();
    pts.forEach((v, k) => k ? ctx.lineTo(k * step, h - v / 100 * h) : ctx.moveTo(0, h - v / 100 * h));
    ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 2 * devicePixelRatio; ctx.stroke();
    const lx = w, ly = h - pts[pts.length - 1] / 100 * h;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(lx - 3 * devicePixelRatio, ly, 3.5 * devicePixelRatio, 0, 7); ctx.fill();
  };
  const tickTraffic = () => {
    const last = pts[pts.length - 1];
    let nv = last + (Math.random() - .5) * 18;
    if (Math.random() < .06) nv = 80 + Math.random() * 15;      // a burst
    pts.push(Math.max(8, Math.min(95, nv))); pts.shift();
    const pps = Math.round(pts[pts.length - 1] * 14);
    pkts += pps / 4 | 0;
    $("#pps").textContent = pps + " pkt/s";
    $("#pkts").textContent = pkts.toLocaleString("en-IN");
    draw();
  };
  draw(); tickTraffic();
  if (!reduce) setInterval(tickTraffic, 250);
  addEventListener("resize", draw);

  /* ---------- counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCount = el => {
    const end = +el.dataset.count; if (reduce) { el.textContent = end; return; }
    const t0 = performance.now();
    const f = t => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  counters.forEach(runCount);

  /* ---------- PORTFOLIO: fit to width, fill on hover ---------- */
  const mega = $(".mega");
  const fit = () => {
    mega.style.fontSize = ""; mega.style.whiteSpace = "nowrap";
    const avail = mega.parentElement.clientWidth - parseFloat(getComputedStyle(mega.parentElement).paddingLeft) * 2;
    const w = mega.scrollWidth;
    if (w > avail) mega.style.fontSize = (parseFloat(getComputedStyle(mega).fontSize) * avail / w * .98) + "px";
  };
  fit(); addEventListener("resize", fit);
  if (document.fonts) document.fonts.ready.then(fit);
  mega.addEventListener("pointermove", e => {
    const r = mega.getBoundingClientRect();
    mega.style.setProperty("--fill", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
  });
  mega.addEventListener("pointerleave", () => mega.style.setProperty("--fill", "0%"));

  /* ---------- NeuroSniffer layers ---------- */
  const L = [
    ["CAPTURE", "Live packet capture", "Listens on a Linux network interface and captures traffic as it happens, so analysis works on what the network is doing right now."],
    ["PARSE", "Protocol & flow parsing", "Breaks raw packets into protocols, hosts, ports and conversations, so behaviour can be read per flow instead of per packet."],
    ["FEATURES", "Behaviour features", "Turns each flow into measurable features such as volume, timing and connection patterns that describe how a host is behaving."],
    ["MODEL", "Machine-learning analysis", "A machine-learning model scores the features to separate normal traffic from behaviour that looks unusual."],
    ["SIGNAL", "Security signals", "Unusual behaviour is surfaced as a clear security signal that an analyst can investigate, instead of a wall of packets."],
  ];
  document.querySelectorAll(".layer").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".layer").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
    const [tag, title, text] = L[+b.dataset.l];
    $("#lv-tag").textContent = `LAYER 0${+b.dataset.l + 1} // ${tag}`;
    $("#lv-title").textContent = title; $("#lv-text").textContent = text;
  }));

  /* ---------- copy email ---------- */
  const cm = $("#copyMail");
  cm.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(cm.dataset.mail); cm.textContent = "Copied ✓"; }
    catch { location.href = "mailto:" + cm.dataset.mail; }
    setTimeout(() => cm.textContent = cm.dataset.mail + " ⧉", 1800);
  });

  /* ---------- scroll progress + section name + reveal ---------- */
  const secs = [...document.querySelectorAll("[data-sec]")];
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    $("#prog").style.width = (scrollY / Math.max(1, max) * 100).toFixed(1) + "%";
    let cur = "00 · HERO";
    secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .45) cur = s.dataset.sec; });
    $("#secname").textContent = cur;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (!reduce && "IntersectionObserver" in window) {
    const els = document.querySelectorAll(".cap,.case,.flag,.sig,.timeline>li,.arsenal div");
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("reveal", "pre"); io.observe(el); } });
  }

  /* ---------- floating analyst cursors ---------- */
  if (reduce || innerWidth < 640) return;
  const crew = [["nmap", "#ff3b3b"], ["burp", "#ffd166"], ["wireshark", "#2ee6a6"], ["dynatrace", "#7aa2ff"]];
  const layer = $("#cursors");
  const bots = crew.map(([name, col]) => {
    const el = document.createElement("div"); el.className = "cur";
    el.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="${col}" stroke="#0b0c10" stroke-width="1.2"/></svg><em style="background:${col}">${name}</em>`;
    layer.appendChild(el);
    const b = { el, col, x: Math.random() * innerWidth, y: Math.random() * innerHeight, tx: 0, ty: 0, wait: 0 };
    pick(b); return b;
  });
  function pick(b) {
    b.tx = 60 + Math.random() * (innerWidth - 180);
    b.ty = 90 + Math.random() * (innerHeight - 200);
    b.wait = 40 + Math.random() * 160;
  }
  function click(b) {
    const r = document.createElement("span"); r.className = "ripple";
    r.style.left = b.x + 3 + "px"; r.style.top = b.y + 3 + "px"; r.style.borderColor = b.col;
    layer.appendChild(r); setTimeout(() => r.remove(), 750);
  }
  const loop = () => {
    bots.forEach(b => {
      const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
      if (d > 2) { b.x += dx * .025; b.y += dy * .025 + Math.sin(performance.now() / 700 + b.tx) * .3; }
      else if (--b.wait <= 0) { if (Math.random() < .5) click(b); pick(b); }
      b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
