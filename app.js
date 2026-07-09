/* =========================================
   Anniversary Surprise Website — App Logic
   ========================================= */

// --- Memory Photo List ---
const MEMORY_PHOTOS = [
  '20250705.jpg',
  '20250710.JPG',
  '20250810.jpg',
  '20250910.jpg',
  '20251010.jpg',
  '20251110.jpg',
  '20251210.jpg',
  '20260110.jpg',
  '20260210.jpg',
  '20260310.jpg',
  '20260411.jpg',
  '20260510.jpg',
  '20260610.png'
];

// --- Quiz → Next Page Mapping ---
const QUIZ_NEXT_PAGE = {
  'quiz-place': 'page-photo-zoo',
  'quiz-ask-place': 'page-memory-firstdate',
  'quiz-flower': 'page-photo-tulip'
};

// --- Date Answers ---
const DATE_ANSWERS = ['10072025', '10072568'];

// =============================================
// Page Navigation
// =============================================
function navigateTo(pageId) {
  // Force attempt playing music as page transition is triggered by user interaction
  playMusic();

  const currentPage = document.querySelector('.page.active');
  const nextPage = document.getElementById(pageId);

  if (!nextPage) return;

  if (currentPage) {
    currentPage.classList.add('exit');
    currentPage.addEventListener('animationend', function handler() {
      currentPage.classList.remove('active', 'exit');
      nextPage.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
      currentPage.removeEventListener('animationend', handler);

      // Initialize gallery if navigating to gallery page
      if (pageId === 'page-gallery') {
        renderGallery();
      }
    });
  } else {
    nextPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

// =============================================
// Date Question (Page 2)
// =============================================
function checkDateAnswer() {
  // Force play music on quiz submit
  playMusic();

  const input = document.getElementById('date-answer');
  const answer = input.value.trim();

  if (DATE_ANSWERS.includes(answer)) {
    navigateTo('page-photo-before');
  } else {
    showWrongModal();
  }
}

// Allow pressing Enter to submit date answer (setup in init)

// =============================================
// Quiz Handler (Pages 4, 5, 7)
// =============================================
function checkQuiz(btnElement, quizId, isCorrect) {
  // Force play music on option selection
  playMusic();

  const choices = document.querySelectorAll(`#${quizId} .choice-btn`);

  if (isCorrect) {
    // Disable all choices
    choices.forEach(btn => btn.classList.add('disabled'));

    // Mark correct answer
    btnElement.classList.add('correct');

    // Navigate to next page after brief delay
    const nextPage = QUIZ_NEXT_PAGE[quizId];
    if (nextPage) {
      setTimeout(() => {
        navigateTo(nextPage);

        // Reset quiz state after navigating away
        setTimeout(() => {
          choices.forEach(btn => {
            btn.classList.remove('disabled', 'correct');
          });
        }, 600);
      }, 800);
    }
  } else {
    showWrongModal();
  }
}

// =============================================
// Wrong Answer Modal
// =============================================
function showWrongModal() {
  const modal = document.getElementById('wrong-modal');
  modal.classList.add('active');

  // Re-trigger emoji animation
  const emoji = modal.querySelector('.modal-emoji');
  emoji.style.animation = 'none';
  emoji.offsetHeight; // Force reflow
  emoji.style.animation = '';
}

function closeModal() {
  const modal = document.getElementById('wrong-modal');
  modal.classList.remove('active');
}

// Close modal by clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('wrong-modal');
  if (e.target === modal) {
    closeModal();
  }
});

// =============================================
// Gallery Rendering (Page 9)
// =============================================
function parseDateFromFilename(filename) {
  const name = filename.split('.')[0];
  const year = name.substring(0, 4);
  const month = name.substring(4, 6);
  const day = name.substring(6, 8);
  return `${day}/${month}/${year}`;
}

function renderGallery() {
  const container = document.getElementById('gallery-container');

  // Don't re-render if already populated
  if (container.children.length > 0) {
    // Still trigger visibility animations
    requestAnimationFrame(() => observeGalleryItems());
    return;
  }

  const fragment = document.createDocumentFragment();

  MEMORY_PHOTOS.forEach((photo) => {
    const dateStr = parseDateFromFilename(photo);

    const item = document.createElement('div');
    item.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = `memory/${photo}`;
    img.alt = `ความทรงจำ ${dateStr}`;
    img.loading = 'lazy';

    const dateDiv = document.createElement('div');
    dateDiv.className = 'gallery-item-date';
    dateDiv.textContent = dateStr;

    item.appendChild(img);
    item.appendChild(dateDiv);
    fragment.appendChild(item);
  });

  container.appendChild(fragment);

  // Observe items for scroll-reveal animation
  requestAnimationFrame(() => observeGalleryItems());
}

function observeGalleryItems() {
  const items = document.querySelectorAll('.gallery-item');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animation
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px 50px 0px'
    });

    items.forEach(item => observer.observe(item));
  } else {
    // Fallback: just show all items
    items.forEach(item => item.classList.add('visible'));
  }
}

