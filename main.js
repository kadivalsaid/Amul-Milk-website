// Amul Kool Laptop Full Screen Frame Animation Engine (238 Frames)

const TOTAL_FRAMES = 238;
const images = [];
let loadedCount = 0;

let currentFrameIndex = 0;
let targetFrameIndex = 0;

// DOM Elements
const canvas = document.getElementById('frame-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const progressStatus = document.getElementById('progress-status');

const scrubProgressBar = document.getElementById('scrub-progress-bar');
const frameDisplayNumber = document.getElementById('frame-display-number');

// Preload all 238 images from frames/ directory
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const frameNum = String(i).padStart(3, '0');
    
    img.src = `frames/ezgif-frame-${frameNum}.jpg`;

    img.onload = () => {
      onImageLoad();
    };

    img.onerror = () => {
      // Secondary fallback attempt if path requires relative adjustment
      const fallbackImg = new Image();
      fallbackImg.src = `./frames/ezgif-frame-${frameNum}.jpg`;
      fallbackImg.onload = () => {
        images[i - 1] = fallbackImg;
        onImageLoad();
      };
      fallbackImg.onerror = () => {
        onImageLoad();
      };
    };

    images[i - 1] = img;
  }
}

function onImageLoad() {
  loadedCount++;
  const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
  if (progressStatus) progressStatus.textContent = `${loadedCount} / ${TOTAL_FRAMES} frames`;

  if (loadedCount >= TOTAL_FRAMES) {
    initEngine();
  }
}

// Initialize Engine
function initEngine() {
  if (preloader) {
    preloader.classList.add('hidden');
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial scroll calculation & render
  onScroll();
  renderCanvas();

  // Start smooth scroll-sync animation loop
  requestAnimationFrame(animationLoop);
}

// Resize Canvas for DPR & Laptop Fullscreen Bounds
function resizeCanvas() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  renderCanvas();
}

// Scroll Event Handler - Maps page scroll progress directly to frame index & handles text fade
function onScroll() {
  const track = document.getElementById('hero-scroll-track');
  if (!track) return;

  const rect = track.getBoundingClientRect();
  const trackHeight = rect.height - window.innerHeight;

  if (trackHeight <= 0) return;

  // Calculate scroll progress (0.0 at top to 1.0 at bottom of scroll track)
  const scrollProgress = Math.min(1, Math.max(0, -rect.top / trackHeight));

  // Map scroll progress directly to target frame index (0 to 237)
  targetFrameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(scrollProgress * (TOTAL_FRAMES - 1))));

  // Fade out hero text overlay when scrolling from 0% to 30%
  const heroTextOverlay = document.getElementById('hero-text-overlay');
  if (heroTextOverlay) {
    const fadeRatio = Math.min(1, scrollProgress / 0.30); // Reach full fade at 30% scroll progress
    const opacity = Math.max(0, 1 - fadeRatio);
    heroTextOverlay.style.opacity = opacity.toFixed(3);
    heroTextOverlay.style.transform = `translateY(${-fadeRatio * 35}px)`;
  }
}

// Smooth Lerp Loop (Scrubs frames smoothly on scroll)
function animationLoop() {
  const lerpFactor = 0.2; // Fast & smooth response to scroll
  const diff = targetFrameIndex - currentFrameIndex;

  if (Math.abs(diff) > 0.01) {
    currentFrameIndex += diff * lerpFactor;
    renderCanvas();
  } else if (Math.round(currentFrameIndex) !== Math.round(targetFrameIndex)) {
    currentFrameIndex = targetFrameIndex;
    renderCanvas();
  }

  // Update UI indicators
  const displayIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrameIndex)));
  if (scrubProgressBar) {
    scrubProgressBar.style.width = `${((displayIndex / (TOTAL_FRAMES - 1)) * 100).toFixed(1)}%`;
  }
  if (frameDisplayNumber) {
    frameDisplayNumber.textContent = `${displayIndex + 1} / ${TOTAL_FRAMES}`;
  }

  requestAnimationFrame(animationLoop);
}

// Full Screen Laptop Canvas Render (Fills the laptop screen completely)
function renderCanvas() {
  if (!ctx || !canvas) return;

  const imgIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentFrameIndex)));
  const img = images[imgIndex];

  if (!img || !img.complete || img.naturalWidth === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let renderWidth, renderHeight, x, y;

  // COVER MODE: Fills 100% of laptop screen width & height
  if (canvasRatio > imgRatio) {
    renderWidth = canvasWidth;
    renderHeight = canvasWidth / imgRatio;
  } else {
    renderHeight = canvasHeight;
    renderWidth = canvasHeight * imgRatio;
  }

  x = (canvasWidth - renderWidth) / 2;
  y = (canvasHeight - renderHeight) / 2;

  ctx.drawImage(img, x, y, renderWidth, renderHeight);
}

// Start preloading frames immediately
preloadFrames();
