/* ============================================================
   PORTFÓLIO ISABELLA — SCRIPT.JS
   Funcionalidades: tema, menu mobile, header scroll, navegação ativa,
   scroll reveal (Edolus), triângulos interativos com scroll (La Boîte à Slide),
   elemento 3D giratório contínuo na Hero (Sobha Privy Collection),
   formulário de contato e rolagem suave.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ===== Detecção de movimento reduzido ===== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. TEMA ESCURO / CLARO
     ========================================================== */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('portfolio-theme');

  // Aplica tema salvo, URL param / hash ou padrão (escuro)
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  const hash = window.location.hash;

  if (themeParam === 'light' || hash.includes('theme=light') || hash.includes('theme-light')) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (themeParam === 'dark' || hash.includes('theme=dark') || hash.includes('theme-dark')) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Suporte a scroll via hash ou URL param
  const scrollParam = urlParams.get('scroll');
  const scrollMatch = hash.match(/scroll[=-](\d+)/);
  if (scrollParam || scrollMatch) {
    const targetY = scrollParam ? parseInt(scrollParam, 10) : parseInt(scrollMatch[1], 10);
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, targetY);
  } else if (hash && hash.length > 1) {
    const targetId = hash.split(',')[0].replace('#', '');
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      document.documentElement.style.scrollBehavior = 'auto';
      targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
  });

  /* ==========================================================
     2. MENU MOBILE
     ========================================================== */
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link');

  // Cria overlay
  const overlay = document.createElement('div');
  overlay.classList.add('nav-overlay');
  document.body.appendChild(overlay);

  function openMenu() {
    navMenu.classList.add('show-menu');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('show-menu');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (navToggle) navToggle.addEventListener('click', openMenu);
  if (navClose) navClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // Fecha menu ao clicar em um link
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha menu com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('show-menu')) {
      closeMenu();
    }
  });

  /* ==========================================================
     3. HEADER COM SOMBRA NO SCROLL
     ========================================================== */
  const header = document.getElementById('header');

  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ==========================================================
     4. NAVEGAÇÃO ATIVA POR SEÇÃO
     ========================================================== */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${sectionId}"]`);

      if (link) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          link.classList.add('active-link');
        } else {
          link.classList.remove('active-link');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ==========================================================
     5. SCROLL REVEAL (Referência: Edolus)
     ========================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  function checkReveal() {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 50) {
        el.classList.add('revealed');
      }
    });
  }

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
    window.addEventListener('scroll', checkReveal, { passive: true });
    checkReveal();
  } else {
    revealElements.forEach(el => {
      el.classList.add('revealed');
    });
  }

  /* ==========================================================
     6. TRIÂNGULOS GEOMÉTRICOS INTERATIVOS (La Boîte à Slide)
     - Respondem estritamente à rolagem da página (roda do mouse/scroll)
     - Rolagem para baixo desloca e rotaciona os triângulos
     - Rolagem para cima inverte o movimento e a rotação
     - Velocidades e direções variadas (profundidade de parallax)
     - Formas geométricas e tamanhos variados e visíveis
     - Distribuídos pelo fundo sem interferir no conteúdo
     - Quantidade adaptada para dispositivos móveis
     ========================================================== */
  function initParallaxTriangles() {
    const container = document.getElementById('trianglesContainer');
    if (!container) return;

    container.innerHTML = '';
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 9 : 20;

    const triangles = [];

    // Formas de triângulos em SVG (equilátero, retângulo, agudo estilizado)
    const triangleShapes = [
      '50,8 92,88 8,88',
      '15,12 88,88 12,88',
      '50,5 95,95 22,80',
      '8,15 88,15 48,88',
      '85,12 12,50 85,88'
    ];

    for (let i = 0; i < count; i++) {
      // Tamanhos variados: pequeno (38-55px), médio (65-90px), grande (95-135px)
      const sizeTier = i % 3;
      let size;
      if (sizeTier === 0) {
        size = isMobile ? 32 + Math.random() * 15 : 40 + Math.random() * 18;
      } else if (sizeTier === 1) {
        size = isMobile ? 48 + Math.random() * 20 : 68 + Math.random() * 22;
      } else {
        size = isMobile ? 65 + Math.random() * 25 : 100 + Math.random() * 32;
      }

      // Profundidade (1 = longe, 2 = médio, 3 = perto)
      const depth = (i % 3) + 1;

      // Velocidade vertical: alternando direções para enriquecer o efeito parallax
      // Alguns sobem e outros descem conforme a rolagem desce
      const directionY = (i % 2 === 0) ? 1 : -1;
      const speedY = directionY * (0.18 + depth * 0.14 + (Math.random() * 0.1));
      const speedX = (Math.random() - 0.5) * 0.12;

      // Rotação: velocidade proporcional à rolagem
      const rotDirection = (i % 2 === 0) ? 1 : -1;
      const rotSpeed = rotDirection * (0.09 + Math.random() * 0.14);
      const baseRotation = Math.random() * 360;

      // Distribuição pela tela
      const baseX = 4 + (i / count) * 92 + (Math.random() - 0.5) * 10;
      const baseY = (i / count) * 100;

      // Opacidade visível
      const opacity = isMobile ? 0.35 + Math.random() * 0.25 : 0.4 + Math.random() * 0.3;

      // Criação do elemento SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'parallax-triangle');
      svg.setAttribute('width', Math.round(size));
      svg.setAttribute('height', Math.round(size));
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('aria-hidden', 'true');

      const shape = triangleShapes[i % triangleShapes.length];
      const styleType = i % 3; // 0: gradiente, 1: outline, 2: preenchido + contorno

      if (styleType === 0) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        const gradId = `triGrad_${i}_${Date.now()}`;
        grad.setAttribute('id', gradId);
        grad.setAttribute('x1', '0%');
        grad.setAttribute('y1', '0%');
        grad.setAttribute('x2', '100%');
        grad.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#EC4899');
        stop1.setAttribute('stop-opacity', opacity.toFixed(2));

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#EF4444');
        stop2.setAttribute('stop-opacity', (opacity * 0.75).toFixed(2));

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
        svg.appendChild(defs);

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', shape);
        polygon.setAttribute('fill', `url(#${gradId})`);
        svg.appendChild(polygon);
      } else if (styleType === 1) {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', shape);
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', '#EC4899');
        polygon.setAttribute('stroke-width', '3');
        polygon.setAttribute('stroke-opacity', opacity.toFixed(2));
        svg.appendChild(polygon);
      } else {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', shape);
        polygon.setAttribute('fill', `rgba(236, 72, 153, ${(opacity * 0.35).toFixed(2)})`);
        polygon.setAttribute('stroke', '#EC4899');
        polygon.setAttribute('stroke-width', '2.5');
        polygon.setAttribute('stroke-opacity', opacity.toFixed(2));
        svg.appendChild(polygon);
      }

      container.appendChild(svg);

      triangles.push({
        el: svg,
        size,
        baseX,
        baseY,
        speedX,
        speedY,
        rotSpeed,
        baseRotation
      });
    }

    // Atualização sincronizada com a rolagem
    let ticking = false;

    function renderTriangles() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const wrapRange = vh + 260; // Margem para entrada/saída suave

      triangles.forEach(tri => {
        // Posição base em pixels na viewport
        const startY = (tri.baseY / 100) * vh;
        const dispY = scrollY * tri.speedY;
        const dispX = scrollY * tri.speedX;

        // Empacotamento modular da posição Y para que cubra toda a página de forma fluida
        let curY = ((startY + dispY) % wrapRange + wrapRange) % wrapRange - 130;
        let curX = ((tri.baseX / 100) * vw + dispX);

        // Limita X suavemente às bordas da tela
        if (curX < -80) curX = vw + 40;
        if (curX > vw + 80) curX = -40;

        // Rotação que responde rigorosamente à rolagem (para frente ou para trás)
        const curRot = tri.baseRotation + scrollY * tri.rotSpeed;

        tri.el.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) rotate(${curRot.toFixed(1)}deg)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(renderTriangles);
        ticking = true;
      }
    }, { passive: true });

    // Render inicial
    renderTriangles();
  }

  initParallaxTriangles();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initParallaxTriangles, 200);
  });

  /* ==========================================================
     7. ELEMENTO VISUAL 3D GIRATÓRIO DA HERO (Sobha Privy Collection)
     - Renderizado em HTML5 Canvas de alta performance (60 FPS)
     - Geometria tridimensional volumétrica abstrata (fita contínua em nó toroidal)
     - Rotação contínua e suave em múltiplos eixos tridimensionais (X, Y, Z)
     - Não trava, continua em loop perpétuo independente da rolagem
     - Cores no modo escuro: tons de rosa luminosos (#EC4899), nuances de vermelho (#EF4444)
     - Cores no modo claro: rosa marcante (#DB2777/#BE185D) com alto contraste contra fundo claro
     - Responsivo com suporte a Retina Display
     ========================================================== */
  function initHero3DOrb() {
    const canvas = document.getElementById('heroOrbCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : { width: 680, height: 680 };
      width = Math.max(rect.width, 300);
      height = Math.max(rect.height, 300);

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Geometria tridimensional: fita com volume ao longo de um nó toroidal (trefoil knot)
    const NUM_SEGS = 96;
    const ribbonCurve = [];

    for (let i = 0; i < NUM_SEGS; i++) {
      const u = (i / NUM_SEGS) * Math.PI * 2;
      // Nó de Trefoil paramétrico
      const p = 2;
      const q = 3;
      const r = 1.05 + 0.42 * Math.cos(q * u);
      const x = r * Math.cos(p * u);
      const y = r * Math.sin(p * u);
      const z = -0.72 * Math.sin(q * u);

      ribbonCurve.push({ x, y, z, u });
    }

    // Calcula quads volumétricos da fita
    const quads = [];
    for (let i = 0; i < NUM_SEGS; i++) {
      const nextIdx = (i + 1) % NUM_SEGS;
      const prevIdx = (i - 1 + NUM_SEGS) % NUM_SEGS;

      const p0 = ribbonCurve[i];
      const pNext = ribbonCurve[nextIdx];
      const pPrev = ribbonCurve[prevIdx];

      // Vetor tangente
      const tx = pNext.x - pPrev.x;
      const ty = pNext.y - pPrev.y;
      const tz = pNext.z - pPrev.z;
      const tLen = Math.hypot(tx, ty, tz) || 1;
      const T = { x: tx / tLen, y: ty / tLen, z: tz / tLen };

      // Vetor normal e binormal
      let up = { x: 0, y: 0, z: 1 };
      if (Math.abs(T.z) > 0.95) up = { x: 0, y: 1, z: 0 };

      // N = T x up
      let nx = T.y * up.z - T.z * up.y;
      let ny = T.z * up.x - T.x * up.z;
      let nz = T.x * up.y - T.y * up.x;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      const N = { x: nx / nLen, y: ny / nLen, z: nz / nLen };

      // B = T x N
      const bx = T.y * N.z - T.z * N.y;
      const by = T.z * N.x - T.x * N.z;
      const bz = T.x * N.y - T.y * N.x;
      const B = { x: bx, y: by, z: bz };

      // Largura e espessura da fita
      const w = 0.28 + 0.06 * Math.cos(2 * p0.u);
      const h = 0.07;

      // 4 vértices do corte transversal
      const v0 = { x: p0.x + N.x * w + B.x * h, y: p0.y + N.y * w + B.y * h, z: p0.z + N.z * w + B.z * h };
      const v1 = { x: p0.x - N.x * w + B.x * h, y: p0.y - N.y * w + B.y * h, z: p0.z - N.z * w + B.z * h };
      const v2 = { x: p0.x - N.x * w - B.x * h, y: p0.y - N.y * w - B.y * h, z: p0.z - N.z * w - B.z * h };
      const v3 = { x: p0.x + N.x * w - B.x * h, y: p0.y + N.y * w - B.y * h, z: p0.z + N.z * w - B.z * h };

      ribbonCurve[i].vertices = [v0, v1, v2, v3];
    }

    // Anéis orbitais finos concêntricos complementares
    const NUM_RING_PTS = 64;
    const ring1 = [];
    const ring2 = [];
    for (let i = 0; i < NUM_RING_PTS; i++) {
      const a = (i / NUM_RING_PTS) * Math.PI * 2;
      // Anel 1 inclinado
      ring1.push({
        x: Math.cos(a) * 1.85,
        y: Math.sin(a) * 1.85 * Math.cos(0.7),
        z: Math.sin(a) * 1.85 * Math.sin(0.7)
      });
      // Anel 2 inclinado oposto
      ring2.push({
        x: Math.cos(a) * 1.55 * Math.cos(-0.6),
        y: Math.sin(a) * 1.55,
        z: Math.cos(a) * 1.55 * Math.sin(-0.6)
      });
    }

    // Ângulos de rotação contínua 3D
    let rotX = 0.4;
    let rotY = 0.2;
    let rotZ = 0.0;

    let ringRot = 0;

    // Vetor de luz direcionado
    const lightDir = { x: 0.45, y: -0.65, z: 0.61 };
    const lLen = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
    lightDir.x /= lLen;
    lightDir.y /= lLen;
    lightDir.z /= lLen;

    function render3D() {
      // Avança a rotação perpétua de maneira suave e contínua
      rotX += 0.0055;
      rotY += 0.0085;
      rotZ += 0.0035;
      ringRot += 0.004;

      ctx.clearRect(0, 0, width, height);

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.27;

      // Brilho de fundo (aura sutil)
      const auraGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, baseRadius * 1.8);
      if (isLight) {
        auraGrad.addColorStop(0, 'rgba(236, 72, 153, 0.16)');
        auraGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.07)');
        auraGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      } else {
        auraGrad.addColorStop(0, 'rgba(236, 72, 153, 0.22)');
        auraGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.09)');
        auraGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      }
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // Matrizes de rotação 3D
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

      function transformPoint(p) {
        // Rot Y
        let x1 = p.x * cosY + p.z * sinY;
        let y1 = p.y;
        let z1 = -p.x * sinY + p.z * cosY;

        // Rot X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Rot Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        // Projeção em perspectiva
        const cameraDist = 4.2;
        const perspective = cameraDist / (cameraDist + z3);

        return {
          sx: cx + x3 * baseRadius * perspective,
          sy: cy + y3 * baseRadius * perspective,
          z: z3,
          rx: x3,
          ry: y3,
          rz: z3
        };
      }

      // 1. Projeta todos os vértices da fita
      const transformedSections = [];
      for (let i = 0; i < NUM_SEGS; i++) {
        const v = ribbonCurve[i].vertices;
        transformedSections.push([
          transformPoint(v[0]),
          transformPoint(v[1]),
          transformPoint(v[2]),
          transformPoint(v[3])
        ]);
      }

      // 2. Constrói faces (quads)
      const renderFaces = [];
      for (let i = 0; i < NUM_SEGS; i++) {
        const next = (i + 1) % NUM_SEGS;
        const s0 = transformedSections[i];
        const s1 = transformedSections[next];
        const u = ribbonCurve[i].u;

        // Face Superior (Top)
        renderFaces.push(createFace([s0[0], s0[1], s1[1], s1[0]], u, 'top'));
        // Face Inferior (Bottom)
        renderFaces.push(createFace([s0[3], s0[2], s1[2], s1[3]], u, 'bottom'));
        // Borda Externa (Outer)
        renderFaces.push(createFace([s0[0], s0[3], s1[3], s1[0]], u, 'edge'));
        // Borda Interna (Inner)
        renderFaces.push(createFace([s0[1], s0[2], s1[2], s1[1]], u, 'edge'));
      }

      function createFace(pts, u, type) {
        const avgZ = (pts[0].z + pts[1].z + pts[2].z + pts[3].z) / 4;

        // Vetores para a normal da face
        const vax = pts[1].rx - pts[0].rx;
        const vay = pts[1].ry - pts[0].ry;
        const vaz = pts[1].rz - pts[0].rz;

        const vbx = pts[2].rx - pts[0].rx;
        const vby = pts[2].ry - pts[0].ry;
        const vbz = pts[2].rz - pts[0].rz;

        let nx = vay * vbz - vaz * vby;
        let ny = vaz * vbx - vax * vbz;
        let nz = vax * vby - vay * vbx;
        const nlen = Math.hypot(nx, ny, nz) || 1;
        nx /= nlen;
        ny /= nlen;
        nz /= nlen;

        // Iluminação Difusa
        const dot = Math.max(0, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);

        // Iluminação Especular (brilho metálico/lustroso)
        const refZ = 2 * dot * nz - lightDir.z;
        const spec = Math.pow(Math.max(0, refZ), 12);

        return { pts, avgZ, dot, spec, u, type };
      }

      // 3. Ordenação por profundidade (Painter's Algorithm)
      renderFaces.sort((a, b) => a.avgZ - b.avgZ);

      // 4. Renderiza anéis orbitais no fundo (z < 0)
      renderOrbitalRings(true);

      // 5. Renderiza cada face da fita tridimensional
      for (let i = 0; i < renderFaces.length; i++) {
        const face = renderFaces[i];
        const pts = face.pts;
        const d = face.dot;
        const s = face.spec;
        const u = face.u;

        // Variação suave de rosa (#EC4899) para vermelho (#EF4444) ao longo da curva
        const blend = (Math.sin(u * 2) + 1) / 2;

        let r, g, b, alpha;
        if (isLight) {
          // MODO CLARO: rosa vivo, vibrante e marcante com excelente contraste e luminosidade
          const baseR = 224 + 18 * blend;
          const baseG = 46 + 28 * blend;
          const baseB = 132 + 28 * (1 - blend);

          // Sombreamento proporcional à luz
          r = Math.min(245, Math.floor(baseR * (0.72 + 0.28 * d) + 30 * s));
          g = Math.min(125, Math.floor(baseG * (0.68 + 0.32 * d) + 25 * s));
          b = Math.min(175, Math.floor(baseB * (0.68 + 0.32 * d) + 30 * s));
          alpha = 0.88;
        } else {
          // MODO ESCURO: rosa luminoso e vibrante com reflexos brancos/claros
          const baseR = 210 + 29 * blend;
          const baseG = 40 + 28 * blend;
          const baseB = 120 + 33 * (1 - blend);

          r = Math.min(255, Math.floor(baseR * (0.45 + 0.55 * d) + 160 * s));
          g = Math.min(240, Math.floor(baseG * (0.45 + 0.55 * d) + 130 * s));
          b = Math.min(255, Math.floor(baseB * (0.45 + 0.55 * d) + 145 * s));
          alpha = 0.92;
        }

        ctx.beginPath();
        ctx.moveTo(pts[0].sx, pts[0].sy);
        ctx.lineTo(pts[1].sx, pts[1].sy);
        ctx.lineTo(pts[2].sx, pts[2].sy);
        ctx.lineTo(pts[3].sx, pts[3].sy);
        ctx.closePath();

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Linha de contorno sutil para definição das arestas volumétricas
        if (face.type === 'edge') {
          ctx.strokeStyle = isLight
            ? `rgba(157, 23, 77, 0.45)`
            : `rgba(244, 114, 182, 0.35)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // 6. Renderiza anéis orbitais na frente (z >= 0)
      renderOrbitalRings(false);

      function renderOrbitalRings(behind) {
        // Matriz de rotação para anéis orbitais
        const rCosY = Math.cos(ringRot), rSinY = Math.sin(ringRot);
        const rCosX = Math.cos(0.5), rSinX = Math.sin(0.5);

        function drawRing(ringPts, color, strokeW) {
          ctx.beginPath();
          let started = false;

          for (let i = 0; i <= ringPts.length; i++) {
            const p = ringPts[i % ringPts.length];

            // Rotação do anel
            const x1 = p.x * rCosY + p.z * rSinY;
            const y1 = p.y;
            const z1 = -p.x * rSinY + p.z * rCosY;

            const x2 = x1;
            const y2 = y1 * rCosX - z1 * rSinX;
            const z2 = y1 * rSinX + z1 * rCosX;

            const cameraDist = 4.2;
            const perspective = cameraDist / (cameraDist + z2);
            const sx = cx + x2 * baseRadius * perspective;
            const sy = cy + y2 * baseRadius * perspective;

            const isPointBehind = z2 < 0;
            if ((behind && isPointBehind) || (!behind && !isPointBehind)) {
              if (!started) {
                ctx.moveTo(sx, sy);
                started = true;
              } else {
                ctx.lineTo(sx, sy);
              }
            } else {
              started = false;
            }
          }

          ctx.strokeStyle = color;
          ctx.lineWidth = strokeW;
          ctx.stroke();
        }

        const ringColor1 = isLight
          ? (behind ? 'rgba(219, 39, 119, 0.35)' : 'rgba(219, 39, 119, 0.75)')
          : (behind ? 'rgba(236, 72, 153, 0.25)' : 'rgba(236, 72, 153, 0.65)');

        const ringColor2 = isLight
          ? (behind ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.65)')
          : (behind ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.55)');

        drawRing(ring1, ringColor1, 1.4);
        drawRing(ring2, ringColor2, 1.0);

        // Pontos de luz nos anéis orbitais
        if (!behind) {
          const nodeTime = ringRot * 2;
          const nodeIdx = Math.floor(((Math.sin(nodeTime) + 1) / 2) * (NUM_RING_PTS - 1));
          const np = ring1[nodeIdx];
          const x1 = np.x * rCosY + np.z * rSinY;
          const y1 = np.y;
          const z1 = -np.x * rSinY + np.z * rCosY;
          const x2 = x1;
          const y2 = y1 * rCosX - z1 * rSinX;
          const z2 = y1 * rSinX + z1 * rCosX;

          if (z2 >= 0) {
            const perspective = 4.2 / (4.2 + z2);
            const nsx = cx + x2 * baseRadius * perspective;
            const nsy = cy + y2 * baseRadius * perspective;

            ctx.beginPath();
            ctx.arc(nsx, nsy, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? '#BE185D' : '#F472B6';
            ctx.fill();
            ctx.shadowColor = '#EC4899';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      requestAnimationFrame(render3D);
    }

    // Inicia rotação contínua imediatamente
    requestAnimationFrame(render3D);
  }

  initHero3DOrb();

  /* ==========================================================
     8. FORMULÁRIO DE CONTATO
     ========================================================== */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      clearErrors();

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const subject = document.getElementById('subject');
      const message = document.getElementById('message');

      let isValid = true;

      // Validação do nome
      if (!name.value.trim()) {
        showError(name, 'nameError', 'Por favor, informe seu nome.');
        isValid = false;
      }

      // Validação do e-mail
      if (!email.value.trim()) {
        showError(email, 'emailError', 'Por favor, informe seu e-mail.');
        isValid = false;
      } else if (!isValidEmail(email.value)) {
        showError(email, 'emailError', 'Por favor, informe um e-mail válido.');
        isValid = false;
      }

      // Validação do assunto
      if (!subject.value.trim()) {
        showError(subject, 'subjectError', 'Por favor, informe o assunto.');
        isValid = false;
      }

      // Validação da mensagem
      if (!message.value.trim()) {
        showError(message, 'messageError', 'Por favor, escreva sua mensagem.');
        isValid = false;
      }

      if (isValid) {
        formSuccess.classList.add('show');
        contactForm.reset();

        setTimeout(() => {
          formSuccess.classList.remove('show');
        }, 8000);
      }
    });

    ['name', 'email', 'subject', 'message'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('error');
          const errorEl = document.getElementById(`${id}Error`);
          if (errorEl) errorEl.textContent = '';
        });
      }
    });
  }

  function showError(input, errorId, message) {
    input.classList.add('error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll('.form__input').forEach(input => {
      input.classList.remove('error');
    });
    document.querySelectorAll('.form__error').forEach(error => {
      error.textContent = '';
    });
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /* ==========================================================
     9. ROLAGEM SUAVE PARA LINKS INTERNOS
     ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });
});
