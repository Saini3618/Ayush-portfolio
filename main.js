/* ============================================================
   MAIN.JS — Ultra-Premium Portfolio Engine v2
   Ayush Saini | Flowing Nebula + Constellation Background
   ============================================================ */

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ======= PRELOADER =======
(function initPreloader() {
  const bar = document.querySelector('.preloader-bar-fill');
  const pct = document.querySelector('.preloader-percent');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 14;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(hidePreloader, 400);
    }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 70);

  function hidePreloader() {
    gsap.to('#preloader', {
      opacity: 0, duration: 0.9, ease: 'power2.out',
      onComplete: () => {
        document.getElementById('preloader').style.display = 'none';
        initAnimations();
      }
    });
  }
})();

// ============================================================
// THREE.JS — FLOWING NEBULA + CONSTELLATION BACKGROUND
// ============================================================
function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const W = canvas.clientWidth, H = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 3000);
  camera.position.z = 700;

  /* ---- 1. DEEP STAR LAYER (tiny white dots, very spread) ---- */
  const starCount = window.innerWidth < 768 ? 2500 : 5000;
  const sBuf = new Float32Array(starCount * 3);
  const sSize = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    sBuf[i * 3] = (Math.random() - 0.5) * 3000;
    sBuf[i * 3 + 1] = (Math.random() - 0.5) * 3000;
    sBuf[i * 3 + 2] = (Math.random() - 0.5) * 1200 - 400;
    sSize[i] = Math.random() * 1.2 + 0.3;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sBuf, 3));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));

  const starMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `
      attribute float aSize;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (350.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float a = pow(1.0 - d * 2.0, 3.0);
        gl_FragColor = vec4(0.78, 0.9, 1.0, a * 0.75);
      }`
  });
  scene.add(new THREE.Points(starGeo, starMat));

  /* ---- 2. NEBULA GLOW CLOUDS (large colour blobs) ---- */
  function makeNebulaSprite(color, opacity, size) {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 256;
    const ctx = cvs.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'));
    grad.addColorStop(0.4, color.replace(')', `, ${opacity * 0.3})`).replace('rgb', 'rgba'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cvs);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
  }

  const nebulaDefs = [
    { color: 'rgb(0,150,255)', opacity: 0.18, size: 800, x: -200, y: 80, z: -600 },
    { color: 'rgb(120,0,255)', opacity: 0.15, size: 700, x: 250, y: -60, z: -500 },
    { color: 'rgb(0,220,200)', opacity: 0.12, size: 600, x: 80, y: 200, z: -700 },
    { color: 'rgb(255,60,160)', opacity: 0.10, size: 500, x: -300, y: -150, z: -550 },
    { color: 'rgb(60,100,255)', opacity: 0.13, size: 900, x: 100, y: -80, z: -800 },
  ];
  nebulaDefs.forEach(d => {
    const s = makeNebulaSprite(d.color, d.opacity, d.size);
    s.position.set(d.x, d.y, d.z);
    scene.add(s);
  });

  /* ---- 3. CONSTELLATION NODE PARTICLES (brighter, mid-layer) ---- */
  const nodeCount = window.innerWidth < 768 ? 80 : 160;
  const nPos = new Float32Array(nodeCount * 3);
  const nData = [];   // store world-space coords for line drawing
  for (let i = 0; i < nodeCount; i++) {
    const x = (Math.random() - 0.5) * 1400;
    const y = (Math.random() - 0.5) * 900;
    const z = (Math.random() - 0.5) * 400 - 100;
    nPos[i * 3] = x; nPos[i * 3 + 1] = y; nPos[i * 3 + 2] = z;
    nData.push({ x, y, z, vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.1 });
  }
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));

  const nodeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 4.0 * (350.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float a = pow(1.0 - d * 2.0, 2.0);
        gl_FragColor = vec4(0.2, 0.85, 1.0, a * 0.9);   // cyan nodes
      }`
  });
  const nodePoints = new THREE.Points(nodeGeo, nodeMat);
  scene.add(nodePoints);

  /* ---- 4. CONSTELLATION LINES ---- */
  const maxDist = 220;
  const linePositions = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dx = nData[i].x - nData[j].x;
      const dy = nData[i].y - nData[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < maxDist) {
        linePositions.push(nData[i].x, nData[i].y, nData[i].z);
        linePositions.push(nData[j].x, nData[j].y, nData[j].z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  const lineBuf = new Float32Array(linePositions);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(lineBuf, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.12 });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  /* ---- 5. FLOATING CYAN ACCENT SPARKLES ---- */
  const sparkCount = 200;
  const spBuf = new Float32Array(sparkCount * 3);
  const spSize = new Float32Array(sparkCount);
  for (let i = 0; i < sparkCount; i++) {
    spBuf[i * 3] = (Math.random() - 0.5) * 1200;
    spBuf[i * 3 + 1] = (Math.random() - 0.5) * 800;
    spBuf[i * 3 + 2] = (Math.random() - 0.5) * 300;
    spSize[i] = Math.random() * 2.5 + 1.0;
  }
  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(spBuf, 3));
  spGeo.setAttribute('aSize', new THREE.BufferAttribute(spSize, 1));

  const spMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aSize;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float core = pow(1.0 - d * 2.0, 4.0);
        float glow = pow(1.0 - d * 2.0, 1.5) * 0.3;
        gl_FragColor = vec4(0.0, 0.95, 1.0, (core + glow) * 0.85);
      }`
  });
  const sparkles = new THREE.Points(spGeo, spMat);
  scene.add(sparkles);

  /* ---- MOUSE PARALLAX ---- */
  let mx = 0, my = 0, camX = 0, camY = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ---- RESIZE ---- */
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });

  /* ---- ANIMATE ---- */
  const clock = new THREE.Clock();
  let rafId;
  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth camera drift
    camX += (mx * 55 - camX) * 0.03;
    camY += (-my * 35 - camY) * 0.03;
    camera.position.x += (camX - camera.position.x) * 0.06;
    camera.position.y += (camY - camera.position.y) * 0.06;

    // Stars slow drift
    starGeo.attributes.position.needsUpdate = false;
    nodePoints.rotation.y = Math.sin(t * 0.04) * 0.06;
    nodePoints.rotation.x = Math.sin(t * 0.025) * 0.04;
    sparkles.rotation.y = t * 0.009;
    sparkles.rotation.z = Math.sin(t * 0.015) * 0.025;

    // Nebula gentle pulsing via camera z
    camera.position.z = 700 + Math.sin(t * 0.15) * 15;

    renderer.render(scene, camera);
  }
  animate();

  document.addEventListener('visibilitychange', () => {
    document.hidden ? cancelAnimationFrame(rafId) : animate();
  });
}

