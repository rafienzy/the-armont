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

    /* ===================== FACILITY tab interactions ===================== */
    (function () {
      var tabs = document.querySelectorAll('[data-facility]');
      if (!tabs.length) return;

      var img   = document.getElementById('facilityImg');
      var title = document.getElementById('facilityTitle');
      var desc  = document.getElementById('facilityDesc');
      var perks = document.getElementById('facilityPerks');

      var data = {
        clubhouse: {
          img: 'asset/facility-clubhouse.webp',
          title: 'Le Gran Clubhouse',
          desc: 'Klub eksklusif hanya untuk penghuni The Armont — mempertemukan alam dan wellness dalam satu ruang bersama. Didesain sebagai Royal Retreat, tempat keluarga Anda beristirahat dan tumbuh bersama.',
          perks: ['Swimming Pool', 'Gym', 'Children Playground', 'Multifunction Area']
        },
        tudor: {
          img: 'asset/tudor-park.webp',
          title: 'Tudor Park',
          desc: 'Ruang hijau yang dirancang untuk keluarga berkumpul, anak-anak bermain, dan komunitas tumbuh. Penuhi sore Anda dengan udara segar dan suara alam.',
          perks: ['Jogging Track', 'Outdoor Gym', 'Pet Friendly', 'Picnic Area']
        },
        graceley: {
          img: 'asset/graceley-park.webp',
          title: 'Graceley Park',
          desc: 'Taman tematik dengan area bermain anak, instalasi seni, dan plaza komunitas — tempat Anda menciptakan kenangan keluarga setiap akhir pekan.',
          perks: ['Kids Playground', 'Art Installation', 'Community Plaza', 'Open Lawn']
        }
      };

      function setActive(key) {
        var d = data[key];
        if (!d) return;
        tabs.forEach(function (t) {
          t.classList.toggle('tab--active', t.dataset.facility === key);
        });
        if (img) img.src = d.img;
        if (title) title.textContent = d.title;
        if (desc) desc.textContent = d.desc;
        if (perks) {
          perks.innerHTML = d.perks.map(function (p) {
            return '<span class="perk">' + p + '</span>';
          }).join('');
        }
      }

      tabs.forEach(function (t) {
        t.addEventListener('click', function () { setActive(t.dataset.facility); });
      });
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
          carport: '2',
          bedroom: '4',
          bathroom: '4',
          courtyard: '1',
          avail: '6 UNIT TERSEDIA'
        },
        type8: {
          title: 'The Novel Type 8',
          luas: '120 m²',
          carport: '2',
          bedroom: '2',
          bathroom: '3',
          courtyard: '1',
          avail: '8 UNIT TERSEDIA'
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
        if (el('fpCarport')) el('fpCarport').textContent = s.carport;
        if (el('fpBedroom')) el('fpBedroom').textContent = s.bedroom;
        if (el('fpBathroom')) el('fpBathroom').textContent = s.bathroom;
        if (el('fpCourtyard')) el('fpCourtyard').textContent = s.courtyard;
        if (el('fpAvail')) el('fpAvail').textContent = s.avail;
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

    /* ===================== SITEPLAN legend hover ===================== */
    (function () {
      var map = document.getElementById('siteplanMap');
      if (!map) return;
      var items = document.querySelectorAll('.siteplan-legend__item[data-chapter]');
      items.forEach(function (it) {
        var ch = it.dataset.chapter;
        function show() { map.classList.add('sp-show-' + ch); }
        function hide() { map.classList.remove('sp-show-' + ch); }
        it.addEventListener('mouseenter', show);
        it.addEventListener('mouseleave', hide);
        it.addEventListener('focus', show);
        it.addEventListener('blur', hide);
      });
    })();
