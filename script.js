/* ============================================================
   «Un finde para Irene» — lógica · Tierra Media
   ============================================================
   Libro por capítulos con transiciones animadas · Puertas de
   Durin · cielo vivo con estrellas fugaces · cuenta atrás ·
   camino que se dibuja · sello de cera · corazón de estrellas.
   Todo lo editable está en CONFIG (justo aquí).
   ============================================================ */

/* -------------------- ✏️ CONFIG (edita esto) -------------------- */
const CONFIG = {
  // Nombre grande de la portada.
  NOMBRE: "Irene",

  // Puertas de Durin: pregunta y respuesta.
  // La comparación NO distingue mayúsculas ni tildes ni espacios de sobra.
  // Puede ser un texto o una lista de respuestas válidas.
  PREGUNTA_SECRETA: "¿Cómo me llamas cuando nadie nos oye?",
  RESPUESTA_SECRETA: ["gatito", "Gatito", "GATITO", "perrito", "Perrito", "PERRITO"],

  // Mensaje al pronunciar el juramento final.
  MENSAJE_FINAL: "El juramento queda pronunciado. Te espero el jueves ✦",

  // Cuándo empieza el finde (cuenta atrás de la portada).
  FECHA_LLEGADA: "2026-07-09T17:00:00",

  // Campanitas suaves al abrir la puerta, romper el sello y jurar.
  SONIDO: true,
};
/* ---------------------------------------------------------------- */


/* Normaliza texto: minúsculas, sin tildes, sin espacios de sobra.
   Así «Gatito », «GATITO» y «gatito» valen igual. */
