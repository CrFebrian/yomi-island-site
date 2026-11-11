/* Yomi Island: situs produk. JS biasa, tanpa pustaka.
   Semua string HTML di sini statis (tidak ada input pengguna yang masuk ke innerHTML). */
'use strict';
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window) document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (_) { /* diabaikan: penyimpanan bisa diblokir */ } },
  };

  const nekoSrc = (name) => `assets/neko/neko-${name}.${RM.matches ? 'png' : 'gif'}`;
  const pad = (n) => String(n).padStart(2, '0');
  const clockText = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const dateText = () => {
    try { return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (_) { return 'Hari ini'; }
  };

  /* ---------- Ikon garis (1.75px, sudut membulat) ---------- */
  const svg = (inner, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
  const ICON = {
    today: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'),
    read: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>'),
    anime: svg('<rect x="3" y="5" width="18" height="12" rx="3"/><path d="M8 21h8M12 17v4"/>'),
    music: svg('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
    chill: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
  };
  const BOLT = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3 6 13.5h5L10 21l7-10.5h-5z"/></svg>';
  const EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

  /* ---------- State island (bagian 6.1) ---------- */
  const STATES = {
    hero:     { neko: 'idle',    left: 'batt', label: '', right: 'clock' },
    today:    { neko: 'excited', label: 'Kirim laporan · 12 mnt' },
    read:     { neko: 'reading', label: 'Fokus · {t}', tick: { start: 24 * 60 + 12, fmt: 'mmss' } },
    anime:    { neko: 'excited', label: 'Ep. 8 tayang 2 jam lagi' },
    music:    { neko: 'music',   label: 'An Ode To (demo)', right: 'eq' },
    chill:    { neko: 'sleep',   label: 'Istirahat mata · {t}', tick: { start: 18, fmt: 'dtk' } },
    auto:     { neko: 'idle',    left: 'mic', label: 'Rapat · 2 ditahan' },
    download: { neko: 'excited', label: 'Siap diunduh' },
  };

  const fmtTick = (sec, fmt) => (fmt === 'mmss' ? `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}` : `${sec} dtk`);

  /* ---------- Isi panel contoh ---------- */
  const TABS = [
    { key: 'today', label: 'Hari ini' },
    { key: 'read', label: 'Baca' },
    { key: 'anime', label: 'Anime' },
    { key: 'music', label: 'Musik' },
    { key: 'chill', label: 'Santai' },
  ];
  const PANELS = {
    today: () => `
      <p class="p-title">${dateText()}</p>
      <ul class="p-list">
        <li><span class="grow">Kirim laporan<small class="tnum">14:30</small></span><span class="chip">12 mnt</span></li>
        <li><span class="grow">Balas email dosen<small class="tnum">16:00</small></span></li>
        <li><span class="grow">Beli tinta printer<small class="tnum">09:00</small></span><span class="chip chip-danger">terlambat</span></li>
      </ul>`,
    read: () => `
      <div class="p-btns"><span class="pill-btn">Baca 25</span><span class="pill-btn">Fokus 50</span><span class="pill-btn">Rehat 5</span></div>
      <p class="p-sub">Target halaman hari ini</p>
      <p class="tnum"><b>12</b> dari 20 halaman</p><span class="bar"><i class="p60"></i></span>
      <ul class="p-list">
        <li><span class="grow">Manga contoh, Vol. 12<small class="tnum">84 dari 192 halaman</small></span></li>
        <li><span class="grow">Beruntun<small class="tnum">7 hari membaca</small></span></li>
      </ul>`,
    anime: () => `
      <ul class="p-list">
        <li><span class="grow"><b>Bintang Senja</b><small class="tnum">Episode 8 tayang 2 jam 14 menit lagi</small></span><span class="chip">AniList</span></li>
        <li><span class="grow"><b>Kota Hujan</b><small class="tnum">Bab 112 baru rilis</small></span><span class="chip">MangaDex</span></li>
      </ul>
      <p class="p-sub">Dicek tiap 30 menit.</p>`,
    music: () => `
      <p class="p-title">An Ode To (demo)</p>
      <p class="p-sub">Kenji Peach</p>
      <p class="p-bar"><span class="bar bar-lg"><i class="p45"></i></span></p>
      <div class="p-btns">${EQ}<span class="pill-btn">Sebelumnya</span><span class="pill-btn">Putar</span><span class="pill-btn">Berikutnya</span></div>
      <p class="p-sub">Baris lirik tampil di sini, mengikuti lagu.</p>`,
    chill: () => `
      <ul class="p-list">
        <li><span class="grow">Istirahat mata 20-20-20<small>Tiap 20 menit, lihat jauh selama 20 detik</small></span><span class="chip">Mulai</span></li>
        <li><span class="grow">Daily gacha<small class="tnum">reset 4 jam 10 menit</small></span></li>
        <li><span class="grow">"Satu bab lagi, lalu minum air."<small>Kutipan hari ini</small></span></li>
      </ul>`,
  };

  /* ---------- Komponen Island ---------- */
  const islands = [];
  class Island {
    constructor(root) {
      this.root = root;
      this.id = root.id;
      this.bar = $('.island-bar', root);
      this.inner = $('.bar-in', root);
      this.left = $('.i-left', root);
      this.label = $('.i-label', root);
      this.right = $('.i-right', root);
      this.nekoBox = $('.i-neko', root);
      this.img = $('img', this.nekoBox);
      this.cfg = null;
      this.remaining = null;
      this.nekoName = null;
      this.swapTimer = 0;
      this.raf = 0;
      this.onFirstToggle = null;
      this.buildPanel();
      this.bar.addEventListener('click', () => this.toggle());
      document.addEventListener('pointerdown', (e) => {
        if (this.isOpen() && !this.root.contains(e.target)) this.toggle(false);
      });
      root.addEventListener('animationend', (e) => {
        if (e.animationName === 'pulse') { root.classList.remove('pulse'); root.classList.add('breathe'); }
      });
      islands.push(this);
    }

    isOpen() { return this.root.classList.contains('open'); }

    toggle(force) {
      const open = typeof force === 'boolean' ? force : !this.isOpen();
      this.root.classList.toggle('open', open);
      this.bar.setAttribute('aria-expanded', String(open));
      this.panel.inert = !open;
      this.root.classList.remove('pulse');
    this.root.classList.add('breathe');
      if (this.onFirstToggle) { this.onFirstToggle(); this.onFirstToggle = null; }
    }

    buildPanel() {
      const id = this.id;
      const panel = document.createElement('div');
      panel.className = 'island-panel';
      panel.id = `${id}-panel`;
      panel.inert = true;
      const tabs = TABS.map((t, i) => `
        <button class="tab" role="tab" type="button" id="${id}-tab-${t.key}" aria-controls="${id}-tp-${t.key}"
                aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" aria-label="${t.label}">${ICON[t.key]}<span>${t.label}</span></button>`).join('');
      const bodies = TABS.map((t, i) => `
        <div class="tabpanel" role="tabpanel" id="${id}-tp-${t.key}" aria-labelledby="${id}-tab-${t.key}" tabindex="0" ${i === 0 ? '' : 'hidden'}>${PANELS[t.key]()}</div>`).join('');
      panel.innerHTML = `<div class="panel-clip"><div class="panel-body">
        <div class="tabs" role="tablist" aria-label="Bagian panel">${tabs}</div>${bodies}
        <p class="panel-note">Ini contoh, isinya bukan data asli. Tekan Esc untuk menutup.</p>
      </div></div>`;
      this.root.appendChild(panel);
      this.panel = panel;

      const list = $('.tabs', panel);
      const select = (btn, focus) => {
        $$('.tab', list).forEach((b) => {
          const on = b === btn;
          b.setAttribute('aria-selected', String(on));
          b.tabIndex = on ? 0 : -1;
          $(`#${b.getAttribute('aria-controls')}`, panel).hidden = !on;
        });
        if (focus) btn.focus();
      };
      list.addEventListener('click', (e) => { const b = e.target.closest('.tab'); if (b) select(b, false); });
      list.addEventListener('keydown', (e) => {
        const tabsEl = $$('.tab', list);
        const i = tabsEl.indexOf(document.activeElement);
        if (i < 0) return;
        let n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabsEl.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabsEl.length) % tabsEl.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabsEl.length - 1;
        if (n !== null) { e.preventDefault(); select(tabsEl[n], true); }
      });
    }

    setNeko(name, immediate) {
      if (this.nekoName === name) return;
      this.nekoName = name;
      const src = nekoSrc(name);
      if (immediate || RM.matches) { this.img.src = src; return; }
      const pre = new Image();
      const go = () => {
        if (this.nekoName !== name) return;
        this.nekoBox.classList.add('swap'); // crossfade 0.24s: keluar 0.12s, masuk 0.12s
        clearTimeout(this.swapTimer);
        this.swapTimer = setTimeout(() => {
          this.img.src = src;
          requestAnimationFrame(() => this.nekoBox.classList.remove('swap'));
        }, 120);
      };
      pre.onload = go;
      pre.onerror = go;
      pre.src = src;
    }

    fit() {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => {
        const w = this.inner.getBoundingClientRect().width;
        if (w > 0) this.root.style.setProperty('--w', `${Math.ceil(w + 2)}px`);
      });
    }

    setState(input, immediate) {
      const st = typeof input === 'string' ? STATES[input] : input;
      if (!st) return;
      this.key = typeof input === 'string' ? input : null;
      this.cfg = st;
      this.remaining = st.tick ? st.tick.start : null;
      this.left.innerHTML = st.left === 'batt'
        ? `<span class="batt">${BOLT}<span class="tnum">98%</span></span>`
        : st.left === 'mic' ? '<span class="mic-dot" aria-hidden="true"></span>' : '';
      this.label.innerHTML = (st.label || '').replace('{t}', '<span class="tnum" data-tick></span>');
      this.right.innerHTML = st.right === 'clock' ? `<span class="tnum" data-clock>${clockText()}</span>` : st.right === 'eq' ? EQ : '';
      this.renderTick();
      this.setNeko(st.neko, immediate);
      this.fit();
    }

    renderTick() {
      const el = $('[data-tick]', this.label);
      if (el && this.cfg.tick) el.textContent = fmtTick(this.remaining, this.cfg.tick.fmt);
    }

    tick() {
      if (!this.cfg || !this.cfg.tick) return;
      this.remaining -= 1;
      if (this.remaining < 0) {
        if (this.cfg.tick.onEnd) { this.cfg.tick.onEnd(); return; }
        this.remaining = this.cfg.tick.start;
      }
      this.renderTick();
      if (this.cfg.tick.fmt === 'dtk') this.fit();
    }
  }

  /* ---------- Pengatur waktu bersama (jam + hitung mundur) ---------- */
  setInterval(() => {
    if (document.hidden) return;
    const c = clockText();
    $$('[data-clock]').forEach((el) => { if (el.textContent !== c) el.textContent = c; });
    islands.forEach((i) => i.tick());
    storyTick();
  }, 1000);

  /* ---------- Island hero: ikut scroll lewat IntersectionObserver ---------- */
  const heroEl = $('#heroIsland');
  const hero = heroEl ? new Island(heroEl) : null;
  if (hero) {
    hero.setState('hero', true);
    hero.onFirstToggle = () => {};
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const key = en.target.dataset.island;
          if (STATES[key] && hero.key !== key) hero.setState(key);
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      $$('[data-island]').forEach((el) => io.observe(el));
    }
  }


  /* ---------- Cerita: muncul sekali, bagian dalamnya hidup saat terlihat ---------- */
  const inView = new Set();
  const RING_TOTAL = 25 * 60;
  let ringLeft = 24 * 60 + 12;
  let eyeLeft = 18;
  const ringTime = $('#ringTime');
  const ringFg = $('#ringFg');
  const eyeTime = $('#eyeTime');
  const storyLyric = $('#storyLyric');
  const STORY_LYRICS = ['Baris lirik tampil di sini, mengikuti lagu.', 'Baris kedua muncul pelan-pelan.', 'Lalu baris ketiga menyusul.'];
  let lyricIdx = 0;
  let lyricCount = 0;

  function storyTick() {
    if (RM.matches) return;
    if (inView.has('s2') && ringTime && ringFg) {
      ringLeft = ringLeft <= 0 ? 24 * 60 + 12 : ringLeft - 1;
      ringTime.textContent = fmtTick(ringLeft, 'mmss');
      ringFg.style.strokeDashoffset = String(((RING_TOTAL - ringLeft) / RING_TOTAL) * 100);
    }
    if (inView.has('s5') && eyeTime) {
      eyeLeft = eyeLeft <= 0 ? 18 : eyeLeft - 1;
      eyeTime.textContent = `${eyeLeft} dtk`;
    }
    if (inView.has('s4') && storyLyric && ++lyricCount % 3 === 0) {
      lyricIdx = (lyricIdx + 1) % STORY_LYRICS.length;
      storyLyric.classList.add('fade');
      setTimeout(() => { storyLyric.textContent = STORY_LYRICS[lyricIdx]; storyLyric.classList.remove('fade'); }, 300);
    }
  }

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const el = en.target;
        if (en.isIntersecting) { el.classList.add('in-view', 'shown'); inView.add(el.id); }
        else { el.classList.remove('in-view'); inView.delete(el.id); }
      });
    }, { threshold: 0.2 });
    $$('.story-item').forEach((el) => reveal.observe(el));
  }

  /* ---------- Neko 3D di hero: miring mengikuti kursor + ganti ekspresi ---------- */
  const heroArt = $('#heroArt');
  const tiltEl = $('#heroTilt');
  if (heroArt && tiltEl && !RM.matches) {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const loop = () => {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        tiltEl.style.setProperty('--ry', `${cx.toFixed(2)}deg`);
        tiltEl.style.setProperty('--rx', `${cy.toFixed(2)}deg`);
        raf = (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
      const heroSection = $('.hero');
      heroSection.addEventListener('pointermove', (e) => {
        const r = heroArt.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
        tx = nx * 18;
        ty = -ny * 12;
        kick();
      });
      heroSection.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    }
    const faces = $$('.h-neko', heroArt);
    if (faces.length === 2) {
      const seq = ['idle', 'excited', 'reading', 'music', 'sleep'];
      let i = 0;
      let on = 0;
      setInterval(() => {
        if (document.hidden) return;
        i = (i + 1) % seq.length;
        const pre = new Image();
        pre.onload = () => {
          const next = faces[1 - on];
          next.src = pre.src;
          faces[on].classList.remove('is-on');
          next.classList.add('is-on');
          on = 1 - on;
        };
        pre.src = `assets/neko/neko-${seq[i]}.png`;
      }, 3200);
    }
  }

  /* ---------- Demo "Coba langsung" ---------- */
  const demoEl = $('#demoIsland');
  if (demoEl) {
    const demo = new Island(demoEl);
    demo.setState('hero', true);
    const desk = $('#desk');
    const status = $('#demoStatus');
    const lyricEl = $('#deskLyric');
    const buttons = $$('.sc');
    let timeouts = [];
    let lyricTimer = 0;
    const later = (fn, ms) => { timeouts.push(setTimeout(fn, ms)); };
    const LYRICS = ['Baris lirik contoh pertama', 'Baris kedua mengikuti lagu', 'Baris ketiga tampil pelan', 'Baris keempat, lalu mengulang'];

    const stopLyrics = () => { clearInterval(lyricTimer); lyricEl.textContent = ''; };
    const startLyrics = () => {
      let i = 0;
      lyricEl.textContent = LYRICS[0];
      lyricTimer = setInterval(() => { i = (i + 1) % LYRICS.length; lyricEl.textContent = LYRICS[i]; }, 2400);
    };
    const reset = () => {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      stopLyrics();
      desk.classList.remove('is-fs');
      demo.root.classList.remove('fs-hidden');
    };
    const unpress = () => buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    const finish = (msg) => { demo.setState('hero'); unpress(); status.textContent = msg; };

    const SCENARIOS = {
      urgent: { msg: 'Task hampir jatuh tempo: neko semangat, "Kirim laporan, 12 menit".', run() {
        demo.setState({ neko: 'excited', label: 'Kirim laporan · 12 mnt' });
      } },
      late: { msg: 'Task terlambat: neko kaget, lalu sedih.', run() {
        demo.setState({ neko: 'shock', label: 'Kirim laporan · telat 3 mnt' });
        later(() => { demo.setState({ neko: 'sad', label: 'Kirim laporan · telat 11 mnt' }); status.textContent = 'Neko sedih: task terlambat lebih dari 10 menit.'; }, 2600);
      } },
      read: { msg: 'Timer baca berjalan: neko membaca, hitung mundur dimulai.', run() {
        demo.setState({ neko: 'reading', label: 'Baca · {t}', tick: { start: 25 * 60, fmt: 'mmss' } });
      } },
      music: { msg: 'Musik diputar: neko memakai headphone, equalizer dan lirik berjalan.', run() {
        demo.setState({ neko: 'music', label: 'An Ode To (demo)', right: 'eq' });
        startLyrics();
      } },
      meeting: { msg: 'Rapat dimulai: mikrofon aktif, 2 pengingat ditahan.', run() {
        demo.setState({ neko: 'idle', left: 'mic', label: 'Rapat · 2 ditahan' });
      } },
      fullscreen: { msg: 'Layar penuh: island bersembunyi, lalu kembali.', run() {
        demo.toggle(false);
        desk.classList.add('is-fs');
        demo.root.classList.add('fs-hidden');
        later(() => { reset(); finish('Layar penuh selesai: island kembali.'); }, 2800);
      } },
      eye: { msg: 'Istirahat mata: neko tidur, hitungan 20 detik.', run() {
        demo.setState({ neko: 'sleep', label: 'Istirahat mata · {t}', tick: { start: 20, fmt: 'dtk', onEnd: () => finish('Istirahat mata selesai.') } });
      } },
    };

    buttons.forEach((btn) => btn.addEventListener('click', () => {
      const sc = SCENARIOS[btn.dataset.scenario];
      if (!sc) return;
      reset();
      unpress();
      btn.setAttribute('aria-pressed', 'true');
      status.textContent = sc.msg;
      sc.run();
    }));
  }


  /* ---------- Animasi scroll ---------- */
  // 1) Muncul berurutan saat masuk layar (hanya bila IntersectionObserver ada; kelas .js hanya dipasang saat itu)
  if ('IntersectionObserver' in window) {
    const targets = $$('.sec-head, .step, .reqs > div, .faq details, .support h2, .support p, .sleeper, .foot-in > *');
    targets.forEach((el) => {
      const idx = Array.from(el.parentElement.children).indexOf(el);
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--i', String(Math.min(idx, 5)));
    });
    const rv = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('revealed');
        rv.unobserve(en.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    targets.forEach((el) => rv.observe(el));
  }

  // 2) Progres scroll + parallax hero. Satu listener pasif, dibatasi per frame.
  const progress = $('#progress');
  const heroSec = $('.hero');
  let lastY = window.scrollY;
  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) {
        progress.style.setProperty('--p', (max > 0 ? Math.min(1, y / max) : 0).toFixed(4));
        progress.classList.toggle('on', y > 40);
        if (Math.abs(y - lastY) > 2) progress.classList.toggle('back', y < lastY);
      }
      if (heroSec && !RM.matches && y < 1400) heroSec.style.setProperty('--sy', String(y));
      lastY = y;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();


  /* ---------- FAQ: tinggi beranimasi lewat Web Animations API ---------- */
  const faq = $('.faq');
  if (faq && typeof Element.prototype.animate === 'function') {
    faq.classList.add('anim');
    const EASE = 'cubic-bezier(0.3, 0.8, 0.3, 1)';
    const run = (d, opening) => {
      const startH = d.getBoundingClientRect().height; // tinggi saat ini (bisa di tengah animasi)
      if (d._anim) d._anim.cancel();
      const sum = $('summary', d);
      if (opening) { d.open = true; d.classList.add('is-open'); } else { d.classList.remove('is-open'); }
      const endH = opening ? d.getBoundingClientRect().height : sum.getBoundingClientRect().height + 2; // 2 = border atas dan bawah
      d.style.overflow = 'hidden';
      const anim = d.animate({ height: [`${startH}px`, `${endH}px`] }, { duration: RM.matches ? 0 : 440, easing: EASE });
      d._anim = anim;
      anim.onfinish = () => { d._anim = null; d.style.overflow = ''; if (!opening) d.open = false; };
    };
    $$('details', faq).forEach((d) => {
      $('summary', d).addEventListener('click', (e) => {
        e.preventDefault();
        run(d, !d.classList.contains('is-open'));
      });
    });
  }

  /* ---------- Menu, header, Esc ---------- */
  const menuBtn = $('#menuBtn');
  const nav = $('#siteNav');
  const closeMenu = () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); };
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMenu();
    islands.forEach((i) => { if (i.isOpen()) { i.toggle(false); i.bar.focus(); } });
  });

  const header = $('#siteHeader');
  if ('IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    Object.assign(sentinel.style, { position: 'absolute', top: '0', left: '0', width: '1px', height: '48px', pointerEvents: 'none' });
    document.body.prepend(sentinel);
    new IntersectionObserver(([en]) => header.classList.toggle('shrunk', !en.isIntersecting)).observe(sentinel);
  }

  /* ---------- Tanggal di contoh ---------- */
  $$('[data-today-date]').forEach((el) => { el.textContent = dateText(); });

  /* ---------- Ukuran installer: dibaca dari berkas di situs ini (gagal = tampil perkiraan) ---------- */
  (async function loadSize() {
    const link = $('a[download]');
    const sizeEl = $('#dlSize');
    if (!link || !sizeEl) return;
    try {
      const res = await fetch(link.getAttribute('href'), { method: 'HEAD', cache: 'no-cache' });
      const size = res.ok ? Number(res.headers.get('content-length')) : NaN;
      if (Number.isFinite(size) && size > 0) sizeEl.textContent = `${(size / 1048576).toFixed(1).replace('.', ',')} MB`;
    } catch (_) { /* diabaikan: tetap tampil perkiraan */ }
  })();

  /* ---------- Intro singkat (sekali per sesi, bisa dilewati) ---------- */
  (function intro() {
    if (RM.matches || store.get('yomi-intro')) return;
    store.set('yomi-intro', '1');
    const ov = document.createElement('div');
    ov.className = 'intro';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<div class="intro-pill"><img src="assets/neko/neko-sleep.png" alt="" width="32" height="24"></div><span class="intro-skip">klik untuk lewati</span>';
    document.body.appendChild(ov);
    const pill = $('.intro-pill', ov);
    const pic = $('img', ov);
    const timers = [];
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      ov.classList.add('out');
      document.removeEventListener('keydown', end);
      setTimeout(() => ov.remove(), 400);
    };
    timers.push(setTimeout(() => pill.classList.add('wide'), 450));
    timers.push(setTimeout(() => { pic.src = 'assets/neko/neko-idle.gif'; }, 950));
    timers.push(setTimeout(end, 1900));
    ov.addEventListener('click', end);
    document.addEventListener('keydown', end);
  })();
})();
