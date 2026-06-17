/* Nav: hide on scroll down, reveal on scroll up; go solid once off the top.
       rAF-throttled so the scroll handler does work at most once per frame. */
    (function () {
      var nav = document.getElementById('siteNav');
      if (!nav) return;
      var lastY = window.scrollY;
      var ticking = false;
      var SOLID_AT = 80;    // px before the bar turns solid
      var TOP_ZONE = 140;   // always show the nav within this band from the top
      var DELTA = 6;        // ignore tiny jitters

      function update() {
        var y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > SOLID_AT);

        if (y < TOP_ZONE || y < lastY - DELTA) {
          nav.classList.remove('is-hidden');     // near top or scrolling up
        } else if (y > lastY + DELTA) {
          nav.classList.add('is-hidden');         // scrolling down
        }
        lastY = y;
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    })();

    /* ===================== Mobile menu toggle ===================== */
    (function () {
      var nav = document.getElementById('siteNav');
      var toggle = document.getElementById('navToggle');
      var menu = document.getElementById('mobileMenu');
      if (!nav || !toggle || !menu) return;

      function setOpen(open) {
        nav.classList.toggle('is-open', open);
        document.body.classList.toggle('is-menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      }

      toggle.addEventListener('click', function () {
        setOpen(!nav.classList.contains('is-open'));
      });

      var closeBtn = document.getElementById('navClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () { setOpen(false); });
      }

      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setOpen(false); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
      });
    })();

    /* ===================== FACILITY tab + slideshow ===================== */
    (function () {
      var tabs      = document.querySelectorAll('[data-facility]');
      if (!tabs.length) return;

      var slidesEl  = document.getElementById('facilitySlides');
      var dotsEl    = document.getElementById('facilityDots');
      var prevBtn   = document.getElementById('facilityPrev');
      var nextBtn   = document.getElementById('facilityNext');
      var titleEl   = document.getElementById('facilityTitle');
      var descEl    = document.getElementById('facilityDesc');
      var perksEl   = document.getElementById('facilityPerks');

      var data = {
        clubhouse: {
          images: [
            'asset/facility-06_05_the-armont_clubhouse-visual.webp',
            'asset/facility-06_05_the-armont_clubhouse-visual_02.webp',
            'asset/facility-06_05_the-armont_clubhouse-visual_03.webp',
            'asset/facility-06_09_the-armont_ch-02.webp'
          ],
          title: 'Le Gran Clubhouse',
          desc:  'Klub eksklusif hanya untuk penghuni The Armont — mempertemukan alam dan wellness dalam satu ruang bersama. Didesain sebagai Royal Retreat, tempat keluarga Anda beristirahat dan tumbuh bersama.',
          perks: ['Swimming Pool', 'Gym', 'Children Playground', 'Multifunction Area']
        },
        tudor: {
          images: [
            'asset/facility-tudor--jp-9207.webp',
            'asset/facility-tudor--jp-9246.webp'
          ],
          title: 'Tudor Park',
          desc:  'Ruang hijau yang dirancang untuk keluarga berkumpul, anak-anak bermain, dan komunitas tumbuh. Penuhi sore Anda dengan udara segar dan suara alam.',
          perks: ['Jogging Track', 'Outdoor Gym', 'Pet Friendly', 'Picnic Area']
        },
        graceley: {
          images: [
            'asset/facility-graceley--jp-8955.webp',
            'asset/facility-graceley--jp-9036.webp',
            'asset/facility-graceley--jp-9117.webp'
          ],
          title: 'Graceley Park',
          desc:  'Taman tematik dengan area bermain anak, instalasi seni, dan plaza komunitas — tempat Anda menciptakan kenangan keluarga setiap akhir pekan.',
          perks: ['Kids Playground', 'Art Installation', 'Community Plaza', 'Open Lawn']
        }
      };

      var currentIdx = 0;
      var currentImages = [];
      var autoTimer = null;
      var INTERVAL = 4000;

      function buildSlides(images) {
        currentImages = images;
        currentIdx = 0;
        slidesEl.innerHTML = images.map(function (src, i) {
          return '<img class="facility-slide' + (i === 0 ? ' facility-slide--active' : '') + '" src="' + src + '" alt="" />';
        }).join('');
        buildDots(images.length);
      }

      function buildDots(count) {
        dotsEl.innerHTML = '';
        for (var i = 0; i < count; i++) {
          var d = document.createElement('button');
          d.className = 'facility-dot' + (i === 0 ? ' facility-dot--active' : '');
          d.setAttribute('aria-label', 'Slide ' + (i + 1));
          d.dataset.idx = i;
          d.addEventListener('click', function () { goTo(+this.dataset.idx); resetAuto(); });
          dotsEl.appendChild(d);
        }
      }

      function goTo(idx) {
        var slides = slidesEl.querySelectorAll('.facility-slide');
        var dots   = dotsEl.querySelectorAll('.facility-dot');
        slides[currentIdx].classList.remove('facility-slide--active');
        dots[currentIdx] && dots[currentIdx].classList.remove('facility-dot--active');
        currentIdx = (idx + currentImages.length) % currentImages.length;
        slides[currentIdx].classList.add('facility-slide--active');
        dots[currentIdx] && dots[currentIdx].classList.add('facility-dot--active');
      }

      function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(function () { goTo(currentIdx + 1); }, INTERVAL);
      }

      function setActiveTab(key) {
        var d = data[key];
        if (!d) return;
        tabs.forEach(function (t) {
          t.classList.toggle('tab--active', t.dataset.facility === key);
        });
        buildSlides(d.images);
        if (titleEl) titleEl.textContent = d.title;
        if (descEl)  descEl.textContent  = d.desc;
        if (perksEl) {
          perksEl.innerHTML = d.perks.map(function (p) {
            return '<span class="perk">' + p + '</span>';
          }).join('');
        }
        resetAuto();
      }

      prevBtn && prevBtn.addEventListener('click', function () { goTo(currentIdx - 1); resetAuto(); });
      nextBtn && nextBtn.addEventListener('click', function () { goTo(currentIdx + 1); resetAuto(); });

      tabs.forEach(function (t) {
        t.addEventListener('click', function () { setActiveTab(t.dataset.facility); });
      });

      setActiveTab('graceley');
    })();

    /* ===================== FLOORPLAN interactions ===================== */
    (function () {
      var typeBtns = document.querySelectorAll('.tab[data-fp-type]');
      var slots    = document.querySelectorAll('.fp-slot');
      if (!typeBtns.length || !slots.length) return;

      var curType = 'type9';

      var specs = {
        type9: {
          title: 'The Novel Type 9',
          luas: '153 m²',
          bangunan: '200 m²',
          carport: '2',
          bedroom: '4',
          bathroom: '4',
          courtyard: '1'
        },
        type8: {
          title: 'The Novel Type 8',
          luas: '120 m²',
          bangunan: '158 m²',
          carport: '2',
          bedroom: '2',
          bathroom: '3',
          courtyard: '1'
        }
      };

      function showPlan() {
        slots.forEach(function (s) {
          s.classList.toggle('fp-slot--visible', s.dataset.fpType === curType);
        });
      }

      function updateSpecs() {
        var s = specs[curType];
        if (!s) return;
        var el = function (id) { return document.getElementById(id); };
        if (el('fpSpecTitle')) el('fpSpecTitle').textContent = s.title;
        if (el('fpLuas')) el('fpLuas').textContent = s.luas;
        if (el('fpBangunan')) el('fpBangunan').textContent = s.bangunan;
        if (el('fpCarport')) el('fpCarport').textContent = s.carport;
        if (el('fpBedroom')) el('fpBedroom').textContent = s.bedroom;
        if (el('fpBathroom')) el('fpBathroom').textContent = s.bathroom;
        if (el('fpCourtyard')) el('fpCourtyard').textContent = s.courtyard;
      }

      typeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          curType = btn.dataset.fpType;
          typeBtns.forEach(function (b) {
            b.classList.toggle('tab--active', b.dataset.fpType === curType);
          });
          showPlan();
          updateSpecs();
        });
      });

      showPlan();
      updateSpecs();
    })();