// ======= GSAP ANIMATIONS =======
function initAnimations() {
  gsap.to('#navbar', { opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 });
  gsap.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' });
  gsap.to('.hero-name', { opacity: 1, duration: 0 });
  gsap.to('.hero-name .char', { y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.04, delay: 0.55 });
  gsap.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.9, delay: 1.1, ease: 'power2.out' });
  gsap.to('.hero-cta-group', { opacity: 1, y: 0, duration: 0.9, delay: 1.35, ease: 'power2.out' });
  gsap.to('.hero-scroll-indicator', { opacity: 1, duration: 0.8, delay: 1.9 });

  initThreeJS();
  initTypewriter();
  initScrollAnimations();
  initNavbar();
  initCursor();
  initTilt();
  initProjectFilter();
  initAudio();
  initCounters();
  initEducationLines();
}

// ======= TYPEWRITER =======
function initTypewriter() {
  const phrases = ['IoT Engineer', 'Full-Stack Developer', 'Mechanical Diploma Holder', 'Competitive Athlete', 'B.Tech CS Student'];
  const el = document.getElementById('typed-text');
  if (!el) return;
  let pi = 0, ci = 0, del = false;
  function tick() {
    const cur = phrases[pi];
    el.textContent = del ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
    del ? ci-- : ci++;
    if (!del && ci === cur.length) { setTimeout(() => { del = true; tick(); }, 2000); return; }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    setTimeout(tick, del ? 45 : 85);
  }
  setTimeout(tick, 1700);
}