function normalizar(txt) {
  return (txt || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")                 // separa letra y tilde
    .replace(/[̀-ͯ]/g, "")  // quita las tildes
    .replace(/\s+/g, " ");            // colapsa espacios
}

function coincideConRespuestaSecreta(txt) {
  const intento = normalizar(txt);
  const respuestas = Array.isArray(CONFIG.RESPUESTA_SECRETA)
    ? CONFIG.RESPUESTA_SECRETA
    : [CONFIG.RESPUESTA_SECRETA];

  return respuestas.some((respuesta) => normalizar(respuesta) === intento);
}

document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const punteroFino = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Rellenar textos desde CONFIG ---------- */
  const preguntaEl = document.getElementById("puerta-pregunta");
  if (preguntaEl) preguntaEl.textContent = CONFIG.PREGUNTA_SECRETA;
  const nombreEl = document.getElementById("portada-nombre");
  if (nombreEl) nombreEl.textContent = CONFIG.NOMBRE;

  /* ============================================================
     Campanitas (WebAudio, sin archivos). Suenan tras un gesto
     de la usuaria, así el navegador no las bloquea.
     ============================================================ */
  let audioCtx = null;
  function campanitas(notas) {
    if (!CONFIG.SONIDO || reduce) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime;
      notas.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gan = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        gan.gain.setValueAtTime(0.0001, t0 + i * 0.14);
        gan.gain.exponentialRampToValueAtTime(0.05, t0 + i * 0.14 + 0.02);
        gan.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.14 + 0.9);
        osc.connect(gan).connect(audioCtx.destination);
        osc.start(t0 + i * 0.14);
        osc.stop(t0 + i * 0.14 + 1);
      });
    } catch (e) { /* sin audio no pasa nada */ }
  }

  /* ============================================================
     Canvas de partículas (puerta, sello, corazón final)
     ============================================================ */
  const fxCanvas = document.getElementById("fx");
  const fxCtx = fxCanvas ? fxCanvas.getContext("2d") : null;
  const COLORES = ["#e8c47c", "#f2b8c6", "#fff6e0"];
  let fxParts = [];
  let fxVivo = false;
  let fxAntes = 0;

  function fxMedir() {
    if (!fxCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxCanvas.width = innerWidth * dpr;
    fxCanvas.height = innerHeight * dpr;
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fxMedir();
  addEventListener("resize", fxMedir);

  function fxArrancar() {
    if (fxVivo || !fxCtx) return;
    fxVivo = true;
    fxAntes = performance.now();
    requestAnimationFrame(fxPaso);
  }

  function fxPaso(ts) {
    const dt = Math.min(0.05, (ts - fxAntes) / 1000);
    fxAntes = ts;
    fxCtx.clearRect(0, 0, innerWidth, innerHeight);
    fxParts = fxParts.filter((p) => {
      let alfa = 0, x = p.x, y = p.y;
      if (p.tipo === "b") {                       // chispa (explosión)
        p.vx *= 0.96; p.vy = p.vy * 0.96 + 4 * dt;
        p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
        p.vida -= dt / p.dur;
        if (p.vida <= 0) return false;
        alfa = Math.max(0, p.vida); x = p.x; y = p.y;
      } else {                                    // estrella del corazón
        p.t += dt;
        if (p.t < 0) return true;                 // aún en retardo
        const prog = Math.min(1, p.t / 1.1);
        const e = 1 - Math.pow(1 - prog, 3);      // easeOutCubic
        x = p.x + (p.tx - p.x) * e;
        y = p.y + (p.ty - p.y) * e + Math.sin(p.t * 2 + p.fase) * 1.5 * prog;
        if (prog < 1) alfa = 0.4 + 0.6 * prog;
        else if (p.t < 3.2) alfa = 0.7 + 0.3 * Math.sin(p.t * 6 + p.fase);
        else alfa = Math.max(0, 1 - (p.t - 3.2) / 1.3);
        if (p.t > 4.5) return false;
      }
      fxCtx.globalAlpha = alfa;
      fxCtx.fillStyle = p.color;
      fxCtx.shadowBlur = 9;
      fxCtx.shadowColor = p.color;
      fxCtx.beginPath();
      fxCtx.arc(x, y, p.r, 0, 7);
      fxCtx.fill();
      return true;
    });
    fxCtx.globalAlpha = 1;
    fxCtx.shadowBlur = 0;
    if (fxParts.length) requestAnimationFrame(fxPaso);
    else { fxVivo = false; fxCtx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* explosión de chispas doradas en (x, y) */
  function fxChispas(x, y, n = 50, fuerza = 5) {
    if (reduce || !fxCtx || fxParts.length > 700) return;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = (0.25 + Math.random()) * fuerza;
      fxParts.push({
        tipo: "b", x, y,
        vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - fuerza * 0.3,
        vida: 1, dur: 0.7 + Math.random() * 0.7,
        r: 1 + Math.random() * 1.8,
        color: COLORES[i % COLORES.length],
      });
    }
    fxArrancar();
  }

  /* las estrellas vuelan desde (ox, oy) y forman un corazón */
  function fxCorazon(ox, oy) {
    if (reduce || !fxCtx || fxParts.length > 700) return;
    const n = 120;
    const esc = Math.min(innerWidth, innerHeight) / 42;
    const cx = innerWidth / 2;
    const cy = innerHeight * 0.42;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      fxParts.push({
        tipo: "c",
        x: ox + (Math.random() * 40 - 20),
        y: oy + (Math.random() * 24 - 12),
        tx: cx + 16 * Math.pow(Math.sin(a), 3) * esc,
        ty: cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * esc,
        t: -((i % 24) * 0.03 + Math.random() * 0.2),
        r: 1.6 + Math.random() * 1.6,
        fase: Math.random() * 6,
        color: COLORES[i % COLORES.length],
      });
    }
    fxArrancar();
  }

  /* ============================================================
     El cielo: estrellas con parálaje y estrellas fugaces
     ============================================================ */
  const cielo = document.getElementById("cielo");
  if (cielo && !reduce) {
    const ctx = cielo.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let estrellas = [];
    let fugaces = [];
    let proxFugaz = 3000;                 // la primera, prontito
    let punX = 0, punY = 0, suaveX = 0, suaveY = 0;

    function medirCielo() {
      cielo.width = innerWidth * dpr;
      cielo.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(230, Math.round((innerWidth * innerHeight) / 6500));
      estrellas = Array.from({ length: n }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: 0.4 + Math.random() * 1.2,
        prof: 0.25 + Math.random() * 0.75,     // profundidad → parálaje
        fase: Math.random() * Math.PI * 2,
        vel: 0.4 + Math.random() * 1.6,
        tono: Math.random() < 0.18 ? "#ffe9c2" : "#ffffff",
      }));
    }
    medirCielo();
    addEventListener("resize", medirCielo);
    addEventListener("pointermove", (e) => {
      punX = e.clientX / innerWidth - 0.5;
      punY = e.clientY / innerHeight - 0.5;
    }, { passive: true });

    function marcoCielo(ts) {
      const t = ts / 1000;
      suaveX += (punX - suaveX) * 0.04;
      suaveY += (punY - suaveY) * 0.04;
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      for (const e of estrellas) {
        const alfa = 0.3 + 0.45 * (0.5 + 0.5 * Math.sin(t * e.vel + e.fase));
        let x = e.x + suaveX * 22 * e.prof;
        let y = e.y + suaveY * 14 * e.prof;
        ctx.globalAlpha = alfa;
        ctx.fillStyle = e.tono;
        ctx.beginPath();
        ctx.arc(x, y, e.r, 0, 7);
        ctx.fill();
      }

      /* estrellas fugaces, de cuando en cuando */
      if (ts > proxFugaz) {
        proxFugaz = ts + 6000 + Math.random() * 8000;
        const desdeX = innerWidth * (0.15 + Math.random() * 0.7);
        fugaces.push({
          x: desdeX, y: innerHeight * (0.05 + Math.random() * 0.25),
          vx: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 3),
          vy: 2.4 + Math.random() * 1.6,
          vida: 1,
        });
      }
      fugaces = fugaces.filter((f) => {
        f.x += f.vx; f.y += f.vy; f.vida -= 0.016;
        if (f.vida <= 0) return false;
        const grad = ctx.createLinearGradient(f.x, f.y, f.x - f.vx * 9, f.y - f.vy * 9);
        grad.addColorStop(0, "rgba(255,246,224," + (0.85 * f.vida) + ")");
        grad.addColorStop(1, "rgba(255,246,224,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - f.vx * 9, f.y - f.vy * 9);
        ctx.stroke();
        return true;
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(marcoCielo);
    }
    requestAnimationFrame(marcoCielo);
  }

  /* ============================================================
     El libro: capítulos con transición y navegación
     ============================================================ */
  const libro = document.getElementById("libro");
  const caps = Array.from(document.querySelectorAll(".capitulo"));
  const puntosCont = document.getElementById("nav-puntos");
  const btnPrev = document.getElementById("nav-prev");
  const btnNext = document.getElementById("nav-next");
  let actual = 0;

  /* puntos-estrella de navegación */
  caps.forEach((cap, i) => {
    const b = document.createElement("button");
    b.className = "nav__punto";
    b.textContent = "✦";
    b.title = cap.dataset.titulo || "Capítulo " + (i + 1);
    b.setAttribute("aria-label", b.title);
    b.addEventListener("click", () => irA(i));
    puntosCont.appendChild(b);
  });
  const puntos = Array.from(puntosCont.children);

  function actualizarNav() {
    puntos.forEach((p, i) => p.classList.toggle("actual", i === actual));
    btnPrev.disabled = actual === 0;
    btnNext.disabled = actual === caps.length - 1;
  }

  function irA(n, forzar = false) {
    n = Math.max(0, Math.min(caps.length - 1, n));
    if (n === actual && !forzar) return;
    document.documentElement.style.setProperty("--dir", n >= actual ? 1 : -1);

    if (!forzar) {
      const saliente = caps[actual];
      saliente.classList.add("saliente");
      saliente.classList.remove("activo");
      setTimeout(() => saliente.classList.remove("saliente"), 650);
    }
    actual = n;
    const cap = caps[actual];
    cap.classList.add("activo");
    cap.scrollTop = 0;
    actualizarNav();
    if (cap.dataset.etapa) animarRuta(cap);
  }

  btnPrev.addEventListener("click", () => irA(actual - 1));
  btnNext.addEventListener("click", () => irA(actual + 1));

  /* botones internos: data-nav="next|prev" y saltos data-ir="id" */
  document.querySelectorAll("[data-nav]").forEach((b) =>
    b.addEventListener("click", () => irA(actual + (b.dataset.nav === "prev" ? -1 : 1))));
  document.querySelectorAll("[data-ir]").forEach((b) =>
    b.addEventListener("click", () => {
      const destino = caps.findIndex((c) => c.id === b.dataset.ir);
      if (destino >= 0) irA(destino);
    }));

  /* ============================================================
     Mapa de Misiones: revelar hitos y guardar objetivos marcados
     ============================================================ */
  const MISIONES_STORAGE = "web-irene-misiones-v1";
  const misiones = document.querySelector(".misiones");
  if (misiones) {
    const hitos = Array.from(misiones.querySelectorAll(".mision-hito"));
    const paneles = Array.from(misiones.querySelectorAll(".mision-panel"));
    const hitoPorMision = new Map(hitos.map((hito) => [hito.dataset.mision, hito]));
    const panelPorMision = new Map(paneles.map((panel) => [panel.dataset.mision, panel]));
    const checks = Array.from(misiones.querySelectorAll("[data-mision-check]"));

    function leerEstadoMisiones() {
      try {
        const guardado = JSON.parse(localStorage.getItem(MISIONES_STORAGE) || "{}");
        return {
          abiertas: guardado.abiertas && typeof guardado.abiertas === "object" ? guardado.abiertas : {},
          checks: guardado.checks && typeof guardado.checks === "object" ? guardado.checks : {},
          activa: typeof guardado.activa === "string" ? guardado.activa : "",
        };
      } catch (e) {
        return { abiertas: {}, checks: {}, activa: "" };
      }
    }

    const estadoMisiones = leerEstadoMisiones();

    function guardarEstadoMisiones() {
      try {
        localStorage.setItem(MISIONES_STORAGE, JSON.stringify(estadoMisiones));
      } catch (e) { /* si el navegador no guarda estado, la página sigue funcionando */ }
    }

    function checksDeMision(clave) {
      const panel = panelPorMision.get(clave);
      return panel ? Array.from(panel.querySelectorAll("[data-mision-check]")) : [];
    }

    function refrescarMision(clave) {
      const hito = hitoPorMision.get(clave);
      const panel = panelPorMision.get(clave);
      if (!hito || !panel) return;

      const abierta = Boolean(estadoMisiones.abiertas[clave]);
      const visible = abierta && estadoMisiones.activa === clave;
      const checksMision = checksDeMision(clave);
      const hechos = checksMision.filter((check) => check.checked).length;
      const completada = checksMision.length > 0 && hechos === checksMision.length;

      hito.setAttribute("aria-expanded", visible ? "true" : "false");
      hito.classList.toggle("desbloqueado", abierta);
      hito.classList.toggle("completado", completada);
      panel.hidden = !visible;
      panel.classList.toggle("revelado", visible);
      panel.classList.toggle("completado", completada);

      const estado = hito.querySelector(".mision-hito__estado");
      if (estado) estado.textContent = completada ? "Lista" : abierta ? "Revelada" : "Por revelar";

      const progreso = panel.querySelector("[data-mision-progreso]");
      if (progreso) progreso.textContent = hechos + "/" + checksMision.length;
    }

    function abrirMision(clave, origen) {
      const primeraVez = !estadoMisiones.abiertas[clave];
      estadoMisiones.abiertas[clave] = true;
      estadoMisiones.activa = clave;
      guardarEstadoMisiones();
      hitos.forEach((hito) => refrescarMision(hito.dataset.mision));

      if (primeraVez && origen) {
        campanitas([523.25, 659.25]);
        const r = origen.getBoundingClientRect();
        fxChispas(r.left + r.width / 2, r.top + r.height / 2, 26, 3.2);
      }
    }

    checks.forEach((check) => {
      const id = check.dataset.misionCheck;
      const panel = check.closest(".mision-panel");
      const clave = panel ? panel.dataset.mision : "";
      check.checked = Boolean(estadoMisiones.checks[id]);
      if (check.checked && clave) estadoMisiones.abiertas[clave] = true;

      check.addEventListener("change", () => {
        if (check.checked) estadoMisiones.checks[id] = true;
        else delete estadoMisiones.checks[id];
        if (clave) estadoMisiones.abiertas[clave] = true;
        if (clave && !estadoMisiones.activa) estadoMisiones.activa = clave;
        guardarEstadoMisiones();
        hitos.forEach((hito) => refrescarMision(hito.dataset.mision));
      });
    });

    hitos.forEach((hito) => {
      hito.addEventListener("click", () => abrirMision(hito.dataset.mision, hito));
    });

    if (!estadoMisiones.activa) {
      const primeraAbierta = hitos.find((hito) => estadoMisiones.abiertas[hito.dataset.mision]);
      if (primeraAbierta) estadoMisiones.activa = primeraAbierta.dataset.mision;
    }
    hitos.forEach((hito) => refrescarMision(hito.dataset.mision));
    guardarEstadoMisiones();
  }

  /* teclado (cuando el libro ya está a la vista) */
  addEventListener("keydown", (e) => {
    if (libro.hidden || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "ArrowRight" || e.key === "PageDown") irA(actual + 1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") irA(actual - 1);
  });

  /* deslizar el dedo (móvil) */
  let toqueX = 0, toqueY = 0;
  libro.addEventListener("touchstart", (e) => {
    toqueX = e.changedTouches[0].clientX;
    toqueY = e.changedTouches[0].clientY;
  }, { passive: true });
  libro.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - toqueX;
    const dy = e.changedTouches[0].clientY - toqueY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      irA(actual + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ============================================================
     Las Puertas de Durin
     ============================================================ */
  const puerta = document.getElementById("puerta");
  const form = document.getElementById("puerta-form");
  const input = document.getElementById("puerta-input");
  const errorEl = document.getElementById("puerta-error");

  function abrirPuerta() {
    libro.hidden = false;
    puerta.classList.add("abierta");
    requestAnimationFrame(() => irA(0, true));   // el primer capítulo entra animado
    const quitar = () => { puerta.style.display = "none"; };
    if (reduce) quitar();
    else puerta.addEventListener("transitionend", quitar, { once: true });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (coincideConRespuestaSecreta(input.value)) {
        errorEl.hidden = true;
        puerta.classList.add("exito");           // los grabados se encienden
        campanitas([587.33, 880]);               // re5 · la5
        const svg = puerta.querySelector(".puerta__svg").getBoundingClientRect();
        fxChispas(svg.left + svg.width / 2, svg.top + svg.height / 2, 70, 5.5);
        setTimeout(abrirPuerta, reduce ? 0 : 750);
      } else {
        errorEl.hidden = false;
        form.classList.add("tiembla");
        setTimeout(() => form.classList.remove("tiembla"), 550);
        input.value = "";
        input.focus();
      }
    });
  }

  /* ============================================================
     Cuenta atrás de la portada («se acerca el finde»)
     ============================================================ */
  const cuenta = document.getElementById("cuenta");
  if (cuenta) {
    const objetivo = new Date(CONFIG.FECHA_LLEGADA).getTime();
    const label = cuenta.querySelector(".cuenta__label");
    const cajas = cuenta.querySelector(".cuenta__cajas");
    const celdas = ["cd-d", "cd-h", "cd-m", "cd-s"].map((id) => document.getElementById(id));
    const pad = (n) => String(n).padStart(2, "0");
    let intervalo = null;

    function tic() {
      const falta = objetivo - Date.now();
      if (falta <= 0) {
        label.textContent = "La Compañía ya está en marcha ✦";
        cajas.hidden = true;
        if (intervalo) clearInterval(intervalo);
        return;
      }
      const seg = Math.floor(falta / 1000);
      celdas[0].textContent = pad(Math.floor(seg / 86400));
      celdas[1].textContent = pad(Math.floor((seg % 86400) / 3600));
      celdas[2].textContent = pad(Math.floor((seg % 3600) / 60));
      celdas[3].textContent = pad(seg % 60);
    }
    cuenta.hidden = false;
    tic();
    intervalo = setInterval(tic, 1000);
  }

  /* ============================================================
     Mini-mapas de ruta: el camino se dibuja hasta la etapa
     y Gandatito avanza por él
     ============================================================ */
  const SVG_NS = "http://www.w3.org/2000/svg";

  document.querySelectorAll(".capitulo--dia .ruta").forEach((ruta) => {
    const base = ruta.querySelector(".ruta__base");
    const oro = ruta.querySelector(".ruta__oro");
    const hitos = ruta.querySelector(".ruta__hitos");
    const len = oro.getTotalLength();
    oro.style.strokeDasharray = len;
    oro.style.strokeDashoffset = len;
    for (let i = 0; i < 4; i++) {
      const p = base.getPointAtLength(base.getTotalLength() * (i / 3));
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("cx", p.x);
      c.setAttribute("cy", p.y);
      c.setAttribute("r", 3.2);
      hitos.appendChild(c);
    }
  });

  function animarRuta(cap) {
    const etapa = Number(cap.dataset.etapa);      // 1..4
    const ruta = cap.querySelector(".ruta");
    if (!ruta) return;
    const oro = ruta.querySelector(".ruta__oro");
    const guia = ruta.querySelector(".ruta__guia");
    const len = oro.getTotalLength();
    const frac = (etapa - 1) / 3;

    /* hitos ya pisados */
    ruta.querySelectorAll(".ruta__hitos circle").forEach((c, i) =>
      c.classList.toggle("pisado", i < etapa));

    /* el trazo dorado se dibuja desde el principio hasta la etapa */
    oro.style.transition = "none";
    oro.style.strokeDashoffset = len;
    guia.style.transition = "none";
    colocarGuia(ruta, guia, oro.getPointAtLength(0));

    if (reduce) {
      oro.style.strokeDashoffset = len * (1 - frac);
      colocarGuia(ruta, guia, oro.getPointAtLength(len * frac));
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      oro.style.transition = "stroke-dashoffset 1.5s cubic-bezier(.4,0,.25,1) .35s";
      oro.style.strokeDashoffset = len * (1 - frac);
      guia.style.transition = "transform 1.5s cubic-bezier(.4,0,.25,1) .35s";
      colocarGuia(ruta, guia, oro.getPointAtLength(len * frac));
    }));
  }

  /* convierte coordenadas del viewBox (300×48) a píxeles reales */
  function colocarGuia(ruta, guia, punto) {
    const svg = ruta.querySelector("svg");
    const escala = svg.getBoundingClientRect().width / 300;
    guia.style.transform =
      "translate(" + (punto.x * escala - 13) + "px, " + (punto.y * escala - 13) + "px)";
  }

  /* ============================================================
     La carta: romper el sello de cera
     ============================================================ */
  const sobre = document.getElementById("sobre");
  const sello = document.getElementById("sello");
  if (sobre && sello) {
    const pergamino = document.getElementById("pergamino");
    pergamino.setAttribute("aria-hidden", "true");
    const parrafos = sobre.querySelectorAll(".prosa--carta p");
    parrafos.forEach((p, i) => { p.style.transitionDelay = (0.55 + i * 0.3) + "s"; });

    sello.addEventListener("click", () => {
      if (sobre.classList.contains("abierto")) return;
      sobre.classList.add("abierto");
      sello.setAttribute("aria-expanded", "true");
      pergamino.removeAttribute("aria-hidden");
      campanitas([523.25, 783.99]);              // do5 · sol5
      const r = sello.getBoundingClientRect();
      fxChispas(r.left + r.width / 2, r.top + r.height / 2, 28, 3.5);
    });
  }

  /* ============================================================
     El juramento final: lluvia y corazón de estrellas
     ============================================================ */
  const btnFinal = document.getElementById("btn-mision");
  const okFinal = document.getElementById("mision-ok");
  const lluvia = document.getElementById("lluvia");

  if (btnFinal) {
    btnFinal.addEventListener("click", () => {
      okFinal.textContent = CONFIG.MENSAJE_FINAL;
      okFinal.hidden = false;
      campanitas([659.25, 783.99, 987.77]);      // mi5 · sol5 · si5
      lanzarLluvia();
      const r = btnFinal.getBoundingClientRect();
      fxCorazon(r.left + r.width / 2, r.top + r.height / 2);
    });
  }

  function lanzarLluvia() {
    if (reduce) return;
    const emojis = ["✦", "✧", "⭐", "🐱", "🐾", "🌟"];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = (0.9 + Math.random() * 1.4) + "rem";
      const dur = 3 + Math.random() * 3;
      s.style.animationDuration = dur + "s";
      s.style.animationDelay = Math.random() * 1.2 + "s";
      lluvia.appendChild(s);
      setTimeout(() => s.remove(), (dur + 1.4) * 1000);
    }
  }

  /* ============================================================
     Polvo de estrellas tras el cursor (solo ratón, poco y suave)
     ============================================================ */
  if (punteroFino && !reduce) {
    const polvo = document.getElementById("polvo");
    let ultimo = 0;
    addEventListener("pointermove", (e) => {
      const ahora = performance.now();
      if (ahora - ultimo < 55) return;
      ultimo = ahora;
      const s = document.createElement("span");
      s.textContent = Math.random() < 0.2 ? "✧" : "✦";
      s.style.left = (e.clientX + Math.random() * 12 - 6) + "px";
      s.style.top = (e.clientY + Math.random() * 12 - 6) + "px";
      polvo.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, { passive: true });
  }
});
