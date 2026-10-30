(() => {
  'use strict';

  const STORE_KEY = 'codepath-static-progress-v1';
  const readState = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return { completed: Array.isArray(value.completed) ? value.completed : [], attempts: Array.isArray(value.attempts) ? value.attempts : [], xp: Number(value.xp) || 0 };
    } catch {
      return { completed: [], attempts: [], xp: 0 };
    }
  };
  let state = readState();
  const saveState = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));
  const $ = (selector, root = document) => root.querySelector(selector);

  // Account controls are intentionally local-only in this PHP-free build.
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-modal]');
    if (!control) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  function refreshProgress() {
    document.querySelectorAll('.lesson-row').forEach(row => {
      const id = $('[data-lesson]', row)?.dataset.lesson;
      const complete = id && state.completed.includes(id);
      row.classList.toggle('done', Boolean(complete));
      const mark = $('.lesson-check', row);
      if (mark) mark.textContent = complete ? '✓' : '○';
    });
    const profile = $('#profile');
    if (!profile) return;
    profile.replaceChildren();
    const wrap = document.createElement('div');
    wrap.className = 'progress-dashboard';
    wrap.innerHTML = `<div class="eyebrow">YOUR LEARNING DASHBOARD</div><h2>Progress on this device</h2><p>Your learning progress is saved in this browser. It does not sync between devices.</p><div class="progress-stats"><article><strong>${state.completed.length}</strong><span>Lessons complete</span></article><article><strong>${state.xp}</strong><span>XP earned</span></article><article><strong>${state.attempts.length}</strong><span>Quiz attempts</span></article></div><h3>Quiz history</h3>`;
    if (!state.attempts.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Your quiz attempts will appear here.';
      wrap.append(empty);
    } else {
      const list = document.createElement('ol');
      [...state.attempts].reverse().slice(0, 10).forEach(item => {
        const entry = document.createElement('li');
        entry.textContent = `${item.score}/3 correct · ${new Date(item.date).toLocaleString()}`;
        list.append(entry);
      });
      wrap.append(list);
    }
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'outline';
    reset.textContent = 'Clear local progress';
    reset.addEventListener('click', () => {
      if (!window.confirm('Clear this browser’s saved lessons, XP and quiz history?')) return;
      state = { completed: [], attempts: [], xp: 0 };
      saveState();
      refreshProgress();
    });
    wrap.append(reset);
    profile.append(wrap);
  }

  function installLocalQuiz() {
    const card = $('.quiz-card');
    if (!card || $('#localQuizForm')) return;
    const old = $('.quiz-submit', card);
    old?.remove();
    const form = document.createElement('form');
    form.id = 'localQuizForm';
    form.innerHTML = '<label>1. Main HTML heading element<input required name="a0" placeholder="Type your answer"></label><label>2. PHP function that securely hashes a password<input required name="a1" placeholder="Type your answer"></label><label>3. Git action that records a snapshot<input required name="a2" placeholder="Type your answer"></label><button class="primary quiz-submit" type="submit">Check my answers <span>→</span></button><div id="localQuizResult" role="status" aria-live="polite"></div>';
    card.insertBefore(form, $('small', card));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const answers = new FormData(form);
      const normalized = [answers.get('a0'), answers.get('a1'), answers.get('a2')].map(value => String(value).trim().toLowerCase().replace(/[\s_-]/g, ''));
      const checks = [normalized[0] === 'h1' || normalized[0] === 'heading', normalized[1] === 'passwordhash', normalized[2] === 'commit'];
      const score = checks.filter(Boolean).length;
      const earned = score * 10;
      state.attempts.push({ score, date: new Date().toISOString() });
      state.xp += earned;
      saveState();
      $('#localQuizResult', form).textContent = `You got ${score} of 3 correct and earned ${earned} XP. Answers: h1, password_hash, commit.`;
      refreshProgress();
    });
  }

  function makeLocalCallsUsable() {
    document.querySelectorAll('[data-modal]').forEach(control => {
      if (control.closest('.hero-buttons') || control.closest('.bottom-cta')) {
        const link = document.createElement('a');
        link.className = control.className;
        link.href = '#path';
        link.textContent = control.closest('.hero-buttons') ? 'Start learning' : 'Back to my roadmap';
        control.replaceWith(link);
      } else {
        control.hidden = true;
      }
    });
    const modal = $('#modal');
    if (modal) modal.hidden = true;
    const authForm = $('#authForm');
    if (authForm) authForm.remove();
  }

  function clarifyLocalStorageCopy() {
    const tamil = document.documentElement.lang === 'ta';
    const copy = tamil ? {
      featuresIntro: 'பாடங்கள், பயிற்சிகள், விரைவான அறிவுச் சோதனைகள் மூலம் உங்கள் வேகத்தில் கற்றுக்கொள்ளுங்கள். முன்னேற்றம் இந்த உலாவியில் சேமிக்கப்படும்.',
      featureProgressText: 'நிறைவு செய்த பாடங்கள், XP, வினாடி வினா முயற்சிகள் இந்த உலாவியில் சேமிக்கப்படும்.',
      progressGuestTitle: 'இந்தச் சாதனத்தில் முன்னேற்றம்',
      progressGuestText: 'நிறைவு செய்த பாடங்கள், XP, வினாடி வினா முயற்சிகள் இந்த உலாவியில் மட்டும் சேமிக்கப்படும்.',
      footerAccount: 'இந்தச் சாதனத்தில்',
      journeyAccount: 'கற்றலைத் தொடங்கு'
    } : {
      featuresIntro: 'Learn at your own pace with lessons, exercises, and quick knowledge checks. Progress stays in this browser.',
      featureProgressText: 'Completed lessons, XP and quiz attempts are saved in this browser.',
      progressGuestTitle: 'Progress on this device',
      progressGuestText: 'Completed lessons, XP and quiz attempts are saved in this browser only.',
      footerAccount: 'On this device',
      journeyAccount: 'Start learning'
    };
    Object.entries(copy).forEach(([key, value]) => {
      document.querySelectorAll(`[data-copy="${key}"]`).forEach(element => { element.textContent = value; });
    });
  }

  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.id !== 'lessonComplete') return;
    event.preventDefault();
    const lessonId = $('#lessonId')?.value;
    if (!lessonId) return;
    if (!state.completed.includes(lessonId)) {
      state.completed.push(lessonId);
      state.xp += 25;
      saveState();
    }
    refreshProgress();
    const button = $('button', form);
    if (button) button.textContent = 'Lesson complete ✓';
  }, true);

  makeLocalCallsUsable();
  installLocalQuiz();
  refreshProgress();
  setTimeout(() => {
    clarifyLocalStorageCopy();
    $('#langToggle')?.addEventListener('click', () => setTimeout(clarifyLocalStorageCopy, 0));
  }, 0);
})();
