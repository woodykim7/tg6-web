/* ============================================================
   TG6 Recruit Site - Interactions
   ============================================================ */

// 1. 가짜 시계 업데이트 (상단 상태바)
(function liveClock() {
  const el = document.getElementById('liveClock');
  if (!el) return;
  function tick() {
    const d = new Date();
    el.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  tick();
  setInterval(tick, 30000);
})();

// 2. 카테고리 탭 (Khám phá thêm)
(function exploreTabs() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
      // 탭바 위로 자연스럽게 스크롤
      const explore = document.getElementById('explore');
      if (explore) {
        const offset = explore.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
})();

// 2.5. TikTok 이벤트 피드 — data/events.json 읽어서 표시
(function eventsTikTokFeed() {
  const list = document.getElementById('eventsList');
  if (!list) return;

  function extractVideoId(url) {
    // TikTok video (/video/ID) and photo carousel (/photo/ID) both supported
    const m = String(url || '').match(/\/(?:video|photo)\/(\d+)/);
    return m ? m[1] : '';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    // YYYY-MM-DD -> DD/MM/YYYY (Vietnamese style)
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
  }

  function renderCard(ev) {
    const id = extractVideoId(ev.tiktokUrl);
    if (!id) return '';
    const url = escapeHtml(ev.tiktokUrl);
    const dateStr = escapeHtml(formatDate(ev.date));
    const title = ev.title ? `<h3 class="event-title">${escapeHtml(ev.title)}</h3>` : '';
    const caption = ev.caption ? `<p class="event-caption">${escapeHtml(ev.caption)}</p>` : '';
    return `
      <article class="event-card">
        <header class="event-header">
          <span class="event-date">📅 ${dateStr}</span>
          ${title}
        </header>
        <blockquote class="tiktok-embed"
                    cite="${url}"
                    data-video-id="${id}"
                    style="max-width:605px;min-width:325px;margin:0;">
          <section><a target="_blank" rel="noopener" href="${url}">Xem trên TikTok</a></section>
        </blockquote>
        ${caption}
      </article>
    `;
  }

  fetch('data/events.json?t=' + Date.now())
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(events => {
      if (!Array.isArray(events) || events.length === 0) {
        list.innerHTML = '<p class="events-loading">Chưa có sự kiện nào — sẽ cập nhật sớm.</p>';
        return;
      }
      // 최신 순 정렬
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = events.map(renderCard).join('');

      // TikTok embed.js 로드 (이미 있으면 재처리만)
      if (window.tiktokEmbed && window.tiktokEmbed.lib && typeof window.tiktokEmbed.lib.render === 'function') {
        window.tiktokEmbed.lib.render();
      } else {
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.tiktok.com/embed.js';
        document.body.appendChild(s);
      }
    })
    .catch(err => {
      console.error('events.json 로드 실패:', err);
      list.innerHTML = '<p class="events-error">Không thể tải sự kiện. Vui lòng thử lại sau.</p>';
    });
})();

// 3. 비디오 카드 — 클릭 시 모달에서 영상 재생 (뒤로가기 지원)
(function voiceCards() {
  const cards = document.querySelectorAll('.voice-card');
  const modal = document.getElementById('videoModal');
  const video = document.getElementById('modalVideo');
  const empty = document.getElementById('videoModalEmpty');
  const caption = document.getElementById('videoModalCaption');
  const closeBtn = document.getElementById('videoModalClose');
  if (!modal || !video) return;

  let historyPushed = false;

  function openModal(card) {
    const src = card.dataset.video;
    const poster = card.dataset.poster;
    const title = card.querySelector('h3')?.textContent || '';
    const desc = card.querySelector('p')?.innerHTML || '';

    caption.innerHTML = `<strong>${title}</strong>${desc}`;

    if (src) {
      video.src = src;
      if (poster) video.poster = poster;
      video.style.display = '';
      empty.style.display = 'none';
      video.play().catch(() => {});
    } else {
      video.removeAttribute('src');
      video.load();
      video.style.display = 'none';
      empty.style.display = '';
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // 뒤로가기 버튼으로 닫을 수 있도록 history state 추가
    history.pushState({ tg6Modal: 'video' }, '');
    historyPushed = true;
  }

  // 실제 UI 정리만 수행 (history 조작 없음)
  function closeUI() {
    modal.hidden = true;
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.body.style.overflow = '';
    historyPushed = false;
  }

  // X 버튼/백드롭/ESC에서 호출 — history 상태 소비
  function closeFromUI() {
    if (historyPushed) {
      history.back();   // popstate 발생 → closeUI 호출됨
    } else {
      closeUI();
    }
  }

  // 폰의 뒤로가기 버튼 처리
  window.addEventListener('popstate', () => {
    if (!modal.hidden) closeUI();
  });

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeFromUI);
  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeFromUI);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeFromUI();
  });
})();

