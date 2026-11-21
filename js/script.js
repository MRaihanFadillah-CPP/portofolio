(function () {
  const root = document.documentElement;
  const body = document.body;
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const navMenu = document.getElementById('mobile-menu');
  const menuBtn = document.getElementById('menu-btn');
  const themeToggle = document.querySelector('.theme-toggle');
  const scrollProgress = document.getElementById('scroll-progress');
  const sections = document.querySelectorAll('section[id]');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateThemeLabel() {
    themeToggle.setAttribute(
      'aria-label',
      root.dataset.theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
    );
  }

  themeToggle.addEventListener('click', function () {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
    updateThemeLabel();
  });

  updateThemeLabel();

  function closeMenu() {
    body.classList.remove('menu-open');
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Buka menu');
  }

  menuBtn.addEventListener('click', function () {
    const open = body.classList.toggle('menu-open');
    menuBtn.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    if (open) header.classList.remove('hide');
  });

  document.querySelectorAll('.m-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });

  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(y / max, 1) : 0;
    scrollProgress.style.transform = 'scaleX(' + progress + ')';

    header.classList.toggle('scrolled', y > 10);

    if (!body.classList.contains('menu-open')) {
      if (y > lastY && y > 320) header.classList.add('hide');
      else header.classList.remove('hide');
    }

    let current = 'home';
    sections.forEach(function (section) {
      if (y >= section.offsetTop - 150) current = section.id;
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });

    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

    const countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.target);
          const duration = 1500;
          const start = performance.now();

          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );

    document.querySelectorAll('.stat-number').forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in');
    });

    document.querySelectorAll('.stat-number').forEach(function (el) {
      el.textContent = el.dataset.target;
    });
  }

  document.querySelectorAll('.spotlight').forEach(function (card) {
    card.addEventListener('pointermove', function (event) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', event.clientX - rect.left + 'px');
      card.style.setProperty('--my', event.clientY - rect.top + 'px');
    });
  });

  const tiltArea = document.querySelector('.tilt');
  const tiltCard = document.getElementById('visual-card');

  if (tiltArea && tiltCard && finePointer && !reducedMotion) {
    tiltArea.addEventListener('pointermove', function (event) {
      const rect = tiltArea.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      tiltCard.style.transform =
        'rotateX(' + (py * -7).toFixed(2) + 'deg) rotateY(' + (px * 9).toFixed(2) + 'deg)';
    });

    tiltArea.addEventListener('pointerleave', function () {
      tiltCard.style.transform = '';
    });
  }

  if (finePointer && !reducedMotion) {
    root.classList.add('has-cursor');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    window.addEventListener('mousemove', function (event) {
      mx = event.clientX;
      my = event.clientY;
      dot.style.transform =
        'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
    });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform =
        'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }

    loop();

    document.querySelectorAll('a, button, .service-row, .spotlight').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.classList.add('grow');
      });
      el.addEventListener('mouseleave', function () {
        ring.classList.remove('grow');
      });
    });
  }

  const clock = document.getElementById('clock');

  function updateClock() {
    if (!clock) return;
    const time = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
      .format(new Date())
      .replace(/\./g, ':');
    clock.textContent = time;
  }

  updateClock();
  setInterval(updateClock, 20000);

  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message || email.indexOf('@') === -1) {
      note.textContent = 'Mohon lengkapi nama, email yang valid, dan pesan.';
      note.classList.add('error');
      return;
    }

    note.classList.remove('error');
    note.textContent = 'Terima kasih, ' + name + '! Pesanmu sudah terkirim.';
    form.reset();

    setTimeout(function () {
      note.textContent = '';
    }, 6000);
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