// ======= SCROLL ANIMATIONS =======
function initScrollAnimations() {
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });
  gsap.utils.toArray('.section-label').forEach(el => {
    gsap.fromTo(el, { opacity: 0, x: -30 }, {
      opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });
  gsap.fromTo('.about-left', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#about', start: 'top 75%', once: true } });
  gsap.fromTo('.about-right', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#about', start: 'top 75%', once: true } });
  gsap.fromTo('.stat-card', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.1, scrollTrigger: { trigger: '.stat-grid', start: 'top 86%', once: true } });
  gsap.fromTo('.project-card', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.projects-grid', start: 'top 80%', once: true } });
  gsap.fromTo('.cert-card', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.2)', stagger: 0.09, scrollTrigger: { trigger: '.achievements-grid', start: 'top 80%', once: true } });
  gsap.fromTo('.contact-form', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.contact-form', start: 'top 86%', once: true } });
}

// ======= EDUCATION TIMELINE LINES =======
function initEducationLines() {
  gsap.utils.toArray('.edu-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: i % 2 === 0 ? -60 : 60 },
      {
        opacity: 1, x: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 85%', once: true }
      }
    );
  });
  gsap.fromTo('.edu-line-fill',
    { scaleY: 0 },
    {
      scaleY: 1, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: '#education', start: 'top 70%', once: true }
    }
  );
}

// ======= COUNTERS =======
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.getAttribute('data-count'));
    const isFloat = String(target).includes('.');
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.fromTo({ val: 0 }, {
          val: target, duration: 1.6, ease: 'power2.out',
          onUpdate: function () {
            const v = this.targets()[0].val;
            el.textContent = isFloat ? v.toFixed(2) : Math.floor(v) + (el.getAttribute('data-suffix') || '');
          }
        });
      }
    });
  });
}

// ======= NAVBAR =======
function initNavbar() {
  const nav = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  });
  links.forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector(l.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ======= CURSOR =======
function initCursor() {
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cur || !ring) return;
  let rx = 0, ry = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
  });
  (function loopRing() {
    rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loopRing);
  })();
  document.querySelectorAll('a, button, .project-card, .cert-card, .skill-tag, .filter-btn, .social-link, .edu-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ======= TILT =======
function initTilt() {
  document.querySelectorAll('.profile-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mouse-x', (x * 100) + '%');
      card.style.setProperty('--mouse-y', (y * 100) + '%');
      gsap.to(card, { rotateX: (y - 0.5) * -14, rotateY: (x - 0.5) * 14, scale: 1.03, duration: 0.4, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    });
  });
}

// ======= PROJECT FILTER =======
function initProjectFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.project-card').forEach(card => {
        const show = f === 'all' || card.getAttribute('data-domain') === f;
        gsap.to(card, { opacity: show ? 1 : 0.18, scale: show ? 1 : 0.94, duration: 0.35, ease: 'power2.out' });
      });
    });
  });
}

// ======= AUDIO =======
function initAudio() {
  const btn = document.getElementById('audio-toggle');
  if (!btn) return;
  let ctx = null, playing = false, nodes = [];
  btn.addEventListener('click', () => {
    if (!playing) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 3);
      master.connect(ctx.destination);
      [55, 82.5, 110, 165].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lg = ctx.createGain();
        osc.type = i % 2 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        lfo.frequency.value = 0.06 + i * 0.03;
        lg.gain.value = freq * 0.007;
        lfo.connect(lg); lg.connect(osc.frequency); lfo.start();
        g.gain.value = 0.18 / (i + 1);
        osc.connect(g); g.connect(master); osc.start();
        nodes.push(osc, lfo);
      });
      playing = true; btn.classList.add('playing');
    } else {
      ctx?.close(); ctx = null; nodes = [];
      playing = false; btn.classList.remove('playing');
    }
  });
}

// ======= FORM =======
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const b = form.querySelector('.form-submit');
    const orig = b.textContent;
    b.textContent = '✓ Message Sent!';
    b.style.background = 'linear-gradient(135deg,#00ff87,#00b8a9)';
    gsap.to(b, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
    setTimeout(() => { b.textContent = orig; b.style.background = ''; form.reset(); }, 3000);
  });
}

// ======= CHAR SPLIT =======
document.querySelectorAll('.split-chars').forEach(el => {
  const text = el.textContent;
  el.innerHTML = text.split('').map(c => c === ' ' ? ' ' : `<span class="char">${c}</span>`).join('');
});

// ======= MOBILE TOUCH FLIP =======
document.querySelectorAll('.project-card').forEach(card => {
  let flipped = false;
  card.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      flipped = !flipped;
      card.querySelector('.project-card-inner').style.transform = flipped ? 'rotateY(180deg)' : '';
    }
  });
});

// ======= CANVAS RESIZE =======
(function () {
  function sz() {
    const c = document.getElementById('hero-canvas');
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';
  }
  sz();
  window.addEventListener('resize', sz);
})();
