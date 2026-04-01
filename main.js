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
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 2000);
  camera.position.z = 1000;

  // --- 1. CORE CRYSTALLINE STRUCTURE ---
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  const geometry = new THREE.IcosahedronGeometry(300, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00f5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const coreMesh = new THREE.Mesh(geometry, material);
  coreGroup.add(coreMesh);

  // Add points to the structure for a more tech look
  const pointsMat = new THREE.PointsMaterial({
    color: 0x00f5ff,
    size: 4,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6
  });
  const corePoints = new THREE.Points(geometry, pointsMat);
  coreGroup.add(corePoints);

  // Outer floating rings
  const ringGeo = new THREE.TorusGeometry(450, 1, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xb44fff, transparent: true, opacity: 0.15 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2;
  coreGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(520, 0.5, 16, 100), ringMat);
  ring2.rotation.y = Math.PI / 2;
  coreGroup.add(ring2);

  // --- 2. LUXURY PARTICLE FIELD ---
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

    const color = new THREE.Color();
    color.setHSL(0.5 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 5 + 1;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, 1.0 - (d * 2.0));
      }
    `,
    vertexColors: true
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- 3. INTERACTIVE LIGHT BEAMS ---
  const beamCount = 8;
  const beams = [];
  for (let i = 0; i < beamCount; i++) {
    const beamGeo = new THREE.CylinderGeometry(0.5, 4, 2000, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00f5ff : 0xb44fff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, -500);
    beam.rotation.x = Math.random() * Math.PI;
    beam.rotation.z = Math.random() * Math.PI;
    scene.add(beam);
    beams.push(beam);
  }

  // --- MOUSE INTERACTION ---
  let targetX = 0, targetY = 0;
  let mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - W / 2) / (W / 2);
    mouseY = (e.clientY - H / 2) / (H / 2);
  });

  // --- ANIMATION RE-SYNC ---
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x += (targetX * 200 - camera.position.x) * 0.05;
    camera.position.y += (-targetY * 200 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    coreGroup.rotation.y = time * 0.15;
    coreGroup.rotation.z = time * 0.1;

    ring1.rotation.y = time * 0.4;
    ring2.rotation.x = time * 0.3;

    particles.rotation.y = time * 0.05;
    particleMat.uniforms.time.value = time;

    beams.forEach((beam, i) => {
      beam.position.y += Math.sin(time + i) * 0.5;
      beam.rotation.y += 0.002;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
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
  initTheme();
}

// ======= THEME TOGGLE =======
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  toggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
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