// 4. 사진 라이트박스 — 사진 클릭 시 확대 (뒤로가기 지원)
(function imageLightbox() {
  const lb = document.getElementById('imageLightbox');
  const img = document.getElementById('imageLightboxImg');
  const caption = document.getElementById('imageLightboxCaption');
  const closeBtn = document.getElementById('imageLightboxClose');
  if (!lb || !img) return;

  let historyPushed = false;

  function open(url, captionText) {
    img.src = url;
    img.alt = captionText || '';
    caption.textContent = captionText || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';

    // 뒤로가기 버튼으로 닫을 수 있도록 history state 추가
    history.pushState({ tg6Modal: 'lightbox' }, '');
    historyPushed = true;
  }

  // 실제 UI 정리만 (history 조작 없음)
  function closeUI() {
    lb.hidden = true;
    img.removeAttribute('src');
    caption.textContent = '';
    document.body.style.overflow = '';
    historyPushed = false;
  }

  // X 버튼/백드롭/ESC — history 소비
  function closeFromUI() {
    if (historyPushed) {
      history.back();
    } else {
      closeUI();
    }
  }

  // 폰의 뒤로가기 버튼 처리
  window.addEventListener('popstate', () => {
    if (!lb.hidden) closeUI();
  });

  function getBgUrl(el) {
    const bg = el.style.backgroundImage || getComputedStyle(el).backgroundImage || '';
    const m = bg.match(/url\(\s*['"]?(.+?)['"]?\s*\)/);
    return m ? m[1] : null;
  }

  // why-section + explore-section 사진들
  const selectors = '.why-img, .photo-card .photo';
  document.querySelectorAll(selectors).forEach(el => {
    el.addEventListener('click', () => {
      const url = getBgUrl(el);
      if (!url) return;
      const card = el.closest('.why-card, .photo-card');
      const captionText = card?.querySelector('h3, p')?.textContent.trim() || '';
      open(url, captionText);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeFromUI);
  lb.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeFromUI));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lb.hidden) closeFromUI();
  });
})();

// 5. Zalo QR 모달 — Zalo 버튼 클릭 시 QR 표시 (뒤로가기 지원)
(function zaloQrModal() {
  const modal = document.getElementById('zaloModal');
  if (!modal) return;
  const triggers = document.querySelectorAll('[data-zalo-trigger]');

  let historyPushed = false;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    history.pushState({ tg6Modal: 'zalo' }, '');
    historyPushed = true;
  }
  function closeUI() {
    modal.hidden = true;
    document.body.style.overflow = '';
    historyPushed = false;
  }
  function closeFromUI() {
    if (historyPushed) history.back();
    else closeUI();
  }

  window.addEventListener('popstate', () => {
    if (!modal.hidden) closeUI();
  });

  triggers.forEach(t => {
    t.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });
  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeFromUI);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeFromUI();
  });
})();

// 6. 부드러운 스크롤 (앵커 링크)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});