// =============================================
// Floating Hearts Background
// =============================================
function createFloatingHearts() {
  const container = document.getElementById('floatingHearts');
  const hearts = ['💗', '💕', '💖', '💘', '🩷', '♡', '❤️'];
  const count = 15;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
    heart.style.setProperty('--duration', `${8 + Math.random() * 12}s`);
    heart.style.setProperty('--delay', `${Math.random() * 10}s`);
    container.appendChild(heart);
  }
}

// =============================================
// Background Music Control
// =============================================
let audioContextUnlocked = false;

function toggleMusic() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  
  if (music.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
}

function playMusic() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  music.play().then(() => {
    btn.classList.add('playing');
    btn.textContent = '🎵';
  }).catch((err) => {
    console.log("Audio play blocked by browser policy. Waiting for user interaction.");
  });
}

function pauseMusic() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  music.pause();
  btn.classList.remove('playing');
  btn.textContent = '🔇';
}

// Flag to prevent unlockAudio from playing music during intro
let introInProgress = true;

// Unlock audio on first user interaction
function unlockAudio() {
  if (introInProgress) return; // Don't auto-play music during intro
  const music = document.getElementById('bg-music');
  if (music && music.paused) {
    music.play().then(() => {
      const btn = document.getElementById('music-toggle');
      if (btn) {
        btn.classList.add('playing');
        btn.textContent = '🎵';
        btn.style.display = '';
      }
      removeUnlockListeners();
    }).catch((err) => {
      console.log("Waiting for a stronger user gesture to play audio...");
    });
  } else {
    removeUnlockListeners();
  }
}

function removeUnlockListeners() {
  ['click', 'touchend', 'touchstart', 'keydown', 'pointerdown', 'mousedown'].forEach(evt => {
    window.removeEventListener(evt, unlockAudio, { capture: true });
  });
}

// Preload all remaining memory gallery images in the background
function preloadRemainingImages() {
  // We already preloaded 20250705.jpg via HTML head
  const remaining = MEMORY_PHOTOS.filter(p => p !== '20250705.jpg');
  
  // Use a slight delay to allow critical resources to load first
  setTimeout(() => {
    remaining.forEach(photo => {
      const img = new Image();
      img.src = `memory/${photo}`;
    });
  }, 1500);
}

// =============================================
// Video Control
// =============================================
function playAnsVideo() {
  const vid = document.getElementById('ans-video');
  if (vid) {
    vid.currentTime = 0;
    vid.play().catch(e => console.log('Video autoplay blocked:', e));
    
    // Auto navigate to final page when video ends
    vid.onended = () => {
      navigateTo('page-final');
    };
  }
}

function startIntro() {
  const landing = document.getElementById('page-landing');
  if (landing && landing.classList.contains('intro-waiting')) {
    landing.classList.remove('intro-waiting');
    landing.classList.add('intro-animating');
    
    // Try to ensure heartbeat plays in case it was blocked on load
    playHeartbeat();
    
    // Unlock bg-music on iOS by playing silently during user gesture
    const music = document.getElementById('bg-music');
    if (music) {
      music.volume = 0;
      music.play().catch(() => {});
    }
    
    // Wait ~4.6 seconds (5 beats), then stop heartbeat
    setTimeout(() => {
      const hb = document.getElementById('heartbeat-sound');
      if (hb) hb.pause();
    }, 4600);
    
    // Unmute music after the greeting text "สวัสดีครับพี่นิ้ง" finishes fading in
    setTimeout(() => {
      introInProgress = false;
      if (music) {
        music.volume = 1;
        music.currentTime = 0;
      }
      const btn = document.getElementById('music-toggle');
      if (btn) {
        btn.style.display = '';
        btn.classList.add('playing');
        btn.textContent = '🎵';
      }
      removeUnlockListeners();
    }, 5600);
    
    setTimeout(() => {
      landing.classList.remove('intro-animating');
    }, 6000);
  }
}

function playHeartbeat() {
  const hb = document.getElementById('heartbeat-sound');
  if (hb) {
    hb.playbackRate = 2.05;
    hb.play().catch(e => console.log('Heartbeat autoplay blocked'));
  }
}

document.addEventListener('DOMContentLoaded', function() {
  createFloatingHearts();

  // Allow pressing Enter to submit date answer
  const dateInput = document.getElementById('date-answer');
  if (dateInput) {
    dateInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkDateAnswer();
      }
    });
  }

  // Attempt to play heartbeat immediately (may be blocked by browser)
  playHeartbeat();

  // Preload gallery images in the background
  preloadRemainingImages();

  // Setup fallback auto-play trigger on first interaction (in case blocked)
  ['click', 'touchend', 'touchstart', 'keydown', 'pointerdown', 'mousedown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { capture: true, passive: true });
  });
});
