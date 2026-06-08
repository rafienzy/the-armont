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

    (function () {
      var accordion = document.querySelector('.hero-accordion');
      if (!accordion) return;

      var items = Array.prototype.slice.call(accordion.querySelectorAll('.acc-img'));
      if (!items.length) return;
      var defaultItem = accordion.querySelector('[data-default]') || items[0];

      var AUTOPLAY_MS = 3000;
      var autoTimer = null;

      function setActive(item) {
        items.forEach(function (el) {
          el.classList.toggle('is-active', el === item);
        });
      }

      /* ---------- Desktop: hover-driven ---------- */
      // Expanding follows the mouse, but leaving the accordion keeps the
      // last hovered image open — it only changes on the next hover.
      function onEnter() { setActive(this); }

      function enableHover() {
        items.forEach(function (item) { item.addEventListener('mouseenter', onEnter); });
      }
      function disableHover() {
        items.forEach(function (item) { item.removeEventListener('mouseenter', onEnter); });
      }

      /* ---------- Mobile / tablet: auto-cycle ---------- */
      function startAuto() {
        stopAuto();
        var current = items.indexOf(accordion.querySelector('.acc-img.is-active'));
        if (current < 0) current = 0;
        autoTimer = setInterval(function () {
          current = (current + 1) % items.length;
          setActive(items[current]);
        }, AUTOPLAY_MS);
      }
      function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      }

      /* ---------- Mode switching ---------- */
      var autoMQ = window.matchMedia('(max-width: 1100px)');
      var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

      function applyMode() {
        disableHover();
        stopAuto();
        setActive(defaultItem);

        if (autoMQ.matches) {
          // touch / small screens: cycle automatically (unless reduced motion)
          if (!reduceMQ.matches) startAuto();
        } else {
          // desktop: wait for hover
          enableHover();
        }
      }

      function bind(mq, fn) {
        if (mq.addEventListener) mq.addEventListener('change', fn);
        else if (mq.addListener) mq.addListener(fn); // older Safari
      }
      bind(autoMQ, applyMode);
      bind(reduceMQ, applyMode);

      // Pause autoplay when the tab is hidden, resume when visible.
      document.addEventListener('visibilitychange', function () {
        if (autoTimer === null && !autoMQ.matches) return;
        if (document.hidden) stopAuto();
        else if (autoMQ.matches && !reduceMQ.matches) startAuto();
      });

      applyMode();
    })();

    /* ===================== SITEPLAN interactions ===================== */
    (function () {
      var groups   = document.querySelectorAll('.sp-group');
      var legends  = document.querySelectorAll('.sp-legend-item');
      var tooltip  = document.getElementById('spTooltip');
      var infoName = document.getElementById('spInfoName');
      var infoUnits= document.getElementById('spInfoUnits');
      var infoSize = document.getElementById('spInfoSize');
      var infoPrice= document.getElementById('spInfoPrice');
      if (!groups.length || !tooltip) return;

      // update info box
      function setInfo(name, units, size, price) {
        infoName.textContent  = name;
        infoUnits.textContent = units;
        infoSize.textContent  = size;
        infoPrice.textContent = price;
      }

      // filter map by type
      function filter(type) {
        groups.forEach(function (g) {
          if (type === 'all' || g.dataset.type === type) {
            g.classList.remove('sp-dimmed');
            g.classList.add('sp-highlighted');
          } else {
            g.classList.add('sp-dimmed');
            g.classList.remove('sp-highlighted');
          }
        });
        legends.forEach(function (l) {
          l.classList.toggle('sp-active', l.dataset.filter === type);
          l.classList.toggle('sp-all-active', l.dataset.filter === 'all' && type === 'all');
        });
      }

      // legend click
      legends.forEach(function (item) {
        item.addEventListener('click', function () {
          var f = item.dataset.filter;
          filter(f);
          if (f === 'all') {
            setInfo('The Armont Residences', '27 unit', '3 tipe', '5M');
          } else if (f === 'azure') {
            setInfo('Tipe Azure', '6 unit', '280 m²', 'Mulai Rp 7M');
          } else if (f === 'onyx') {
            setInfo('Tipe Onyx', '8 unit', '240 m²', 'Mulai Rp 5.8M');
          } else {
            setInfo('Tipe Pearl', '13 unit', '220 m²', 'Mulai Rp 5M');
          }
        });
      });

      // tooltip on house hover
      groups.forEach(function (g) {
        g.querySelectorAll('.sp-house').forEach(function (house) {
          house.addEventListener('mouseenter', function (e) {
            tooltip.innerHTML = '<b>' + g.dataset.name + '</b><br>Luas ' + g.dataset.size + ' · ' + g.dataset.price;
            tooltip.classList.add('sp-visible');
          });
          house.addEventListener('mousemove', function (e) {
            tooltip.style.left = (e.clientX + 14) + 'px';
            tooltip.style.top  = (e.clientY - 36) + 'px';
          });
          house.addEventListener('mouseleave', function () {
            tooltip.classList.remove('sp-visible');
          });
        });
      });

      // start with "all" highlighted
      filter('all');
    })();

    /* ===================== FLOORPLAN interactions ===================== */
    (function () {
      var typeBtns  = document.querySelectorAll('[data-fp-type]');
      var floorBtns = document.querySelectorAll('[data-fp-floor]');
      var plans     = document.querySelectorAll('.fp-plan');
      if (!typeBtns.length) return;

      var curType  = 'azure';
      var curFloor = '1';

      var specs = {
        azure: { title:'Tipe Azure', luas:'280 m²', kt:'5 KT', km:'4 KM', cp:'2 Mobil', harga:'Rp 7 Miliar', avail:'6 Unit Tersedia' },
        onyx:  { title:'Tipe Onyx',  luas:'240 m²', kt:'4 KT', km:'3 KM', cp:'2 Mobil', harga:'Rp 5.8 Miliar', avail:'8 Unit Tersedia' },
        pearl: { title:'Tipe Pearl', luas:'220 m²', kt:'4 KT', km:'3 KM', cp:'1 Mobil', harga:'Rp 5 Miliar', avail:'13 Unit Tersedia' },
      };

      function showPlan() {
        plans.forEach(function (p) {
          p.classList.toggle('fp-visible',
            p.dataset.fpType === curType && p.dataset.fpFloor === curFloor);
        });
      }

      function updateSpecs(type) {
        var s = specs[type];
        document.getElementById('fpSpecsTitle').textContent = s.title;
        document.getElementById('fpLuas').textContent       = s.luas;
        document.getElementById('fpKT').textContent         = s.kt;
        document.getElementById('fpKM').textContent         = s.km;
        document.getElementById('fpCP').textContent         = s.cp;
        document.getElementById('fpHarga').textContent      = s.harga;
        document.getElementById('fpAvail').textContent      = s.avail;
      }

      typeBtns.forEach(function (btn) {
        if (!btn.dataset.fpType) return;   // skip floor buttons
        btn.addEventListener('click', function () {
          curType = btn.dataset.fpType;
          typeBtns.forEach(function (b) { b.classList.toggle('fp-active', b.dataset.fpType === curType); });
          showPlan();
          updateSpecs(curType);
        });
      });

      floorBtns.forEach(function (btn) {
        if (!btn.dataset.fpFloor) return;  // skip type buttons
        btn.addEventListener('click', function () {
          curFloor = btn.dataset.fpFloor;
          floorBtns.forEach(function (b) { b.classList.toggle('fp-active', b.dataset.fpFloor === curFloor); });
          showPlan();
        });
      });

      showPlan();
      updateSpecs(curType);
    })();
