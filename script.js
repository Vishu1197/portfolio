/* ============================================================
   RESEARCH CONSOLE — app logic
   ============================================================ */
(() => {
  "use strict";

  /* ---------- static content ---------- */
  const DOMAINS = [
    { key:"virology",   label:"Virology",          short:"Viral pathogenesis, dengue biology & thrombocytopenia mechanisms." },
    { key:"bioinfo",     label:"Bioinformatics",     short:"RNA-seq analytics & computational modeling of host–pathogen interaction." },
    { key:"nano",        label:"Nanomedicine",       short:"Lipid-based nanocarriers engineered for precision antiviral delivery." },
    { key:"md",          label:"Molecular Dynamics", short:"Simulation & docking studies driving antiviral drug discovery." },
    { key:"ml",          label:"Machine Learning",   short:"Hybrid ML pipelines that screen for natural antiviral agents." }
  ];

  const ROLES = [
    "PhD Researcher",
    "Virology & Bioinformatics",
    "Nanomedicine Design",
    "Computational Drug Discovery"
  ];

  // Which publication files actually have a thumbnail + pdf on disk.
  const PUB_ASSETS = {
    paper1: { img:true, pdf:true },
    paper2: { img:true, pdf:true },
    paper3: { img:false, pdf:false },
    review1:{ img:false, pdf:false },
    book1:  { img:true, pdf:true },
    book2:  { img:true, pdf:true }
  };

  const TIMELINE = [
    { year:"2024", title:"Book Chapter Contributions", desc:"Two Elsevier book chapters published — \u201cObsessive-Compulsive Disorder\u201d and \u201cMicroplastics in the Environment\u201d — contributing subject-matter chapters to edited academic volumes." },
    { year:"2025", title:"Research & Review Output", desc:"Three research articles and one review published in the same year: conformational biomarker studies, a hybrid ML + molecular-dynamics screen for anti-dengue agents, a thrombocytopenia review, and a phytochemical nanoparticle review." },
    { year:"Ongoing", title:"PhD Research — Virology / Bioinformatics / Nanomedicine", desc:"Continuing doctoral research bridging computational modeling and experimental virology, with a focus on precision antiviral therapeutics." }
  ];

  let pubData = null;
  let certData = null;
  let currentMode = "home";
  let currentPubFilter = "all";
  let scopeIndex = 0;

  /* ============================================================
     BOOT SEQUENCE
     ============================================================ */
  function boot(){
    const bootLines = document.getElementById("bootLines");
    const bootBar = document.getElementById("bootBar");
    const lines = [
      "> RESEARCH CONSOLE v2.0",
      "> initializing instrument panel…",
      "> loading specimen data……… OK",
      "> calibrating viewport optics… OK",
      "> establishing telemetry link… OK",
      "> welcome, operator."
    ];
    let i = 0;
    const typer = setInterval(() => {
      if(i < lines.length){
        bootLines.textContent += (i>0 ? "\n" : "") + lines[i];
        i++;
      } else {
        clearInterval(typer);
      }
    }, 220);
    requestAnimationFrame(() => { bootBar.style.width = "100%"; });

    setTimeout(() => {
      document.getElementById("boot").classList.add("hidden");
      document.getElementById("app").classList.add("ready");
    }, 1500);
  }

  /* ============================================================
     CLOCK
     ============================================================ */
  function tickClock(){
    const el = document.getElementById("clock");
    const now = new Date();
    const pad = n => String(n).padStart(2,"0");
    el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  /* ============================================================
     TYPED ROLE (hero)
     ============================================================ */
  function typedRoleLoop(){
    const el = document.getElementById("typedRole");
    let roleIdx = 0, charIdx = 0, deleting = false;

    function step(){
      const word = ROLES[roleIdx];
      if(!deleting){
        charIdx++;
        el.textContent = word.slice(0, charIdx);
        if(charIdx === word.length){
          deleting = true;
          setTimeout(step, 1400);
          return;
        }
      } else {
        charIdx--;
        el.textContent = word.slice(0, charIdx);
        if(charIdx === 0){
          deleting = false;
          roleIdx = (roleIdx + 1) % ROLES.length;
        }
      }
      setTimeout(step, deleting ? 35 : 65);
    }
    step();
  }

  /* ============================================================
     THEME TOGGLE
     ============================================================ */
  function initTheme(){
    const btn = document.getElementById("themeToggle");
    btn.addEventListener("click", () => {
      const html = document.documentElement;
      const isDark = html.getAttribute("data-theme") !== "light";
      html.setAttribute("data-theme", isDark ? "light" : "dark");
      btn.textContent = isDark ? "☀" : "☾";
    });
  }

  /* ============================================================
     MODE SWITCHING
     ============================================================ */
  function setMode(mode){
    currentMode = mode;
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.getElementById("panel-" + mode).classList.add("active");
    document.querySelectorAll(".rail-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    document.getElementById("statusMode").textContent = mode.toUpperCase();
    document.getElementById("viewportContent").scrollTop = 0;
    const x = (Math.random()*90+5).toFixed(1), y = (Math.random()*90+5).toFixed(1);
    document.getElementById("statusCoord").textContent = `x:${x} y:${y}`;
    renderMeta(mode);
  }

  function initRail(){
    document.querySelectorAll(".rail-btn").forEach(btn => {
      btn.addEventListener("click", () => setMode(btn.dataset.mode));
    });
    document.querySelectorAll("[data-goto]").forEach(btn => {
      btn.addEventListener("click", () => setMode(btn.dataset.goto));
    });
    document.addEventListener("keydown", (e) => {
      if(e.target.tagName === "INPUT") return;
      const map = {1:"home",2:"profile",3:"publications",4:"journey",5:"records",6:"contact"};
      if(map[e.key]) setMode(map[e.key]);
    });
  }

  /* ============================================================
     META PANEL (contextual right rail)
     ============================================================ */
  function renderMeta(mode){
    const el = document.getElementById("metaPanel");
    let html = "";
    const pubCount = pubData ? (pubData.research.length + pubData.review.length + pubData.book.length) : 0;
    const certCount = certData ? Object.values(certData).reduce((s,c) => s + c.items.length, 0) : 0;

    if(mode === "home"){
      html = `
        <div class="meta-block">
          <p class="meta-label">Specimen Overview</p>
          <div class="meta-row"><span>Research Articles</span><b>${pubData ? pubData.research.length : "—"}</b></div>
          <div class="meta-row"><span>Reviews</span><b>${pubData ? pubData.review.length : "—"}</b></div>
          <div class="meta-row"><span>Book Chapters</span><b>${pubData ? pubData.book.length : "—"}</b></div>
          <div class="meta-row"><span>Records &amp; Certificates</span><b>${certCount || "—"}</b></div>
        </div>
        <div class="meta-block">
          <p class="meta-label">Research Domains</p>
          ${DOMAINS.map(d => `<div class="meta-row"><span>${d.label}</span><b>●</b></div>`).join("")}
        </div>
        <div class="meta-block">
          <p class="meta-label">Console Tip</p>
          <div style="font-size:12px;color:var(--paper-faint);line-height:1.6;">Hover the network graph to inspect each research domain. Press <span class="mono">/</span> to jump anywhere instantly.</div>
        </div>`;
    } else if(mode === "profile"){
      html = `
        <div class="meta-block">
          <p class="meta-label">Focus Areas</p>
          ${DOMAINS.map(d => `<div class="meta-row"><span>${d.label}</span></div>`).join("")}
        </div>
        <div class="meta-block">
          <p class="meta-label">Identity</p>
          <div class="meta-row"><span>Role</span><b>PhD Researcher</b></div>
          <div class="meta-row"><span>Fields</span><b>3</b></div>
        </div>`;
    } else if(mode === "publications"){
      html = `
        <div class="meta-block">
          <p class="meta-label">Lane Totals</p>
          <div class="meta-row"><span>Research</span><b>${pubData ? pubData.research.length : "—"}</b></div>
          <div class="meta-row"><span>Review</span><b>${pubData ? pubData.review.length : "—"}</b></div>
          <div class="meta-row"><span>Book</span><b>${pubData ? pubData.book.length : "—"}</b></div>
          <div class="meta-row"><span>Total Specimens</span><b>${pubCount || "—"}</b></div>
        </div>
        <div class="meta-block">
          <p class="meta-label">Reading</p>
          <div style="font-size:12px;color:var(--paper-faint);line-height:1.6;">Click any band to open its detail card. Bands with a full-text link open the original PDF.</div>
        </div>`;
    } else if(mode === "journey"){
      html = `
        <div class="meta-block">
          <p class="meta-label">Trace Nodes</p>
          ${TIMELINE.map((t,i) => `<div class="meta-row"><span>${t.year}</span><b>${String(i+1).padStart(2,"0")}</b></div>`).join("")}
        </div>`;
    } else if(mode === "records"){
      html = `
        <div class="meta-block">
          <p class="meta-label">Tray Totals</p>
          ${certData ? Object.entries(certData).map(([k,v]) => `<div class="meta-row"><span>${v.label}</span><b>${v.items.length}</b></div>`).join("") : ""}
          <div class="meta-row"><span>CV Pages</span><b>2</b></div>
        </div>`;
    } else if(mode === "contact"){
      html = `
        <div class="meta-block">
          <p class="meta-label">Channel Status</p>
          <div class="meta-row"><span>GitHub</span><b>OPEN</b></div>
          <div class="meta-row"><span>LinkedIn</span><b>OPEN</b></div>
          <div class="meta-row"><span>Scopus</span><b>OPEN</b></div>
          <div class="meta-row"><span>Google Scholar</span><b>OPEN</b></div>
        </div>`;
    }
    el.innerHTML = html;
  }

  /* ============================================================
     HOME — NETWORK CANVAS
     ============================================================ */
  function initNetwork(){
    const canvas = document.getElementById("networkCanvas");
    const ctx = canvas.getContext("2d");
    const tip = document.getElementById("nodeTip");
    let w, h, dpr;
    let nodes = [];
    let mouse = { x:-9999, y:-9999 };

    function resize(){
      const wrap = canvas.parentElement;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth; h = wrap.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w+"px"; canvas.style.height = h+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      layoutNodes();
    }

    function layoutNodes(){
      const cx = w * 0.72, cy = h * 0.5;
      const radius = Math.min(w,h) * 0.34;
      nodes = DOMAINS.map((d, i) => {
        const angle = (i / DOMAINS.length) * Math.PI * 2 - Math.PI/2;
        return {
          domain:d, angle, baseAngle:angle,
          r: radius,
          cx, cy,
          x: cx + Math.cos(angle)*radius,
          y: cy + Math.sin(angle)*radius,
          pulse: Math.random()*Math.PI*2
        };
      });
      nodes.center = { x:cx, y:cy };
    }

    let t = 0;
    function draw(){
      t += 0.0045;
      ctx.clearRect(0,0,w,h);
      const cx = w*0.72, cy = h*0.5;

      // recompute positions with slow orbit
      nodes.forEach((n,i) => {
        const a = n.baseAngle + t*0.25;
        n.x = cx + Math.cos(a)*n.r;
        n.y = cy + Math.sin(a)*n.r;
      });

      // lines: center -> node
      ctx.lineWidth = 1;
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(n.x,n.y);
        ctx.strokeStyle = "rgba(43,212,184,0.18)";
        ctx.stroke();
      });
      // ring connecting nodes
      ctx.beginPath();
      nodes.forEach((n,i) => { i===0 ? ctx.moveTo(n.x,n.y) : ctx.lineTo(n.x,n.y); });
      ctx.closePath();
      ctx.strokeStyle = "rgba(43,212,184,0.10)";
      ctx.stroke();

      // center node
      ctx.beginPath();
      ctx.arc(cx,cy, 26, 0, Math.PI*2);
      ctx.fillStyle = "rgba(43,212,184,0.10)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx,cy, 6, 0, Math.PI*2);
      ctx.fillStyle = "#2bd4b8";
      ctx.fill();

      // domain nodes
      let hovered = null;
      nodes.forEach(n => {
        const dx = mouse.x-n.x, dy = mouse.y-n.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const isHover = dist < 26;
        if(isHover) hovered = n;
        const pulseR = 5 + Math.sin(t*3 + n.pulse)*1.2;
        ctx.beginPath();
        ctx.arc(n.x,n.y, isHover ? 9 : pulseR+3, 0, Math.PI*2);
        ctx.fillStyle = isHover ? "rgba(242,166,90,0.9)" : "rgba(43,212,184,0.85)";
        ctx.fill();
        if(isHover){
          ctx.beginPath();
          ctx.arc(n.x,n.y, 15, 0, Math.PI*2);
          ctx.strokeStyle = "rgba(242,166,90,0.5)";
          ctx.stroke();
        }
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = isHover ? "#f2a65a" : "rgba(238,241,238,0.55)";
        const label = n.domain.label;
        const tw = ctx.measureText(label).width;
        let lx = n.x - tw/2;
        if(n.x > cx) lx = n.x + 12;
        else lx = n.x - tw - 12;
        ctx.fillText(label, lx, n.y+3);
      });

      if(hovered){
        tip.classList.add("show");
        tip.style.left = (hovered.x + 20) + "px";
        tip.style.top = (hovered.y - 10) + "px";
        tip.querySelector("b").textContent = hovered.domain.label;
        tip.querySelector("span").textContent = hovered.domain.short;
      } else {
        tip.classList.remove("show");
      }

      requestAnimationFrame(draw);
    }

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => { mouse.x=-9999; mouse.y=-9999; });

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
  }

  /* ============================================================
     PROFILE — orbit tags + focus lenses
     ============================================================ */
  function initProfile(){
    const wrap = document.getElementById("orbitTagWrap");
   DOMAINS.forEach((d,i) => {
      const angle = (i/DOMAINS.length) * Math.PI*2 - Math.PI/2;
      const center = 170;   // half of the new 340px frame
      const R = 150;         // stays inside the frame, so no spillover
      const x = center + Math.cos(angle)*R;
      const y = center + Math.sin(angle)*R;
      const tagEl = document.createElement("span");
      tagEl.className = "orbit-tag";
      tagEl.textContent = d.label;
      tagEl.style.left = x + "px";
      tagEl.style.top = y + "px";
      tagEl.style.transform = "translate(-50%,-50%)";
      wrap.appendChild(tagEl);
    });

    const lensRow = document.getElementById("lensRow");
    const lensDesc = document.getElementById("lensDesc");
    DOMAINS.forEach(d => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = d.label;
      chip.addEventListener("click", () => {
        document.querySelectorAll("#lensRow .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        lensDesc.textContent = d.short;
      });
      lensRow.appendChild(chip);
    });
  }

  /* ============================================================
     PUBLICATIONS — gel lanes
     ============================================================ */
  function renderGel(){
    const lanesEl = document.getElementById("gelLanes");
    if(!pubData) return;
    const cats = [
      { key:"research", label:"Research" },
      { key:"review",   label:"Review" },
      { key:"book",     label:"Book Chapters" }
    ];
    lanesEl.innerHTML = "";
    cats.forEach(cat => {
      if(currentPubFilter !== "all" && currentPubFilter !== cat.key) return;
      const laneEl = document.createElement("div");
      laneEl.className = "gel-lane";
      const items = [...pubData[cat.key]].sort((a,b) => b.year.localeCompare(a.year));
      laneEl.innerHTML = `<div class="gel-lane-title">${cat.label}<span>${items.length}</span></div>`;
      if(items.length === 0){
        laneEl.innerHTML += `<div class="gel-empty">No specimens in this lane.</div>`;
      }
      items.forEach(pub => {
        const band = document.createElement("div");
        band.className = "gel-band";
        band.innerHTML = `
          <div class="gel-band-year">${pub.year}</div>
          <div class="gel-band-title">${pub.title}</div>
          <div class="gel-band-journal">${pub.journal}</div>`;
        band.addEventListener("click", () => openPubModal(pub, cat.label));
        laneEl.appendChild(band);
      });
      lanesEl.appendChild(laneEl);
    });
  }

  function openPubModal(pub, catLabel){
    const assets = PUB_ASSETS[pub.file] || { img:false, pdf:false };
    let body = "";
    if(assets.img){
      body += `<img src="assets/pdfs/${pub.file.startsWith('book') ? 'book' : (pub.file.startsWith('review') ? 'review' : 'research')}/${pub.file}.jpg" alt="${pub.title} thumbnail">`;
    }
    body += `<p><span class="tag">${catLabel}</span> &nbsp; <span class="tag mono">${pub.journal}</span> &nbsp; <span class="tag mono">${pub.year}</span></p>`;
    body += `<p>${pub.title}</p>`;
    if(assets.pdf){
      const folder = pub.file.startsWith('book') ? 'book' : (pub.file.startsWith('review') ? 'review' : 'research');
      body += `<a class="btn btn-solid" href="assets/pdfs/${folder}/${pub.file}.pdf" target="_blank" rel="noopener">Open Full Text ↗</a>`;
    } else {
      body += `<p class="mono" style="color:var(--paper-faint);">Full-text file not bundled with this record — add it under <span class="mono">assets/pdfs/</span> to enable the link.</p>`;
    }
    openModal(pub.title, body);
  }

  function initPubFilters(){
    document.querySelectorAll("#filterBar .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#filterBar .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentPubFilter = chip.dataset.filter;
        renderGel();
      });
    });
  }

  /* ============================================================
     JOURNEY — oscilloscope timeline
     ============================================================ */
  function renderScope(){
    const svg = document.getElementById("scopeSvg");
    const n = TIMELINE.length;
    const pad = 70;
    const stepX = (900 - pad*2) / (n-1 || 1);
    const points = TIMELINE.map((t,i) => {
      const x = pad + i*stepX;
      const y = 75 + Math.sin(i*1.7)*35;
      return {x,y,t};
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for(let i=1;i<points.length;i++){
      const p0 = points[i-1], p1 = points[i];
      const mx = (p0.x+p1.x)/2;
      path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    let svgHtml = `<path class="scope-path" d="${path}"></path>`;
    points.forEach((p,i) => {
      svgHtml += `<circle class="scope-node ${i===scopeIndex ? 'active':''}" data-i="${i}" cx="${p.x}" cy="${p.y}" r="6"></circle>`;
      svgHtml += `<text class="scope-node-label" x="${p.x}" y="${p.y+24}" text-anchor="middle">${p.t.year}</text>`;
    });
    svg.innerHTML = svgHtml;

    svg.querySelectorAll(".scope-node").forEach(node => {
      node.addEventListener("click", () => { scopeIndex = +node.dataset.i; renderScope(); renderScopeReadout(); });
    });
    renderScopeReadout();
  }

  function renderScopeReadout(){
    const t = TIMELINE[scopeIndex];
    document.getElementById("scopeReadout").innerHTML = `
      <div class="yr">// NODE ${String(scopeIndex+1).padStart(2,"0")} — ${t.year}</div>
      <h3>${t.title}</h3>
      <p>${t.desc}</p>`;
  }

  function initScopeControls(){
    document.getElementById("scopePrev").addEventListener("click", () => {
      scopeIndex = (scopeIndex - 1 + TIMELINE.length) % TIMELINE.length;
      renderScope();
    });
    document.getElementById("scopeNext").addEventListener("click", () => {
      scopeIndex = (scopeIndex + 1) % TIMELINE.length;
      renderScope();
    });
  }

  /* ============================================================
     RECORDS — tabs, specimen tray, CV
     ============================================================ */
  function renderCV(){
    const frame = document.getElementById("cvFrame");
    const pages = [
      { src:"assets/resume/resume1.jpg", label:"CV — Page 1" },
      { src:"assets/resume/resume2.jpg", label:"CV — Page 2" }
    ];
    frame.innerHTML = "";
    pages.forEach(p => {
      const el = document.createElement("div");
      el.className = "cv-page";
      el.innerHTML = `<img src="${p.src}" alt="${p.label}">`;
      el.addEventListener("click", () => openModal(p.label, `<img src="${p.src}" alt="${p.label}">`));
      frame.appendChild(el);
    });
  }

  function renderTrays(){
    if(!certData) return;
    Object.entries(certData).forEach(([key, cat]) => {
      const grid = document.getElementById("grid-" + key);
      if(!grid) return;
      grid.innerHTML = "";
      cat.items.forEach(item => {
        const el = document.createElement("div");
        el.className = "tray-item";
        const src = `assets/images/certificates/${key}/${item.file}.jpg`;
        el.innerHTML = `<div class="tray-img"><img src="${src}" alt="${item.title}"></div><div class="tray-cap">${item.title}</div>`;
        el.addEventListener("click", () => openModal(item.title, `<img src="${src}" alt="${item.title}"><p>${cat.note}</p>`));
        grid.appendChild(el);
      });
    });
  }

  function initTabs(){
    document.querySelectorAll("#expTabs .chip").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll("#expTabs .chip").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
      });
    });
  }

  /* ============================================================
     MODAL
     ============================================================ */
  function openModal(title, bodyHtml){
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    document.getElementById("modalOverlay").classList.add("open");
  }
  function closeModal(){
    document.getElementById("modalOverlay").classList.remove("open");
  }
  function initModal(){
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if(e.target.id === "modalOverlay") closeModal();
    });
    document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeModal(); });
  }

  /* ============================================================
     COMMAND PALETTE
     ============================================================ */
  function initPalette(){
    const overlay = document.getElementById("paletteOverlay");
    const input = document.getElementById("paletteInput");
    const list = document.getElementById("paletteList");

    function items(){
      const modes = [
        {label:"Overview", tag:"mode", action:() => setMode("home")},
        {label:"Profile", tag:"mode", action:() => setMode("profile")},
        {label:"Publications", tag:"mode", action:() => setMode("publications")},
        {label:"Timeline", tag:"mode", action:() => setMode("journey")},
        {label:"Records", tag:"mode", action:() => setMode("records")},
        {label:"Contact", tag:"mode", action:() => setMode("contact")}
      ];
      let pubItems = [];
      if(pubData){
        ["research","review","book"].forEach(cat => {
          pubData[cat].forEach(p => pubItems.push({
            label:p.title, tag:cat,
            action:() => { setMode("publications"); currentPubFilter="all"; renderGel(); openPubModal(p, cat); }
          }));
        });
      }
      return [...modes, ...pubItems];
    }

    function render(filter){
      const all = items();
      const q = filter.trim().toLowerCase();
      const filtered = q ? all.filter(i => i.label.toLowerCase().includes(q)) : all;
      list.innerHTML = "";
      filtered.slice(0,40).forEach((i,idx) => {
        const el = document.createElement("div");
        el.className = "palette-item" + (idx===0 ? " sel" : "");
        el.innerHTML = `<span>${i.label}</span><span class="p-tag">${i.tag}</span>`;
        el.addEventListener("click", () => { i.action(); close(); });
        list.appendChild(el);
      });
    }

    function open(){
      overlay.classList.add("open");
      input.value = "";
      render("");
      setTimeout(() => input.focus(), 50);
    }
    function close(){
      overlay.classList.remove("open");
    }

    document.getElementById("paletteBtn").addEventListener("click", open);
    overlay.addEventListener("click", (e) => { if(e.target.id === "paletteOverlay") close(); });
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){
        const sel = list.querySelector(".palette-item");
        if(sel) sel.click();
      }
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "/" && document.activeElement.tagName !== "INPUT"){
        e.preventDefault();
        open();
      } else if(e.key === "Escape"){
        close();
      }
    });
  }

  /* ============================================================
     DATA LOADING
     ============================================================ */
  async function loadData(){
    try{
      const [pubRes, certRes] = await Promise.all([
        fetch("data/publications.json"),
        fetch("data/certificates.json")
      ]);
      pubData = await pubRes.json();
      certData = await certRes.json();
    } catch(err){
      console.error("Data load failed — serve this site over HTTP (e.g. GitHub Pages or a local server) rather than opening index.html directly.", err);
      pubData = { research:[], review:[], book:[] };
      certData = {};
      const gel = document.getElementById("gelLanes");
      if(gel) gel.innerHTML = `<p class="gel-empty" style="padding:20px;">Could not load specimen data. If you're viewing this file directly from disk, serve it over HTTP instead (e.g. <span class="mono">python -m http.server</span>), or view the live GitHub Pages site.</p>`;
    }
    renderGel();
    renderTrays();
    renderMeta(currentMode);
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    boot();
    tickClock(); setInterval(tickClock, 1000);
    typedRoleLoop();
    initTheme();
    initRail();
    initNetwork();
    initProfile();
    initPubFilters();
    renderScope();
    initScopeControls();
    renderCV();
    initTabs();
    initModal();
    initPalette();
    loadData();
    setMode("home");
  });
})();
