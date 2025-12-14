
    // ---------- Utilities ----------
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

    const toastEl = $('#toast');
    let toastTimer = null;
    function toast(title, body, ms = 2200){
      $('#toastTitle').textContent = title;
      $('#toastBody').textContent = body;
      toastEl.classList.remove('hidden');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.add('hidden'), ms);
    }
    $('#toastClose').addEventListener('click', () => toastEl.classList.add('hidden'));

    // ---------- Theme (light/dark) ----------
    const themeBtn = $('#btnTheme');
    const themeIcon = $('#themeIcon');
    let theme = localStorage.getItem('wixish.theme') || 'light';

    function setTheme(next){
      theme = next;
      localStorage.setItem('wixish.theme', theme);
      const dark = theme === 'dark';
      document.documentElement.classList.toggle('dark', dark);
      // We style dark via Tailwind classes that read .dark
      // but since we used mostly hardcoded colors, we will apply minimal inversion.
      document.body.classList.toggle('bg-slate-950', dark);
      document.body.classList.toggle('text-slate-100', dark);

      // Replace hero background by toggling an overlay
      const existing = $('#darkOverlay');
      if(dark && !existing){
        const div = document.createElement('div');
        div.id = 'darkOverlay';
        div.className = 'fixed inset-0 -z-50';
        div.style.background = 'radial-gradient(1200px 700px at 20% 15%, rgba(99,102,241,.20), transparent 55%), radial-gradient(1000px 650px at 85% 30%, rgba(16,185,129,.14), transparent 60%), radial-gradient(900px 650px at 55% 90%, rgba(236,72,153,.12), transparent 62%), linear-gradient(to bottom, #020617, #0b1220)';
        document.body.appendChild(div);
      }
      if(!dark && existing) existing.remove();

      // Update icon
      themeIcon.innerHTML = dark
        ? '<path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M12 18a6 6 0 1 0 0-12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';

      // Minimal dark adjustments for key panels
      const darkables = [
        ...$$('.bg-white'), ...$$('.bg-white/40'), ...$$('.bg-white/50'), ...$$('.bg-white/60'), ...$$('.bg-white/65'), ...$$('.bg-white/70'), ...$$('.bg-white/72'), ...$$('.bg-white/80')
      ];
      darkables.forEach(el => {
        if(!el.dataset.lightBg) el.dataset.lightBg = el.className;
        if(dark){
          el.className = el.dataset.lightBg
            .replaceAll('bg-white/40','bg-slate-900/50')
            .replaceAll('bg-white/50','bg-slate-900/50')
            .replaceAll('bg-white/60','bg-slate-900/60')
            .replaceAll('bg-white/65','bg-slate-900/60')
            .replaceAll('bg-white/70','bg-slate-900/70')
            .replaceAll('bg-white/80','bg-slate-900/70')
            .replaceAll('bg-white','bg-slate-900')
            .replaceAll('text-slate-900','text-slate-100');
        } else {
          el.className = el.dataset.lightBg;
        }
      });

      // Update borders/rings
      const ringables = [...$$('.ring-slate-200'), ...$$('.border-slate-200')];
      ringables.forEach(el => {
        if(!el.dataset.lightRing) el.dataset.lightRing = el.className;
        el.className = dark
          ? el.dataset.lightRing.replaceAll('ring-slate-200','ring-slate-700').replaceAll('border-slate-200','border-slate-800')
          : el.dataset.lightRing;
      });

      // Update muted text
      const muted = [...$$('.text-slate-600'), ...$$('.text-slate-500'), ...$$('.text-slate-700')];
      muted.forEach(el => {
        if(!el.dataset.lightText) el.dataset.lightText = el.className;
        if(dark){
          el.className = el.dataset.lightText
            .replaceAll('text-slate-600','text-slate-300')
            .replaceAll('text-slate-500','text-slate-400')
            .replaceAll('text-slate-700','text-slate-200');
        } else {
          el.className = el.dataset.lightText;
        }
      });

      toast('Theme updated', `Now using ${dark ? 'dark' : 'light'} mode.`);
    }

    themeBtn?.addEventListener('click', () => setTheme(theme === 'dark' ? 'light' : 'dark'));
    setTheme(theme);

    // ---------- Mobile drawer ----------
    const drawerOverlay = $('#drawerOverlay');
    const btnMenu = $('#btnMenu');

    function openDrawer(){
      drawerOverlay.classList.remove('hidden');
      btnMenu.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer(){
      drawerOverlay.classList.add('hidden');
      btnMenu.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    btnMenu.addEventListener('click', openDrawer);
    drawerOverlay.addEventListener('click', (e) => {
      if(e.target && e.target.dataset && e.target.dataset.close === 'true') closeDrawer();
      if(e.target && e.target.closest && e.target.closest('[data-close="true"]')) closeDrawer();
    });

    // ---------- Template gallery ----------
    const templates = [
      { id: 'tpl-aurora', name: 'Aurora Studio', category: 'portfolio', tags: ['portfolio','designer','minimal','agency'], accent: 'from-indigo-600 to-fuchsia-600', bullets: ['Hero + services grid', 'Case studies section', 'Contact CTA + form'] },
      { id: 'tpl-espresso', name: 'Espresso Corner', category: 'business', tags: ['cafe','restaurant','menu','local'], accent: 'from-amber-500 to-rose-500', bullets: ['Menu blocks', 'Location + hours', 'Online order CTA'] },
      { id: 'tpl-market', name: 'North Market', category: 'store', tags: ['ecommerce','store','fashion','cart'], accent: 'from-emerald-500 to-sky-500', bullets: ['Product grid', 'Featured collection', 'Shipping banner'] },
      { id: 'tpl-summit', name: 'Summit Conference', category: 'events', tags: ['event','tickets','speakers','agenda'], accent: 'from-sky-600 to-indigo-600', bullets: ['Agenda timeline', 'Speaker cards', 'Ticket pricing section'] },
      { id: 'tpl-atelier', name: 'Atelier Photos', category: 'portfolio', tags: ['photography','gallery','portfolio','wedding'], accent: 'from-slate-900 to-slate-700', bullets: ['Masonry gallery', 'Packages + pricing', 'Inquiry form'] },
      { id: 'tpl-consult', name: 'Bright Consulting', category: 'business', tags: ['business','consulting','services','lead'], accent: 'from-violet-600 to-indigo-600', bullets: ['Lead magnet CTA', 'Services list', 'Testimonials section'] },
      { id: 'tpl-flora', name: 'Flora & Co.', category: 'store', tags: ['store','flowers','boutique','ecommerce'], accent: 'from-fuchsia-600 to-rose-500', bullets: ['Collection highlights', 'Subscription offer', 'Cart-ready layout'] },
      { id: 'tpl-yoga', name: 'Calm Yoga', category: 'business', tags: ['wellness','yoga','classes','booking'], accent: 'from-emerald-600 to-teal-500', bullets: ['Class schedule', 'Booking CTA', 'Instructor profiles'] },
      { id: 'tpl-launch', name: 'Product Launch', category: 'events', tags: ['startup','launch','waitlist','email'], accent: 'from-indigo-600 to-emerald-500', bullets: ['Waitlist form', 'Feature highlights', 'FAQ block'] },
    ];

    let activeCategory = 'all';
    let searchQuery = '';

    const templateGrid = $('#templateGrid');
    const templateCount = $('#templateCount');

    function templateCard(tpl){
      const tagLine = tpl.tags.slice(0,3).join(' • ');
      return `
        <article class="group rounded-3xl bg-white/70 ring-1 ring-slate-200 shadow-soft overflow-hidden">
          <div class="p-4">
            <div class="rounded-2xl bg-gradient-to-br ${tpl.accent} p-4 text-white">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs text-white/80">${tpl.category.toUpperCase()}</p>
                  <h3 class="mt-1 text-lg font-semibold">${tpl.name}</h3>
                </div>
                <span class="text-xs px-2 py-1 rounded-full bg-white/15 ring-1 ring-white/20">New</span>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <div class="h-16 rounded-2xl bg-white/10 ring-1 ring-white/15"></div>
                <div class="h-16 rounded-2xl bg-white/10 ring-1 ring-white/15"></div>
                <div class="h-16 rounded-2xl bg-white/10 ring-1 ring-white/15"></div>
              </div>
              <p class="mt-3 text-xs text-white/80">${tagLine}</p>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <div class="text-xs text-slate-500">Optimized for mobile</div>
              <div class="flex gap-2">
                <button class="btnPreview px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-semibold hover:bg-slate-50 focus-ring" data-id="${tpl.id}">Preview</button>
                <button class="btnUse px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 focus-ring" data-id="${tpl.id}">Use</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    function getFilteredTemplates(){
      const q = searchQuery.trim().toLowerCase();
      return templates.filter(t => {
        const catOk = activeCategory === 'all' ? true : t.category === activeCategory;
        const qOk = !q ? true : (t.name.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)) || t.category.includes(q));
        return catOk && qOk;
      });
    }

    function renderTemplates(){
      const list = getFilteredTemplates();
      templateGrid.innerHTML = list.map(templateCard).join('');
      templateCount.textContent = list.length;

      $$('.btnPreview', templateGrid).forEach(btn => btn.addEventListener('click', () => openTemplateModal(btn.dataset.id)));
      $$('.btnUse', templateGrid).forEach(btn => btn.addEventListener('click', () => {
        openTemplateModal(btn.dataset.id);
        toast('Template selected', 'Review details, then open the builder.');
      }));
    }

    // filter pills
    $$('.tplFilter').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        $$('.tplFilter').forEach(b => {
          b.classList.remove('bg-slate-900','text-white');
          b.classList.add('bg-white/80','ring-1','ring-slate-200');
        });
        btn.classList.add('bg-slate-900','text-white');
        btn.classList.remove('bg-white/80');
        renderTemplates();
      });
    });

    $('#templateSearch').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTemplates();
    });

    $('#btnShuffle').addEventListener('click', () => {
      // Fisher-Yates shuffle
      for (let i = templates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [templates[i], templates[j]] = [templates[j], templates[i]];
      }
      renderTemplates();
      toast('Shuffled', 'Templates reordered.');
    });

    // ---------- Modal ----------
    const modal = $('#modal');
    let modalTemplateId = null;

    function openModal(){
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      $('#siteName').focus();
    }
    function closeModal(){
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      modalTemplateId = null;
    }

    modal.addEventListener('click', (e) => {
      if(e.target && e.target.dataset && e.target.dataset.modalClose === 'true') closeModal();
      if(e.target && e.target.closest && e.target.closest('[data-modal-close="true"]')) closeModal();
    });

    function openTemplateModal(id){
      const tpl = templates.find(t => t.id === id);
      if(!tpl) return;
      modalTemplateId = id;
      $('#modalTitle').textContent = `Preview: ${tpl.name}`;
      $('#modalSub').textContent = `Category: ${tpl.category}`;
      $('#modalMockName').textContent = tpl.name;
      $('#modalCategory').textContent = tpl.category;
      $('#modalBullets').innerHTML = tpl.bullets.map(b => `<li class="flex items-start gap-2"><span class="mt-1 inline-flex h-4 w-4 rounded bg-emerald-100 ring-1 ring-emerald-200 items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-3 w-3 text-emerald-700' viewBox='0 0 24 24' fill='none'><path d='M20 7l-8 10L4 11' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg></span><span>${b}</span></li>`).join('');
      $('#siteName').value = '';
      openModal();
    }

    $('#modalJustClose').addEventListener('click', closeModal);
    $('#modalGoBuilder').addEventListener('click', () => {
      closeModal();
      location.hash = '#builder';
      if(modalTemplateId){
        builderApplyTemplate(modalTemplateId);
      }
    });

    $('#modalPrimary').addEventListener('click', () => {
      const name = $('#siteName').value.trim() || 'Untitled site';
      toast('Template ready', `“${name}” will be loaded into the builder.`);
      closeModal();
      location.hash = '#builder';
      if(modalTemplateId){
        builderApplyTemplate(modalTemplateId, name);
      }
    });

    // Get started buttons open a generic modal
    function openGetStarted(){
      openTemplateModal('tpl-aurora');
      $('#modalTitle').textContent = 'Get started';
      $('#modalSub').textContent = 'Choose a template to begin';
    }

    $('#btnGetStarted').addEventListener('click', openGetStarted);
    $('#btnGetStartedMobile').addEventListener('click', () => { closeDrawer(); openGetStarted(); });
    $('#ctaStart').addEventListener('click', openGetStarted);
    $('#ctaStart2').addEventListener('click', openGetStarted);
    $('#ctaTemplate').addEventListener('click', () => { location.hash = '#templates'; toast('Browse', 'Pick a template and preview it.'); });

    // ESC handling
    window.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){
        if(!drawerOverlay.classList.contains('hidden')) closeDrawer();
        if(!modal.classList.contains('hidden')) closeModal();
        if(!cmdkEl.classList.contains('hidden')) closeCmdk();
      }
    });

    // ---------- Pricing ----------
    const pricingPlans = [
      {
        name: 'Lite',
        desc: 'For personal sites and simple portfolios.',
        monthly: 10,
        yearly: 96,
        badge: null,
        features: ['Free domain (1 year)', 'Basic SEO checklist', '2GB storage', 'Ad-free pages']
      },
      {
        name: 'Core',
        desc: 'For businesses ready to convert traffic.',
        monthly: 20,
        yearly: 192,
        badge: 'Most popular',
        features: ['Payments', '10GB storage', 'Email campaigns', 'Automations', 'Analytics dashboard']
      },
      {
        name: 'Business',
        desc: 'Advanced tools for serious growth.',
        monthly: 36,
        yearly: 336,
        badge: 'Best value',
        features: ['Priority support', '50GB storage', 'Advanced marketing', 'Teams & roles', 'Custom reports']
      }
    ];

    let billing = 'monthly';
    const toggle = $('#billingToggle');
    const knob = $('#billingKnob');
    const pricingGrid = $('#pricingGrid');

    function priceFmt(n){ return `$${n}`; }

    function renderPricing(){
      pricingGrid.innerHTML = pricingPlans.map((p, idx) => {
        const price = billing === 'monthly' ? p.monthly : p.yearly;
        const unit = billing === 'monthly' ? '/mo' : '/yr';
        const highlight = idx === 1;
        return `
          <div class="rounded-3xl ${highlight ? 'bg-slate-900 text-white ring-1 ring-slate-900' : 'bg-white/70 ring-1 ring-slate-200'} shadow-soft overflow-hidden">
            <div class="p-6">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold">${p.name}</p>
                  <p class="mt-1 text-sm ${highlight ? 'text-white/75' : 'text-slate-600'}">${p.desc}</p>
                </div>
                ${p.badge ? `<span class="text-xs px-2 py-1 rounded-full ${highlight ? 'bg-white/15 ring-1 ring-white/20 text-white' : 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'}">${p.badge}</span>` : ''}
              </div>

              <div class="mt-6 flex items-end gap-2">
                <span class="text-4xl font-semibold">${priceFmt(price)}</span>
                <span class="text-sm ${highlight ? 'text-white/70' : 'text-slate-500'}">${unit}</span>
              </div>
              <p class="mt-2 text-xs ${highlight ? 'text-white/70' : 'text-slate-500'}">${billing === 'yearly' ? 'Billed yearly. Save 20%.' : 'Billed monthly. Cancel anytime.'}</p>

              <button class="mt-5 w-full px-4 py-2.5 rounded-xl text-sm font-semibold focus-ring ${highlight ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'} btnChoose" data-plan="${p.name}">
                Choose ${p.name}
              </button>

              <ul class="mt-5 grid gap-2 text-sm ${highlight ? 'text-white/85' : 'text-slate-700'}">
                ${p.features.map(f => `
                  <li class="flex items-start gap-2">
                    <span class="mt-1 inline-flex h-4 w-4 rounded ${highlight ? 'bg-white/15 ring-1 ring-white/20' : 'bg-emerald-100 ring-1 ring-emerald-200'} items-center justify-center">
                      <svg xmlns='http://www.w3.org/2000/svg' class='h-3 w-3 ${highlight ? 'text-white' : 'text-emerald-700'}' viewBox='0 0 24 24' fill='none'>
                        <path d='M20 7l-8 10L4 11' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
                      </svg>
                    </span>
                    <span>${f}</span>
                  </li>`).join('')}
              </ul>
            </div>
          </div>
        `;
      }).join('');

      $$('.btnChoose', pricingGrid).forEach(b => b.addEventListener('click', () => {
        toast('Plan selected', `${b.dataset.plan} • ${billing}`);
        openGetStarted();
      }));
    }

    function setBilling(next){
      billing = next;
      const on = billing === 'yearly';
      toggle.setAttribute('aria-checked', on ? 'true' : 'false');
      knob.classList.toggle('translate-x-1', !on);
      knob.classList.toggle('translate-x-11', on);
      renderPricing();
    }

    toggle.addEventListener('click', () => setBilling(billing === 'monthly' ? 'yearly' : 'monthly'));

    // ---------- Testimonials carousel ----------
    const testimonials = [
      { name: 'Amina R.', role: 'Founder • Studio Nova', quote: 'I went from idea to a polished site in an afternoon. The sections snapped into place and everything looked premium.', meta: '5.0 • verified', s1: '+62%', s2: '4h', s3: '+$3.1k' },
      { name: 'Jon K.', role: 'Freelance Designer', quote: 'The template previews are clean, and the mini builder gives clients confidence before we commit to a full build.', meta: '4.9 • verified', s1: '+38%', s2: '2h', s3: '+$1.2k' },
      { name: 'Priya S.', role: 'Marketing Lead • North Market', quote: 'Having pricing, FAQs, and a strong CTA layout in one place made our launch feel effortless and consistent.', meta: '5.0 • verified', s1: '+44%', s2: '6h', s3: '+$5.4k' }
    ];

    let tIndex = 0;
    let autoplay = true;
    let interval = null;

    function renderDots(){
      const dots = $('#tDots');
      dots.innerHTML = testimonials.map((_, i) => {
        const active = i === tIndex;
        return `<button class="h-2.5 w-2.5 rounded-full ${active ? 'bg-slate-900' : 'bg-slate-300'}" aria-label="Go to testimonial ${i+1}" data-dot="${i}"></button>`;
      }).join('');
      $$('#tDots [data-dot]').forEach(b => b.addEventListener('click', () => { tIndex = Number(b.dataset.dot); renderTestimonial(); restartAutoplay(); }));
    }

    function renderTestimonial(){
      const t = testimonials[tIndex];
      $('#tName').textContent = t.name;
      $('#tRole').textContent = t.role;
      $('#tQuote').textContent = `“${t.quote}”`;
      $('#tMeta').textContent = t.meta;
      $('#tStat1').textContent = t.s1;
      $('#tStat2').textContent = t.s2;
      $('#tStat3').textContent = t.s3;
      renderDots();
    }

    function nextTestimonial(){ tIndex = (tIndex + 1) % testimonials.length; renderTestimonial(); }
    function prevTestimonial(){ tIndex = (tIndex - 1 + testimonials.length) % testimonials.length; renderTestimonial(); }

    $('#btnNext').addEventListener('click', () => { nextTestimonial(); restartAutoplay(); });
    $('#btnPrev').addEventListener('click', () => { prevTestimonial(); restartAutoplay(); });

    function startAutoplay(){
      clearInterval(interval);
      if(!autoplay) return;
      interval = setInterval(nextTestimonial, 6000);
    }
    function restartAutoplay(){ startAutoplay(); }

    $('#btnPause').addEventListener('click', () => {
      autoplay = !autoplay;
      $('#btnPause').textContent = autoplay ? 'Pause' : 'Play';
      startAutoplay();
    });

    // ---------- FAQ ----------
    const faqs = [
      { q: 'Is this an exact Wix clone?', a: 'No. It’s a Wix-inspired single-page UI demo with similar patterns: templates, builder preview, pricing, testimonials, and FAQs.' },
      { q: 'Does this include a real website builder backend?', a: 'No. The mini builder is a front-end interaction demo that shows adding and reordering sections.' },
      { q: 'Can I reuse this design?', a: 'Yes—treat it as a starter template. Replace copy, colors, and components to suit your project.' },
      { q: 'How do template previews work?', a: 'Templates are represented by local data. Clicking Preview opens a modal with mock content and suggested sections.' },
      { q: 'Is it mobile-friendly?', a: 'Yes. It uses a responsive layout, a mobile navigation drawer, and touch-friendly controls.' },
      { q: 'How do I add more sections?', a: 'Extend the “block palette” array in JavaScript and add a renderer for the new block type.' }
    ];

    const faqGrid = $('#faqGrid');
    function renderFaq(){
      faqGrid.innerHTML = faqs.map((f, i) => `
        <div class="rounded-2xl bg-white/70 ring-1 ring-slate-200 shadow-soft overflow-hidden">
          <button class="w-full p-5 text-left flex items-start justify-between gap-4 focus-ring faqBtn" aria-expanded="false" data-i="${i}">
            <span class="font-semibold">${f.q}</span>
            <span class="mt-0.5 text-slate-500" aria-hidden="true">+</span>
          </button>
          <div class="hidden px-5 pb-5 text-sm text-slate-600" id="faqA${i}">${f.a}</div>
        </div>
      `).join('');

      $$('.faqBtn', faqGrid).forEach(btn => {
        btn.addEventListener('click', () => {
          const i = btn.dataset.i;
          const panel = $(`#faqA${i}`);
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          btn.querySelector('span[aria-hidden]')?.textContent = expanded ? '+' : '–';
          panel.classList.toggle('hidden', expanded);
        });
      });
    }

    // ---------- Mini builder ----------
    const palette = [
      { type: 'hero', label: 'Hero', hint: 'Headline + CTA', color: 'bg-indigo-50 ring-indigo-100 text-indigo-700' },
      { type: 'features', label: 'Features', hint: '3-column grid', color: 'bg-emerald-50 ring-emerald-100 text-emerald-700' },
      { type: 'gallery', label: 'Gallery', hint: 'Image tiles', color: 'bg-fuchsia-50 ring-fuchsia-100 text-fuchsia-700' },
      { type: 'pricing', label: 'Pricing', hint: 'Plan cards', color: 'bg-sky-50 ring-sky-100 text-sky-700' },
      { type: 'faq', label: 'FAQ', hint: 'Accordion', color: 'bg-amber-50 ring-amber-100 text-amber-800' },
      { type: 'cta', label: 'CTA', hint: 'Final push', color: 'bg-slate-50 ring-slate-200 text-slate-700' },
    ];

    const defaultCanvas = [
      { type: 'hero', title: 'Welcome to Nova', body: 'A clean hero section with a primary button.' },
      { type: 'features', title: 'What we do', body: 'Fast, responsive, and conversion-focused.' },
      { type: 'gallery', title: 'Work', body: 'Show off projects and visuals.' },
      { type: 'cta', title: 'Let’s build something', body: 'Add your call-to-action and publish.' },
    ];

    let canvas = JSON.parse(localStorage.getItem('wixish.canvas') || 'null') || structuredClone(defaultCanvas);

    const paletteEl = $('#blockPalette');
    const canvasEl = $('#canvas');
    const builderStatus = $('#builderStatus');

    function setBuilderStatus(text){
      builderStatus.textContent = text;
      builderStatus.classList.add('text-slate-500');
    }

    function saveCanvas(){
      localStorage.setItem('wixish.canvas', JSON.stringify(canvas));
      setBuilderStatus('Saved');
      toast('Saved', 'Builder layout stored locally.');
    }

    function renderPalette(){
      paletteEl.innerHTML = palette.map(p => `
        <button class="w-full px-4 py-3 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-left focus-ring addBlock" data-type="${p.type}">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-semibold">${p.label}</p>
              <p class="mt-0.5 text-xs text-slate-500">${p.hint}</p>
            </div>
            <span class="px-2 py-1 rounded-xl text-xs ring-1 ${p.color}">Add</span>
          </div>
        </button>
      `).join('');

      $$('.addBlock', paletteEl).forEach(btn => btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        canvas.push({ type, title: `${type[0].toUpperCase()+type.slice(1)} section`, body: 'Click edit to customize this copy.' });
        setBuilderStatus('Saving…');
        renderCanvas();
        saveCanvas();
      }));
    }

    function blockIcon(type){
      const icons = {
        hero: '<path d="M4 7h16v10H4V7z" stroke="currentColor" stroke-width="2"/><path d="M8 11h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        features: '<path d="M5 7h6v6H5V7zM13 7h6v6h-6V7zM5 15h6v6H5v-6zM13 15h6v6h-6v-6z" stroke="currentColor" stroke-width="2"/>',
        gallery: '<path d="M4 6h16v12H4V6z" stroke="currentColor" stroke-width="2"/><path d="M8 14l2-2 3 3 2-2 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
        pricing: '<path d="M6 7h12M6 12h12M6 17h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        faq: '<path d="M7 9h10M7 13h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 5h14v14H5V5z" stroke="currentColor" stroke-width="2"/>',
        cta: '<path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      };
      return icons[type] || icons.features;
    }

    function renderBlockPreview(block){
      // Minimal “site section” look
      switch(block.type){
        case 'hero':
          return `
            <div class="rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white p-6">
              <p class="text-xs text-white/80">Hero</p>
              <p class="mt-2 text-xl font-semibold">${escapeHtml(block.title)}</p>
              <p class="mt-1 text-sm text-white/80">${escapeHtml(block.body)}</p>
              <div class="mt-4 flex gap-2">
                <span class="h-9 w-28 rounded-xl bg-white"></span>
                <span class="h-9 w-24 rounded-xl bg-white/20"></span>
              </div>
            </div>`;
        case 'features':
          return `
            <div class="rounded-2xl bg-white ring-1 ring-slate-200 p-5">
              <p class="text-xs text-slate-500">Features</p>
              <p class="mt-1 font-semibold">${escapeHtml(block.title)}</p>
              <p class="mt-1 text-sm text-slate-600">${escapeHtml(block.body)}</p>
              <div class="mt-4 grid grid-cols-3 gap-3">
                ${[1,2,3].map(()=>'<div class="h-20 rounded-2xl bg-slate-50 ring-1 ring-slate-200"></div>').join('')}
              </div>
            </div>`;
        case 'gallery':
          return `
            <div class="rounded-2xl bg-white ring-1 ring-slate-200 p-5">
              <p class="text-xs text-slate-500">Gallery</p>
              <p class="mt-1 font-semibold">${escapeHtml(block.title)}</p>
              <p class="mt-1 text-sm text-slate-600">${escapeHtml(block.body)}</p>
              <div class="mt-4 grid grid-cols-3 gap-3">
                ${[1,2,3,4,5,6].map(()=>'<div class="h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100"></div>').join('')}
              </div>
            </div>`;
        case 'pricing':
          return `
            <div class="rounded-2xl bg-white ring-1 ring-slate-200 p-5">
              <p class="text-xs text-slate-500">Pricing</p>
              <p class="mt-1 font-semibold">${escapeHtml(block.title)}</p>
              <p class="mt-1 text-sm text-slate-600">${escapeHtml(block.body)}</p>
              <div class="mt-4 grid sm:grid-cols-3 gap-3">
                ${[1,2,3].map((i)=>`<div class="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4"><div class="h-3 w-16 rounded bg-slate-200"></div><div class="mt-3 h-6 w-20 rounded bg-slate-200"></div><div class="mt-3 h-8 w-full rounded-xl bg-slate-200"></div></div>`).join('')}
              </div>
            </div>`;
        case 'faq':
          return `
            <div class="rounded-2xl bg-white ring-1 ring-slate-200 p-5">
              <p class="text-xs text-slate-500">FAQ</p>
              <p class="mt-1 font-semibold">${escapeHtml(block.title)}</p>
              <p class="mt-1 text-sm text-slate-600">${escapeHtml(block.body)}</p>
              <div class="mt-4 grid gap-2">
                ${[1,2,3].map(()=>'<div class="h-12 rounded-2xl bg-slate-50 ring-1 ring-slate-200"></div>').join('')}
              </div>
            </div>`;
        case 'cta':
        default:
          return `
            <div class="rounded-2xl bg-slate-900 text-white p-6">
              <p class="text-xs text-white/70">CTA</p>
              <p class="mt-2 text-lg font-semibold">${escapeHtml(block.title)}</p>
              <p class="mt-1 text-sm text-white/75">${escapeHtml(block.body)}</p>
              <div class="mt-4 h-10 w-40 rounded-xl bg-white"></div>
            </div>`;
      }
    }

    function escapeHtml(str){
      return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#039;');
    }

    function renderCanvas(){
      canvasEl.innerHTML = canvas.map((block, idx) => `
        <div class="rounded-3xl bg-white ring-1 ring-slate-200 shadow-soft overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="h-10 w-10 rounded-2xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none">${blockIcon(block.type)}</svg>
              </span>
              <div>
                <p class="text-sm font-semibold">${escapeHtml(block.type.toUpperCase())}</p>
                <p class="text-xs text-slate-500">Section ${idx + 1}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold focus-ring moveUp" data-idx="${idx}" aria-label="Move up">↑</button>
              <button class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold focus-ring moveDown" data-idx="${idx}" aria-label="Move down">↓</button>
              <button class="px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-sm font-semibold focus-ring edit" data-idx="${idx}">Edit</button>
              <button class="px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold focus-ring remove" data-idx="${idx}">Remove</button>
            </div>
          </div>

          <div class="p-4 sm:p-6 bg-slate-50">
            ${renderBlockPreview(block)}
          </div>
        </div>
      `).join('');

      $$('.moveUp', canvasEl).forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.idx);
        if(i <= 0) return;
        [canvas[i-1], canvas[i]] = [canvas[i], canvas[i-1]];
        setBuilderStatus('Saving…');
        renderCanvas();
        saveCanvas();
      }));

      $$('.moveDown', canvasEl).forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.idx);
        if(i >= canvas.length - 1) return;
        [canvas[i+1], canvas[i]] = [canvas[i], canvas[i+1]];
        setBuilderStatus('Saving…');
        renderCanvas();
        saveCanvas();
      }));

      $$('.remove', canvasEl).forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.idx);
        const removed = canvas.splice(i, 1);
        setBuilderStatus('Saving…');
        renderCanvas();
        saveCanvas();
        toast('Removed', `Deleted ${removed[0]?.type || 'section'}.`);
      }));

      $$('.edit', canvasEl).forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.idx);
        const block = canvas[i];
        const title = prompt('Section title:', block.title);
        if(title === null) return;
        const body = prompt('Section description:', block.body);
        if(body === null) return;
        block.title = title;
        block.body = body;
        setBuilderStatus('Saving…');
        renderCanvas();
        saveCanvas();
      }));
    }

    function builderApplyTemplate(tplId, siteName){
      const tpl = templates.find(t => t.id === tplId);
      if(!tpl) return;
      canvas = [
        { type: 'hero', title: siteName || tpl.name, body: `Loaded from template: ${tpl.name}.` },
        { type: 'features', title: 'Highlights', body: tpl.bullets[0] || 'Feature highlights.' },
        { type: 'gallery', title: 'Showcase', body: tpl.bullets[1] || 'Gallery section.' },
        { type: 'pricing', title: 'Plans', body: 'Add your offers and packages.' },
        { type: 'faq', title: 'Questions', body: 'Answer common questions to reduce friction.' },
        { type: 'cta', title: 'Get started today', body: 'Close the deal with a strong CTA.' },
      ];
      setBuilderStatus('Saving…');
      renderCanvas();
      saveCanvas();
      toast('Template loaded', `“${tpl.name}” applied to builder.`);
    }

    $('#btnResetBuilder').addEventListener('click', () => {
      canvas = structuredClone(defaultCanvas);
      setBuilderStatus('Saving…');
      renderCanvas();
      saveCanvas();
      toast('Reset', 'Builder restored to default layout.');
    });

    $('#btnPublish').addEventListener('click', () => {
      const preview = {
        updatedAt: new Date().toISOString(),
        blocks: canvas
      };
      localStorage.setItem('wixish.published', JSON.stringify(preview));
      toast('Published', 'Preview saved locally (wixish.published).');
      // Also open a small modal-like toast with next steps
      openCmdkWith('publish');
    });

    // ---------- Command palette (⌘K / Ctrl+K) ----------
    const cmdkEl = $('#cmdk');
    const cmdkInput = $('#cmdkInput');
    const cmdkList = $('#cmdkList');

    const commands = [
      { id: 'templates', label: 'Go to Templates', hint: 'Browse layouts', run: () => { location.hash = '#templates'; toast('Navigated', 'Templates section.'); } },
      { id: 'builder', label: 'Go to Builder', hint: 'Add and reorder sections', run: () => { location.hash = '#builder'; toast('Navigated', 'Builder section.'); } },
      { id: 'pricing', label: 'Go to Pricing', hint: 'Compare plans', run: () => { location.hash = '#pricing'; toast('Navigated', 'Pricing section.'); } },
      { id: 'publish', label: 'Publish Preview', hint: 'Save to localStorage', run: () => { $('#btnPublish').click(); } },
      { id: 'theme', label: 'Toggle Theme', hint: 'Light / Dark', run: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); } },
      { id: 'help', label: 'Open FAQ', hint: 'Get answers', run: () => { location.hash = '#faq'; toast('Help', 'FAQ section.'); } },
    ];

    function openCmdk(){
      cmdkEl.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      renderCmdk('');
      setTimeout(() => cmdkInput.focus(), 0);
    }
    function closeCmdk(){
      cmdkEl.classList.add('hidden');
      document.body.style.overflow = '';
      cmdkInput.value = '';
    }

    function renderCmdk(query){
      const q = query.trim().toLowerCase();
      const filtered = !q ? commands : commands.filter(c => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q) || c.id.includes(q));
      cmdkList.innerHTML = filtered.map((c, idx) => `
        <button class="w-full px-4 py-3 rounded-2xl text-left hover:bg-slate-50 focus-ring cmdkItem" data-id="${c.id}" data-idx="${idx}">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold">${c.label}</p>
              <p class="mt-0.5 text-xs text-slate-500">${c.hint}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-lg bg-slate-50 ring-1 ring-slate-200">Enter</span>
          </div>
        </button>
      `).join('');

      $$('.cmdkItem', cmdkList).forEach(btn => btn.addEventListener('click', () => {
        const cmd = commands.find(c => c.id === btn.dataset.id);
        closeCmdk();
        cmd?.run();
      }));
    }

    function openCmdkWith(q){
      openCmdk();
      cmdkInput.value = q;
      renderCmdk(q);
    }

    cmdkEl.addEventListener('click', (e) => {
      if(e.target && e.target.dataset && e.target.dataset.cmdkClose === 'true') closeCmdk();
      if(e.target && e.target.closest && e.target.closest('[data-cmdk-close="true"]')) closeCmdk();
    });

    cmdkInput.addEventListener('input', () => renderCmdk(cmdkInput.value));

    cmdkInput.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){
        const first = $('.cmdkItem', cmdkList);
        first?.click();
      }
    });

    window.addEventListener('keydown', (e) => {
      const isK = e.key.toLowerCase() === 'k';
      if(isK && (e.ctrlKey || e.metaKey)){
        e.preventDefault();
        if(cmdkEl.classList.contains('hidden')) openCmdk(); else closeCmdk();
      }
    });

    // Footer buttons
    $('#btnKeyboard').addEventListener('click', () => openCmdkWith('help'));
    $('#btnChangelog').addEventListener('click', () => toast('Changelog', 'Demo build: templates, builder, pricing, carousel, FAQ.'));
    $('#btnAbout').addEventListener('click', () => toast('About', 'Wix-inspired UI demo built as a single HTML file.'));
    $('#btnReport').addEventListener('click', () => toast('Report', 'No backend: copy this file into your project and adjust.'));

    // Sales CTA
    $('#btnContactSales').addEventListener('click', () => {
      toast('Sales', 'Demo: In a real app, this would open a contact form.');
      openCmdkWith('pricing');
    });

    // Login buttons
    function login(){ toast('Log In', 'Demo only. Implement auth in a real project.'); }
    $('#btnLogin').addEventListener('click', login);
    $('#btnLoginMobile').addEventListener('click', () => { closeDrawer(); login(); });

    // Initialize
    $('#year').textContent = new Date().getFullYear();
    renderTemplates();
    renderPricing();
    setBilling(localStorage.getItem('wixish.billing') || 'monthly');

    // Persist billing
    const oldSetBilling = setBilling;
    setBilling = (next) => { oldSetBilling(next); localStorage.setItem('wixish.billing', next); };

    renderTestimonial();
    startAutoplay();
    renderFaq();
    renderPalette();
    renderCanvas();
    setBuilderStatus('Saved');

    // If user arrives with hash
    if(location.hash === '#builder') toast('Tip', 'Try adding sections from the palette.');