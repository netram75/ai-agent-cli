// Hamburger
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger) hamburger.addEventListener('click', () => nav.classList.toggle('open'));

// Hero ticker slides
const tickerMessages = [
  'THE MARKET HAS ALREADY CHANGED',
  'AI IS RESHAPING EVERY INDUSTRY',
  'YOUR CAREER NEEDS FUTURE-PROOF SKILLS',
  'JOIN 50,000+ PLACED ALUMNI',
];
let tickerIndex = 0;
const tickerLabel = document.getElementById('tickerLabel');

function setTicker(idx) {
  tickerIndex = (idx + tickerMessages.length) % tickerMessages.length;
  if (tickerLabel) {
    tickerLabel.style.opacity = '0';
    setTimeout(() => {
      tickerLabel.textContent = tickerMessages[tickerIndex];
      tickerLabel.style.opacity = '1';
    }, 200);
  }
}

document.getElementById('prevSlide')?.addEventListener('click', () => setTicker(tickerIndex - 1));
document.getElementById('nextSlide')?.addEventListener('click', () => setTicker(tickerIndex + 1));
setInterval(() => setTicker(tickerIndex + 1), 3500);

// Stat counter animation
function animateCounter(el) {
  const raw = el.dataset.target;
  if (!raw) return;
  const target = parseFloat(raw);
  const duration = 2000;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { current = target; clearInterval(timer); }
    if (target >= 10000) {
      el.textContent = Math.floor(current / 1000) + 'K+';
    } else {
      el.textContent = Math.floor(current) + '+';
    }
  }, duration / steps);
}

// IntersectionObserver — cards & fade-ins
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in, .prog-card').forEach(el => io.observe(el));

// Stats observer
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  const statsIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-item__num[data-target]').forEach(animateCounter);
        statsIO.disconnect();
      }
    });
  }, { threshold: 0.4 });
  statsIO.observe(statsBar);
}

// Header shadow on scroll
window.addEventListener('scroll', () => {
  const h = document.querySelector('.header');
  if (h) h.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.1)' : '';
});
