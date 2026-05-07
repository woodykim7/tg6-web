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

// 3. 수입 카드 — 클릭 시 상세 정보 보여주기
(function incomeCards() {
  const cards = document.querySelectorAll('.income-card');
  const detail = document.getElementById('incomeDetail');
  const titleEl = document.getElementById('incDetailTitle');
  const amountEl = document.getElementById('incDetailAmount');
  const descEl = document.getElementById('incDetailDesc');
  const listEl = document.getElementById('incDetailList');
  const closeBtn = document.getElementById('incomeClose');

  // 각 카드의 상세 데이터
  const data = {
    new: {
      title: '👶 Công nhân mới',
      amount: '7 - 9 triệu / tháng',
      desc: 'Mức lương dành cho công nhân mới vào, chưa có kinh nghiệm hoặc ít kinh nghiệm.',
      list: [
        'Lương cơ bản theo quy định nhà nước',
        'Thưởng cơ bản hàng tháng',
        'Được đào tạo kỹ năng miễn phí',
        'Hỗ trợ làm quen công việc'
      ]
    },
    experienced: {
      title: '👷 Công nhân có kinh nghiệm',
      amount: '10 - 13 triệu / tháng',
      desc: 'Dành cho công nhân may đã có kinh nghiệm, làm được nhiều công đoạn.',
      list: [
        'Lương cơ bản + thưởng năng suất',
        'Tăng ca tự nguyện được trả thêm',
        'Thưởng chuyên cần',
        'Cơ hội thăng tiến lên tổ trưởng'
      ]
    },
    quality: {
      title: '🏆 Thưởng sản lượng cá nhân',
      amount: '1.5 - 2.5 triệu / tháng',
      desc: 'Thưởng thêm hàng tháng dựa trên năng suất cá nhân — ai giỏi, ai nhanh thì được nhiều hơn.',
      list: [
        'Cao nhất: 2.5 triệu / tháng',
        'Trung bình: 0.8 - 1.0 triệu',
        'Tính theo sản lượng thực tế cá nhân',
        'Công khai minh bạch mỗi cuối tháng'
      ]
    },
    leader: {
      title: '👑 Tổ trưởng / Chuyền trưởng',
      amount: '15 - 20 triệu / tháng',
      desc: 'Vị trí quản lý chuyền may, có phụ cấp chức vụ và trách nhiệm.',
      list: [
        'Lương cơ bản + phụ cấp quản lý',
        'Thưởng mục tiêu chuyền',
        'Cơ hội phát triển sự nghiệp',
        'Được đào tạo kỹ năng quản lý'
      ]
    },
    referral: {
      title: '🤝 Giới thiệu công nhân may',
      amount: '1 triệu / người',
      desc: 'Giới thiệu công nhân may mới vào TG6 — bạn được thưởng ngay sau khi họ ký hợp đồng.',
      list: [
        'Nhận ngay 1 triệu sau khi ký HĐ',
        'Không giới hạn số lượng giới thiệu',
        'Áp dụng cho cả người thân, bạn bè',
        'Chi trả cùng kỳ lương'
      ]
    },
    referral2: {
      title: '🎁 Giới thiệu (sau 6 tháng)',
      amount: '6 triệu / người',
      desc: 'Khi người được bạn giới thiệu làm việc đủ 6 tháng — bạn được thưởng thêm 6 triệu.',
      list: [
        'Tổng 7 triệu / 1 người được giới thiệu',
        '(1 triệu lúc ký HĐ + 6 triệu sau 6 tháng)',
        'Không giới hạn số lượng',
        'Khuyến khích giữ chân người tốt'
      ]
    }
  };

  function showDetail(key) {
    const item = data[key];
    if (!item) return;
    titleEl.textContent = item.title;
    amountEl.textContent = item.amount;
    descEl.textContent = item.desc;
    listEl.innerHTML = item.list.map(x => `<li>${x}</li>`).join('');
    detail.hidden = false;
    setTimeout(() => {
      detail.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => showDetail(card.dataset.income));
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => { detail.hidden = true; });
  }
})();

// 4. 부드러운 스크롤 (앵커 링크)
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
