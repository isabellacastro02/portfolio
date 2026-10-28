/* ============================================================
   PORTFÓLIO ISABELLA — SCRIPT.JS
   Funcionalidades: tema, menu, scroll reveal, triângulos,
   formulário e navegação ativa.
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

  // Aplica tema salvo ou padrão (escuro)
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
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

  navToggle.addEventListener('click', openMenu);
  navClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // Fecha menu ao clicar em um link
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fecha menu com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
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

  /* ==========================================================
     4. NAVEGAÇÃO ATIVA POR SEÇÃO
     ========================================================== */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;

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

  /* ==========================================================
     5. SCROLL REVEAL (Referência: Edolus)
     ========================================================== */
  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Mostra tudo imediatamente se preferir movimento reduzido
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('revealed');
    });
  }

  /* ==========================================================
     6. TRIÂNGULOS GEOMÉTRICOS (Referência: La Boîte à Slide)
     ========================================================== */
  if (!prefersReducedMotion) {
    const trianglesContainer = document.getElementById('trianglesContainer');
    const triangles = [];
    const triangleCount = 18;

    // Cria triângulos distribuídos pela página
    for (let i = 0; i < triangleCount; i++) {
      const triangle = document.createElement('div');
      triangle.classList.add('triangle');

      // Tamanho variado mas visível
      const size = 20 + Math.random() * 30; // 20-50px

      // Estilo do triângulo via border
      const pink = '#EC4899';
      const opacity = 0.25 + Math.random() * 0.2; // 0.25 a 0.45
      const color = hexToRgba(pink, opacity);

      // Direção aleatória do triângulo
      const direction = Math.floor(Math.random() * 4);
      applyTriangleStyle(triangle, size, color, direction);

      // Posição distribuída
      const posX = Math.random() * 100;
      const posY = (i / triangleCount) * 100;

      triangle.style.left = `${posX}%`;
      triangle.style.top = `${posY}%`;

      // Velocidade e direção de parallax
      const speedX = (Math.random() - 0.5) * 0.3;
      const speedY = (Math.random() - 0.5) * 0.15 + 0.05;
      const rotation = Math.random() * 360;
      const rotSpeed = (Math.random() - 0.5) * 0.05;

      triangles.push({
        el: triangle,
        posX,
        posY,
        speedX,
        speedY,
        rotation,
        rotSpeed,
        baseTop: posY
      });

      trianglesContainer.appendChild(triangle);
    }

    // Movimento dos triângulos sincronizado com scroll
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateTriangles() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = docHeight > 0 ? scrollY / docHeight : 0;

      triangles.forEach(tri => {
        const offsetX = scrollY * tri.speedX;
        const offsetY = scrollY * tri.speedY;
        const rotation = tri.rotation + scrollY * tri.rotSpeed;

        tri.el.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateTriangles);
        ticking = true;
      }
    }, { passive: true });

    // Atualização inicial
    updateTriangles();
  }

  /* ===== Funções auxiliares para triângulos ===== */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function applyTriangleStyle(el, size, color, direction) {
    const half = size / 2;
    switch (direction) {
      case 0: // Apontando para cima
        el.style.borderLeft = `${half}px solid transparent`;
        el.style.borderRight = `${half}px solid transparent`;
        el.style.borderBottom = `${size}px solid ${color}`;
        break;
      case 1: // Apontando para baixo
        el.style.borderLeft = `${half}px solid transparent`;
        el.style.borderRight = `${half}px solid transparent`;
        el.style.borderTop = `${size}px solid ${color}`;
        break;
      case 2: // Apontando para direita
        el.style.borderTop = `${half}px solid transparent`;
        el.style.borderBottom = `${half}px solid transparent`;
        el.style.borderLeft = `${size}px solid ${color}`;
        break;
      case 3: // Apontando para esquerda
        el.style.borderTop = `${half}px solid transparent`;
        el.style.borderBottom = `${half}px solid transparent`;
        el.style.borderRight = `${size}px solid ${color}`;
        break;
    }
  }

  /* ==========================================================
     7. FORMULÁRIO DE CONTATO
     ========================================================== */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Limpa erros anteriores
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
      // Mostra mensagem de sucesso
      formSuccess.classList.add('show');
      contactForm.reset();

      // Esconde mensagem após 8 segundos
      setTimeout(() => {
        formSuccess.classList.remove('show');
      }, 8000);
    }
  });

  // Remove erro ao digitar
  ['name', 'email', 'subject', 'message'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      input.classList.remove('error');
      document.getElementById(`${id}Error`).textContent = '';
    });
  });

  function showError(input, errorId, message) {
    input.classList.add('error');
    document.getElementById(errorId).textContent = message;
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
     8. ROLAGEM SUAVE PARA LINKS INTERNOS
     ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetEl = document.querySelector(targetId);

      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });
});
