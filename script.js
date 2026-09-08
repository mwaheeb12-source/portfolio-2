// =====================================================================
// UTIL
// =====================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// =====================================================================
// HAMBURGER / MOBILE MENU
// =====================================================================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    // Prevent body scroll when menu open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// =====================================================================
// CURSOR LOGIC (Default Glow + Lusion Interactive Purple Cursor)
// =====================================================================
const glow = $('#cursorGlow');
const lusionCursor = $('#lusionCursor');
const profileImageWrapper = $('#profileImageWrapper');

if (window.matchMedia('(pointer: fine)').matches) {
  // Global subtle glow
  if (glow) {
    window.addEventListener('mousemove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
  }


}

// =====================================================================
// HERO & NAV LOGIC
// =====================================================================
const heroContent = $('#heroContent');
const profileBgText = $('#profileBgText');

// Typewriter logic
const typewriterPhrases = [
  "WE ARE BUILDING IMMERSIVE DIGITAL EXPERIENCE",
  "ENGINEERING NEXT-GEN VOICE APPLICATIONS",
  "SCALING HIGH-PERFORMANCE 3D WEB",
  "MERGING BACKEND TELEPHONY WITH WEBGL"
];
let currentPhraseIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
const typewriterElement = document.getElementById('typewriterText');

function typeWriter() {
  if (!typewriterElement) return;
  
  const currentPhrase = typewriterPhrases[currentPhraseIndex];
  const words = currentPhrase.split(' ');
  const numWords = words.length;
  
  // Split phrase: base part (everything except last 2 words) and highlight part (last 2 words)
  const basePart = words.slice(0, numWords - 2).join(' ') + ' ';
  const highlightPart = words.slice(numWords - 2).join(' ');
  
  let typeSpeed = 100; // Normal typing speed
  
  if (isDeleting) {
    currentCharIndex--;
    typeSpeed = 40; // Delete faster
  } else {
    currentCharIndex++;
  }
  
  const currentTyped = currentPhrase.substring(0, currentCharIndex);
  
  // Render text with highlight span for the last 2 words
  if (currentCharIndex <= basePart.length) {
    typewriterElement.innerHTML = `<span>${currentTyped}</span><span class="text-grad"></span>`;
  } else {
    const typedHighlight = currentPhrase.substring(basePart.length, currentCharIndex);
    typewriterElement.innerHTML = `<span>${basePart}</span><span class="text-grad">${typedHighlight}</span>`;
  }
  
  if (!isDeleting && currentCharIndex === currentPhrase.length) {
    isDeleting = true;
    typeSpeed = 3000; // Pause at end of phrase
  } else if (isDeleting && currentCharIndex === 0) {
    isDeleting = false;
    currentPhraseIndex = (currentPhraseIndex + 1) % typewriterPhrases.length;
    typeSpeed = 500; // Pause before typing next phrase
  }
  
  setTimeout(typeWriter, typeSpeed);
}

typeWriter();

// Nav Scroll Spy
const sections = document.querySelectorAll('header[id], section[id]');
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(sec => sectionObserver.observe(sec));

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Slight parallax for the massive "PROFILE" background text
  if (profileBgText) {
    profileBgText.style.transform = `translateY(${scrollY * 0.1}px)`;
  }
}, { passive: true });

// =====================================================================
// STATIC HONEYCOMB GRID WITH LIGHT RIPPLES
// =====================================================================
const canvas = $('#particles');
const ctx = canvas.getContext('2d');
let width, height;

// Honeycomb Constants
const HEX_RADIUS = 45;
const HEX_WIDTH = 2 * HEX_RADIUS;
const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;

let mouseX = -1000;
let mouseY = -1000;

let gridPath = new Path2D();
let ripples = [];
let lastRippleTime = 0;

function buildGrid() {
  gridPath = new Path2D();

  // Static grid covering the viewport (with a little padding)
  const cols = Math.ceil(width / (HEX_WIDTH * 0.75)) + 2;
  const rows = Math.ceil(height / HEX_HEIGHT) + 2;

  for (let q = -1; q < cols; q++) {
    for (let r = -1; r < rows; r++) {
      let x = q * HEX_WIDTH * 0.75;
      let y = r * HEX_HEIGHT;

      // Offset odd columns down by half a height to lock them into place
      if (q % 2 !== 0) {
        y += HEX_HEIGHT / 2;
      }

      // Draw flat-topped hexagon
      gridPath.moveTo(x + HEX_RADIUS, y);
      for (let i = 1; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i);
        gridPath.lineTo(x + HEX_RADIUS * Math.cos(angle), y + HEX_RADIUS * Math.sin(angle));
      }
      gridPath.closePath();
    }
  }
}

let cachedBgColor = '#0c0c0e';
let canvasNeedsUpdate = true;
let isAnimatingGrid = false;

function updateCachedBg() {
  setTimeout(() => {
    cachedBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#0c0c0e';
    canvasNeedsUpdate = true;
    triggerCanvasUpdate();
  }, 100);
}

// Initial cache update on DOMContentLoaded
document.addEventListener('DOMContentLoaded', updateCachedBg);

function triggerCanvasUpdate() {
  if (!isAnimatingGrid && !prefersReducedMotion) {
    isAnimatingGrid = true;
    requestAnimationFrame(animationLoop);
  }
}

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  buildGrid();
  canvasNeedsUpdate = true;
  triggerCanvasUpdate();
}

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  canvasNeedsUpdate = true;
  triggerCanvasUpdate();

  // Spawn a ripple only if there are no active ripples (wait for the first one to finish)
  if (ripples.length === 0) {
    ripples.push({
      x: mouseX,
      y: mouseY,
      radius: 0,
      maxRadius: 150 + Math.random() * 100, // Reduced travel distance
      speed: 6 + Math.random() * 2,         // Expansion speed
      alpha: 1                              // Initial opacity
    });
  }
});

window.addEventListener('mouseleave', () => {
  mouseX = -1000;
  mouseY = -1000;
  canvasNeedsUpdate = true;
  triggerCanvasUpdate();
});

let isWorkSectionLit = false;
let workSectionGlowRadius = 0;

// Observer to detect when the #work section is in view
document.addEventListener('DOMContentLoaded', () => {
  const workSection = document.getElementById('work');
  if (workSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isWorkSectionLit = entry.isIntersecting;
        canvasNeedsUpdate = true;
        triggerCanvasUpdate();
      });
    }, { threshold: 0.1 }); // Trigger when 10% of the section is visible
    observer.observe(workSection);
  }
});

function drawGrid() {
  // Dynamic background using pre-cached theme variable to avoid layout thrashing
  ctx.fillStyle = cachedBgColor;
  ctx.fillRect(0, 0, width, height);

  // Draw faint static background grid
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)'; // Very faint purple
  ctx.stroke(gridPath);

  // Handle work section global lit effect
  const targetGlowRadius = isWorkSectionLit ? Math.max(width, height) * 1.5 : 0;
  const easeFactor = isWorkSectionLit ? 0.01 : 0.06; // Slower start, much faster end
  workSectionGlowRadius += (targetGlowRadius - workSectionGlowRadius) * easeFactor;

  if (workSectionGlowRadius > 1) {
    const centerX = width / 2;
    const centerY = height / 2;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, workSectionGlowRadius);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)'); // Stronger inner glow for lines
    gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)'); 
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    ctx.save();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2; // Thicker lines for the full glow effect
    ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
    ctx.shadowBlur = 10;
    ctx.stroke(gridPath);
    ctx.restore();
  }

  // Draw a subtle glow exactly at the mouse pointer
  if (mouseX > 0 && mouseY > 0) {
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 100);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.stroke(gridPath);
  }

  // Update and draw expanding light ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];

    // Update ripple
    r.radius += r.speed;
    r.alpha = 1 - (r.radius / r.maxRadius);

    if (r.alpha <= 0) {
      ripples.splice(i, 1);
      continue;
    }

    // Draw expanding light ring by mapping a radial gradient to the grid strokes
    const innerRadius = Math.max(0, r.radius - 10); // Ring thickness
    const outerRadius = r.radius + 10;

    if (outerRadius > 0) {
      const ringGrad = ctx.createRadialGradient(r.x, r.y, innerRadius, r.x, r.y, outerRadius);
      ringGrad.addColorStop(0, `rgba(139, 92, 246, 0)`);
      // Peak brightness near the outer edge
      ringGrad.addColorStop(0.8, `rgba(139, 92, 246, ${r.alpha})`);
      ringGrad.addColorStop(1, `rgba(139, 92, 246, 0)`);

      ctx.save();
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
      ctx.shadowBlur = 10 * r.alpha;
      ctx.strokeStyle = ringGrad;
      ctx.stroke(gridPath);
      ctx.restore();
    }
  }
}

function animationLoop() {
  drawGrid();
  
  // Decide whether to pause the loop to conserve energy
  const hasRipples = ripples.length > 0;
  const targetGlowRadius = isWorkSectionLit ? Math.max(width, height) * 1.5 : 0;
  const isGlowAnimating = Math.abs(targetGlowRadius - workSectionGlowRadius) > 0.5;
  
  if (hasRipples || isGlowAnimating || canvasNeedsUpdate) {
    canvasNeedsUpdate = false;
    requestAnimationFrame(animationLoop);
  } else {
    isAnimatingGrid = false;
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// =====================================================================
// STAT COUNTERS, BAR FILLS, MAGNETIC BUTTONS
// =====================================================================
if (window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
  const magnetics = $$('.magnetic');
  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      btn.style.transition = 'none';
      btn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      btn.style.transform = `translate(0px, 0px) scale(1)`;
    });
  });
}

const statEls = $$('.stat__num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statEls.forEach(el => statObserver.observe(el));

const bars = $$('.bar__fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.fill + '%';
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
bars.forEach(bar => barObserver.observe(bar));

// =====================================================================
// SCROLL REVEAL (BLUR FOCUS)
// =====================================================================
const revealEls = $$('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = prefersReducedMotion ? '0ms' : `${(i % 4) * 80}ms`;
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));


// =====================================================================
// MAGNETIC BUTTONS
// =====================================================================
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = `translate(0px, 0px)`;
  });
});

// =====================================================================
// SPLIT TEXT REVEAL (Awwwards Style)
// =====================================================================
function splitTextNode(node) {
  if (node.nodeType === 3) { // TEXT_NODE
    const text = node.nodeValue;
    if (text.trim() === '') return;
    
    const frag = document.createDocumentFragment();
    const words = text.split(/(\s+)/);
    
    words.forEach(word => {
      if (word.trim() === '') {
        frag.appendChild(document.createTextNode(word));
      } else {
        const wordMask = document.createElement('span');
        wordMask.className = 'word-mask';
        wordMask.style.display = 'inline-block';
        wordMask.style.overflow = 'hidden';
        
        const wordReveal = document.createElement('span');
        wordReveal.className = 'word-reveal';
        wordReveal.style.display = 'inline-block';
        wordReveal.style.transform = 'translateY(110%)';
        wordReveal.style.opacity = '0';
        // Buttery smooth cubic-bezier easing
        wordReveal.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease';
        wordReveal.textContent = word;
        
        wordMask.appendChild(wordReveal);
        frag.appendChild(wordMask);
      }
    });
    node.parentNode.replaceChild(frag, node);
  } else if (node.nodeType === 1 && !node.classList.contains('word-mask') && !node.classList.contains('word-reveal')) {
    Array.from(node.childNodes).forEach(child => splitTextNode(child));
  }
}

const splitObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const words = entry.target.querySelectorAll('.word-reveal');
      words.forEach((word, index) => {
        word.style.transitionDelay = `${index * 30}ms`;
        // Force reflow so the browser applies the initial translateY(110%) before we set it to 0%
        void word.offsetHeight;
        
        word.style.transform = 'translateY(0%)';
        word.style.opacity = '1';
      });
      splitObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.split-text-reveal').forEach(el => {
  splitTextNode(el);
  splitObserver.observe(el);
});
// =====================================================================
// CINEMATIC SECTION HEADING TEXT REVEALS & INTERACTIVE HOVERS
// =====================================================================
const headingSelectors = [
  { selector: '.smoky-heading', charClass: 'smoky-char' },
  { selector: '.flicker-heading', charClass: 'flicker-char' },
  { selector: '.elastic-heading', charClass: 'elastic-char' },
  { selector: '.glitch-heading', charClass: 'glitch-char' },
  { selector: '.lift-heading', charClass: 'lift-char' },
  { selector: '.spotlight-heading', charClass: 'spotlight-char' }
];

function splitIntoCustomCharacters(node, charClass) {
  if (node.nodeType === 3) { // TEXT_NODE
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        frag.appendChild(document.createTextNode(' '));
      } else {
        const span = document.createElement('span');
        span.className = charClass;
        span.textContent = char;
        frag.appendChild(span);
      }
    }
    node.parentNode.replaceChild(frag, node);
  } else if (node.nodeType === 1 && !node.classList.contains(charClass)) {
    Array.from(node.childNodes).forEach(child => splitIntoCustomCharacters(child, charClass));
  }
}

function splitIntoWords(node) {
  if (node.nodeType === 3) {
    const text = node.nodeValue;
    if (text.trim() === '') return;
    const words = text.split(/\s+/);
    const frag = document.createDocumentFragment();
    words.forEach((word, index) => {
      if (word) {
        const span = document.createElement('span');
        span.className = 'smoky-word';
        span.textContent = word;
        frag.appendChild(span);
        if (index < words.length - 1) {
          frag.appendChild(document.createTextNode(' '));
        }
      }
    });
    node.parentNode.replaceChild(frag, node);
  } else if (node.nodeType === 1 && !node.classList.contains('smoky-word')) {
    Array.from(node.childNodes).forEach(child => splitIntoWords(child));
  }
}

const smokyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      
      // Determine what heading class we have and reveal characters
      headingSelectors.forEach(item => {
        if (target.matches(item.selector)) {
          const chars = target.querySelectorAll('.' + item.charClass);
          chars.forEach((char, index) => {
            char.style.transitionDelay = `${index * 20}ms`;
            char.classList.add('reveal-active');
          });
        }
      });
      
      if (target.classList.contains('smoky-desc')) {
        const words = target.querySelectorAll('.smoky-word');
        words.forEach((word, index) => {
          word.style.transitionDelay = `${index * 30}ms`;
          word.classList.add('reveal-active');
        });
      }
      smokyObserver.unobserve(target);
    }
  });
}, { threshold: 0.1 });

// Initialize and observe
headingSelectors.forEach(item => {
  document.querySelectorAll(item.selector).forEach(el => {
    splitIntoCustomCharacters(el, item.charClass);
    smokyObserver.observe(el);
  });
});

document.querySelectorAll('.smoky-desc').forEach(el => {
  splitIntoWords(el);
  smokyObserver.observe(el);
});

// =====================================================================
// STATEMENT COLOR SCROLL REVEAL
// =====================================================================
const statementSection = $('#statement');

if (statementSection) {
  let statementWordsCache = [];
  
  // Cache the words after splitting is completed to avoid DOM lookups on scroll
  setTimeout(() => {
    statementWordsCache = Array.from(document.querySelectorAll('#statementText .word-reveal')).map(word => ({
      element: word,
      isGrad: word.closest('.text-grad') !== null
    }));
  }, 250);

  window.addEventListener('scroll', () => {
    if (statementWordsCache.length === 0) return;
    
    const rect = statementSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const start = windowHeight;
    const end = windowHeight * 0.2;

    if (rect.top <= start && rect.bottom >= 0) {
      const totalDist = start - end;
      const currentDist = start - rect.top;
      const progress = Math.min(Math.max(currentDist / totalDist, 0), 1);
      const activeIndex = Math.floor(progress * statementWordsCache.length);

      statementWordsCache.forEach((item, index) => {
        const word = item.element;
        if (index <= activeIndex) {
          word.style.color = item.isGrad ? 'var(--purple)' : 'var(--text)';
          word.style.opacity = '1';
          word.style.textShadow = '0 0 1px rgba(0,0,0,0.1)';
        } else {
          word.style.color = item.isGrad ? 'var(--purple)' : 'var(--text)';
          word.style.opacity = '0.15';
          word.style.textShadow = 'none';
        }
      });
    }
  }, { passive: true });
}

// =====================================================================
// PROJECT FILTERS
// =====================================================================
const filterBtns = $$('.filter');
const projectCards = $$('.project');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hidden-item', !show);
    });
  });
});

// =====================================================================
// PROJECT CARD SPOTLIGHT & PARALLAX
// =====================================================================
const projects = document.querySelectorAll('.project');

// Spotlight Hover Effect (Originkit Style)
projects.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
      
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
      
    // 3D Tilt & Glare
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
      
    const tiltX = ((y - centerY) / centerY) * -8; // Max 8 deg
    const tiltY = ((x - centerX) / centerX) * 8;
      
    card.style.setProperty('--tilt-x', `${tiltX}deg`);
    card.style.setProperty('--tilt-y', `${tiltY}deg`);
      
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
  });
    
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--tilt-x', `0deg`);
    card.style.setProperty('--tilt-y', `0deg`);
    card.style.setProperty('--glare-x', `50%`);
    card.style.setProperty('--glare-y', `50%`);
  });
});



// =====================================================================
// 3D ROBOT IN HERO SECTION
// =====================================================================
function initRobot() {
  const container = document.getElementById('robot-container');
  // Check if Three.js is loaded and container exists
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  
  // Set up camera
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 18; // Pulled back slightly for bigger robot

  // Set up renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group for the entire robot (for floating animation)
  const mainRobotGroup = new THREE.Group();
  scene.add(mainRobotGroup);

  // Group for the body (stays relatively still)
  const bodyGroup = new THREE.Group();
  mainRobotGroup.add(bodyGroup);

  // Group for the head (will rotate to look at cursor)
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.6; // Offset head above body
  mainRobotGroup.add(headGroup);

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xe0e0e0, // Slightly greyish white so it catches shadows and doesn't blow out
    roughness: 0.3, // Soft plastic look
    metalness: 0.2 
  });
  const blueMaterial = new THREE.MeshStandardMaterial({
    color: 0x0055ff, 
    roughness: 0.2,
    metalness: 0.6
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111, 
    roughness: 0.4,
    metalness: 0.3
  });
  const glowMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00d4ff // brighter cyan-blue glow for the cute face
  });

  // --- HEAD PARTS ---
  // To make a "circular square" (rounded rectangle) head, we use a cylinder rotated on Z, then scaled.
  const headGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 32);
  headGeo.rotateZ(Math.PI / 2);
  headGeo.scale(1, 1, 0.9); // squash the depth a bit
  const head = new THREE.Mesh(headGeo, bodyMaterial);
  headGroup.add(head);

  // Screen Face (Rounded screen)
  const screenGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.5, 32);
  screenGeo.rotateZ(Math.PI / 2);
  screenGeo.scale(1, 1, 0.3); // squash it very flat
  const screen = new THREE.Mesh(screenGeo, darkMaterial);
  screen.position.set(0, 0, 0.7);
  headGroup.add(screen);

  // Smiley Face - Cute Eyes
  const eyeGeo = new THREE.SphereGeometry(0.12, 32, 32);
  
  // Left eye
  const leftEye = new THREE.Mesh(eyeGeo, glowMaterial);
  leftEye.scale.set(1, 1.5, 1); // Oval cute eyes
  leftEye.position.set(-0.35, 0.15, 0.82);
  headGroup.add(leftEye);
  
  // Right eye
  const rightEye = leftEye.clone();
  rightEye.position.set(0.35, 0.15, 0.82);
  headGroup.add(rightEye);

  // Smile - Using a Torus for a perfect smooth curve
  // TorusGeometry(radius, tube, radialSegments, tubularSegments, arc)
  const smileGeo = new THREE.TorusGeometry(0.25, 0.04, 16, 32, Math.PI * 0.8);
  const smile = new THREE.Mesh(smileGeo, glowMaterial);
  smile.rotation.z = Math.PI * 1.1; // Rotate to make it a smile (U shape)
  smile.position.set(0, -0.15, 0.82);
  headGroup.add(smile);
  
  // Ear caps (blue)
  const earGeo = new THREE.SphereGeometry(0.4, 32, 32);
  earGeo.scale(0.5, 1, 1); // squash into disks
  const leftEar = new THREE.Mesh(earGeo, blueMaterial);
  leftEar.position.set(-0.95, 0, 0);
  headGroup.add(leftEar);
  
  const rightEar = leftEar.clone();
  rightEar.position.set(0.95, 0, 0);
  headGroup.add(rightEar);

  // --- BODY PARTS ---
  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.6, 16);
  const neck = new THREE.Mesh(neckGeo, darkMaterial);
  neck.position.set(0, 0.6, 0); 
  bodyGroup.add(neck);

  // Torso Main (Capsule like)
  const torsoGeo = new THREE.CylinderGeometry(1.2, 0.9, 2.0, 32);
  const torso = new THREE.Mesh(torsoGeo, bodyMaterial);
  torso.position.set(0, -0.6, 0); // Re-align with arms (-0.2)
  bodyGroup.add(torso);

  // Blue Chest Accent / Core
  const coreGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
  const core = new THREE.Mesh(coreGeo, blueMaterial);
  core.rotation.x = Math.PI / 2;
  core.position.set(0, -0.2, 1.15); // stick out of chest
  bodyGroup.add(core);
  
  // Blue waist accent
  const waistGeo = new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const waist = new THREE.Mesh(waistGeo, blueMaterial);
  waist.rotation.x = Math.PI;
  waist.position.set(0, -1.6, 0);
  waist.scale.set(1.1, 0.5, 1.1); // squash it to look like a belt
  bodyGroup.add(waist);

  // Pelvis
  const pelvisGeo = new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const pelvis = new THREE.Mesh(pelvisGeo, bodyMaterial);
  pelvis.rotation.x = Math.PI;
  pelvis.position.set(0, -1.8, 0);
  pelvis.scale.set(1.1, 1.0, 1.1);
  bodyGroup.add(pelvis);

  // --- ARMS & HANDS ---
  let rightArmGroup;
  let rightLowerArmGroup;

  function createArm(isLeft) {
    const armGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    
    // Shoulder Joint (Blue ball)
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), blueMaterial);
    armGroup.add(shoulder);

    // Upper Arm (White cylinder)
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 16), bodyMaterial);
    upperArm.position.set(0, -0.9, 0);
    armGroup.add(upperArm);

    // --- LOWER ARM GROUP (elbow, forearm, hand) ---
    const lowerArmGroup = new THREE.Group();
    lowerArmGroup.position.set(0, -1.7, 0); // Position at the elbow joint
    armGroup.add(lowerArmGroup);

    // Elbow (Blue ball)
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), blueMaterial);
    lowerArmGroup.add(elbow);

    // Forearm (White boxy)
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.7), bodyMaterial);
    forearm.position.set(0, -0.8, 0); // Relative to elbow
    lowerArmGroup.add(forearm);

    // Hand/Claw (Blue)
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.8), blueMaterial);
    hand.position.set(0, -1.8, 0); // Relative to elbow
    lowerArmGroup.add(hand);

    // Position arm relative to body
    armGroup.position.set(sign * 1.5, -0.2, 0);
    armGroup.rotation.z = sign * Math.PI / 16;
    
    return { armGroup, lowerArmGroup };
  }

  const leftArmData = createArm(true);
  bodyGroup.add(leftArmData.armGroup);
  
  const rightArmData = createArm(false);
  rightArmGroup = rightArmData.armGroup;
  rightLowerArmGroup = rightArmData.lowerArmGroup;
  bodyGroup.add(rightArmGroup);

  // --- LEGS & FEET ---
  function createLeg(isLeft) {
    const legGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // Hip joint (Blue)
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), blueMaterial);
    legGroup.add(hip);

    // Thigh (White)
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 1.6, 16), bodyMaterial);
    thigh.position.set(0, -1.0, 0);
    legGroup.add(thigh);

    // Knee (Blue)
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), blueMaterial);
    knee.position.set(0, -1.9, 0);
    legGroup.add(knee);

    // Shin (White Boxy)
    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.9), bodyMaterial);
    shin.position.set(0, -2.9, 0);
    legGroup.add(shin);

    // Foot (Blue to match hands)
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.8), blueMaterial);
    foot.position.set(0, -4.0, 0.3);
    legGroup.add(foot);

    legGroup.position.set(sign * 0.6, -2.5, 0);
    return legGroup;
  }

  bodyGroup.add(createLeg(true));
  bodyGroup.add(createLeg(false));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0x00aaff, 1.5);
  backLight.position.set(-5, 5, -5);
  scene.add(backLight);

  // Base position and scaling of the whole robot
  mainRobotGroup.scale.set(0.65, 0.65, 0.65);
  mainRobotGroup.position.y = 1.0;

  // Mouse tracking
  let mouse = new THREE.Vector2(0, 0);
  
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Waving Animation State
  let isWaving = false;
  let waveStartTime = 0;
  window.triggerRobotWave = () => {
    isWaving = true;
    waveStartTime = clock.getElapsedTime();
  };

  // Animation Loop
  const clock = new THREE.Clock();
  let currentTarget = new THREE.Vector3(0, 0, 15);
  let isRobotVisible = true;

  if ('IntersectionObserver' in window) {
    const robotObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isRobotVisible = entry.isIntersecting;
      });
    }, { threshold: 0 });
    robotObserver.observe(container);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isRobotVisible) return;
    
    const time = clock.getElapsedTime();

    // Interactive Mouse Repulsion & Floating
    let targetRobotX = 0;
    let targetRobotY = 1.0 + Math.sin(time * 2) * 0.15; // base floating

    // Calculate approximate mouse world position
    const worldMouseX = mouse.x * 12;
    const worldMouseY = mouse.y * 12;

    const dx = mainRobotGroup.position.x - worldMouseX;
    const dy = mainRobotGroup.position.y - worldMouseY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    const repulsionRadius = 4.0; // Radius to start moving away
    if (dist < repulsionRadius && dist > 0.01) {
      const force = (repulsionRadius - dist) / repulsionRadius; // 0 to 1 strength
      targetRobotX += (dx / dist) * force * 4.0; // Push away horizontally
      targetRobotY += (dy / dist) * force * 4.0; // Push away vertically
    }

    // Smoothly interpolate the robot's actual position towards the target
    mainRobotGroup.position.x += (targetRobotX - mainRobotGroup.position.x) * 0.1;
    mainRobotGroup.position.y += (targetRobotY - mainRobotGroup.position.y) * 0.1;

    // Add some gentle sway to the body
    bodyGroup.rotation.z = Math.sin(time * 1.5) * 0.02;

    // Body rotates slightly towards cursor
    bodyGroup.rotation.y = (mouse.x * Math.PI) * 0.1;
    bodyGroup.rotation.x = (mouse.y * Math.PI) * 0.05;

    // Target where the mouse is in 3D
    const targetX = mouse.x * 12;
    const targetY = mouse.y * 12;
    const targetZ = 15; 
    
    // Smoothly interpolate current rotation towards the target
    currentTarget.x += (targetX - currentTarget.x) * 0.05;
    currentTarget.y += (targetY - currentTarget.y) * 0.05;
    currentTarget.z += (targetZ - currentTarget.z) * 0.05;
    
    // Only the head fully tracks the cursor!
    headGroup.lookAt(currentTarget);

    // Waving logic
    if (isWaving) {
      const elapsed = time - waveStartTime;
      if (elapsed < 3.5) {
        const lift = Math.min(elapsed * 2, 1); 
        
        // Raise upper arm to horizontal
        rightArmGroup.rotation.z = (Math.PI / 16) + (Math.PI * 0.5) * lift; 
        
        // Bend elbow upwards and wave side-to-side using Z-axis oscillation
        rightLowerArmGroup.rotation.z = (Math.PI * 0.65) * lift + Math.sin(elapsed * 15) * 0.3 * lift; 
        rightLowerArmGroup.rotation.x = 0; // No forward/backward chop
      } else {
        isWaving = false; // Stop waving
      }
    } else {
      // Smoothly return arm to rest position
      rightArmGroup.rotation.z += ((Math.PI / 16) - rightArmGroup.rotation.z) * 0.1;
      rightLowerArmGroup.rotation.z *= 0.9;
      rightLowerArmGroup.rotation.x *= 0.9;
    }

    renderer.render(scene, camera);
  }
  animate();
}

// Initialize the robot
initRobot();

// ===================================================================
// AI ROBOT CHAT LOGIC (STT & TTS Enabled)
// ===================================================================
function initRobotChat() {
  const chatUI = document.getElementById('robotChatUI');
  const chatHistory = document.getElementById('chatHistory');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMic = document.getElementById('chatMic');
  const chatMinimizeBtn = document.getElementById('chatMinimize');
  const talkModeToggle = document.getElementById('talkModeToggle');

  let isTalkMode = false;

  if (!chatUI || !chatHistory || !chatForm) return;

  // Show UI with a slight delay after page load
  setTimeout(() => {
    chatUI.classList.add('active');
    appendMessage("robot", "Hello! Welcome to my portfolio. How can I assist you today?");
    // We do not play TTS here to avoid browser autoplay restrictions.
  }, 2000);

  // Minimize Toggle Logic
  let introPlayed = false;
  
  // Click anywhere on minimized chat widget to expand it
  chatUI.addEventListener('click', (e) => {
    if (chatUI.classList.contains('minimized')) {
      chatUI.classList.remove('minimized');
      if (chatMinimizeBtn) {
        const icon = chatMinimizeBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-plus');
          icon.classList.add('fa-minus');
        }
      }
      
      // Play the intro greeting audio when the user first opens the chat
      if (!introPlayed) {
        introPlayed = true;
        const btns = chatHistory.querySelectorAll('.msg-play-btn');
        if (btns.length > 0) {
          const latestBtn = btns[0];
          playTTS("Hello! Welcome to my portfolio. How can I assist you today?", latestBtn, () => {
            if (window.triggerRobotWave) window.triggerRobotWave();
          });
        }
      }
    }
  });

  if (chatMinimizeBtn) {
    chatMinimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent trigger parent chatUI click expand
      chatUI.classList.toggle('minimized');
      const icon = chatMinimizeBtn.querySelector('i');
      if (chatUI.classList.contains('minimized')) {
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
      } else {
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
        
        // Play the intro greeting audio when the user first opens the chat
        if (!introPlayed) {
          introPlayed = true;
          const btns = chatHistory.querySelectorAll('.msg-play-btn');
          if (btns.length > 0) {
            const latestBtn = btns[0]; // The very first message button
            playTTS("Hello! Welcome to my portfolio. How can I assist you today?", latestBtn, () => {
              if (window.triggerRobotWave) window.triggerRobotWave();
            });
          }
        }
      }
    });
  }

  // Talk Mode Toggle Logic
  if (talkModeToggle) {
    talkModeToggle.addEventListener('click', () => {
      isTalkMode = !isTalkMode;
      if (isTalkMode) {
        talkModeToggle.classList.add('active');
        appendMessage('robot', "Talk mode enabled! You can speak your queries and I will reply out loud.");
      } else {
        talkModeToggle.classList.remove('active');
        appendMessage('robot', "Talk mode disabled. Back to text-only mode.");
      }
    });
  }

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender);
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    msgDiv.appendChild(textSpan);

    // If it's the robot, add a manual Play Audio button
    if (sender === 'robot') {
      const playBtn = document.createElement('button');
      playBtn.className = 'msg-play-btn';
      playBtn.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
      playBtn.title = 'Listen to response';
      
      playBtn.addEventListener('click', () => {
        playTTS(text, playBtn);
      });
      
      msgDiv.appendChild(playBtn);
    }

    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('chat-loading');
    loadingDiv.id = 'chatLoading';
    loadingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function hideLoading() {
    const loadingDiv = document.getElementById('chatLoading');
    if (loadingDiv) loadingDiv.remove();
  }

  // --- Speech-to-Text (Voice Input) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let micError = false;
  let silenceTimer = null;
  let lastInputMethod = 'text';

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      micError = false;
      chatMic.classList.add('listening');
      chatInput.placeholder = "Listening... (Take a breath, I'll wait)";
      chatInput.value = "";
    };

    recognition.onresult = (event) => {
      // Clear the previous silence timer since they are speaking
      if (silenceTimer) clearTimeout(silenceTimer);

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Update input with current speech
      if (finalTranscript || interimTranscript) {
        chatInput.value = finalTranscript || interimTranscript;
      }

      // Wait 1.5 seconds after they stop talking before submitting automatically
      silenceTimer = setTimeout(() => {
        if (chatMic.classList.contains('listening')) {
          recognition.stop();
        }
      }, 1500);
    };

    recognition.onerror = (event) => {
      micError = true;
      console.error('Speech recognition error:', event.error);
      chatMic.classList.remove('listening');
      
      let errorMsg = "Mic error: " + event.error;
      if (event.error === 'audio-capture') {
        errorMsg = "Hardware Error: No mic found or OS blocked access!";
      } else if (event.error === 'not-allowed') {
        errorMsg = "Permission Denied: Please allow mic access!";
      } else if (event.error === 'no-speech') {
        errorMsg = "No speech detected. Try again.";
      }
      
      chatInput.placeholder = errorMsg;
      setTimeout(() => {
        chatInput.placeholder = "Ask me anything...";
        micError = false;
      }, 5000);
    };

    recognition.onend = () => {
      chatMic.classList.remove('listening');
      if (silenceTimer) clearTimeout(silenceTimer);

      if (!micError && chatInput.value.trim() !== '') {
        // Only submit if they actually said something
        chatInput.placeholder = "Ask me anything...";
        lastInputMethod = 'voice';
        chatForm.dispatchEvent(new Event('submit'));
      } else if (!micError) {
        chatInput.placeholder = "Ask me anything...";
      }
    };

    chatMic.addEventListener('click', (e) => {
      e.preventDefault();
      if (chatMic.classList.contains('listening')) {
        // Manually stop and send
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.error("Failed to start mic:", err);
        }
      }
    });
  } else {
    chatMic.style.display = 'none'; // Hide if unsupported
    console.warn("Speech Recognition API not supported in this browser.");
  }

  // --- Text-to-Speech (Voice Output) ---
  let currentAudio = null;
  
  async function playTTS(text, btnElement, onPlayCallback) {
    // If audio is already playing from this button, stop it
    if (currentAudio && btnElement && btnElement.classList.contains('playing')) {
      currentAudio.pause();
      currentAudio = null;
      btnElement.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
      btnElement.classList.remove('playing');
      return;
    }

    try {
      if (btnElement) {
        btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; // Loading state
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('TTS Failed');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (currentAudio) currentAudio.pause(); // Stop any other playing audio
      
      currentAudio = new Audio(url);
      
      currentAudio.onplay = () => {
        if (btnElement) {
          btnElement.innerHTML = '<i class="fa-solid fa-stop"></i>';
          btnElement.classList.add('playing');
        }
        if (onPlayCallback) onPlayCallback();
      };
      
      currentAudio.onended = () => {
        if (btnElement) {
          btnElement.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
          btnElement.classList.remove('playing');
        }
      };

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Autoplay blocked or playback failed:', err);
          if (btnElement) {
            btnElement.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
            btnElement.classList.remove('playing');
          }
        });
      }
    } catch (err) {
      console.error('TTS Playback error:', err);
      if (btnElement) {
        btnElement.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        setTimeout(() => btnElement.innerHTML = '<i class="fa-solid fa-volume-up"></i>', 2000);
      }
    }
  }

  // --- Chat Submit Logic ---
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Capture how this message was inputted and immediately reset for the next one
    const usedVoice = (lastInputMethod === 'voice');
    lastInputMethod = 'text'; 

    // Add user message
    appendMessage('user', message);
    chatInput.value = '';
    
    // Show loading indicator
    showLoading();

    try {
      // Send request to our serverless/custom server
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      hideLoading();

      if (res.ok && data.reply) {
        appendMessage('robot', data.reply);
        
        // If Talk Mode is ON, automatically play the audio
        if (isTalkMode) {
          const btns = chatHistory.querySelectorAll('.msg-play-btn');
          if (btns.length > 0) {
            const latestBtn = btns[btns.length - 1];
            playTTS(data.reply, latestBtn);
          }
        }
      } else {
        appendMessage('robot', "Oops, my neural network had a hiccup! Please try again later.");
        console.error("API Error:", data);
      }
    } catch (err) {
      hideLoading();
      appendMessage('robot', "Sorry, I can't reach my mainframe right now.");
      console.error(err);
    }
  });
}

document.addEventListener('DOMContentLoaded', initRobotChat);

// ===================================================================
// GLOBAL 3D SCROLL-MORPHING HOLOGRAM (Face -> Phone)
// ===================================================================
function initProfileHologram() {
  const container = document.getElementById('profileHologramContainer');
  if (!container) return;

  const CANVAS_SIZE = 1200;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 4000);
  camera.position.z = 1500; 

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(CANVAS_SIZE, CANVAS_SIZE);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  const canvasElement = renderer.domElement;
  canvasElement.style.position = 'absolute';
  canvasElement.style.top = '0px';
  canvasElement.style.left = '0px';
  canvasElement.style.pointerEvents = 'none';
  canvasElement.style.zIndex = '10';
  const pageWrapper = document.getElementById('page-wrapper') || document.body;
  pageWrapper.appendChild(canvasElement);

  const img = new Image();
  img.src = 'profile.png';
  
  let particleSystem;
  let textPositions = [];
  let textColors = [];
  let facePositions = [];
  let faceColors = [];
  let phonePositions = [];
  let phoneColors = [];
  let barPositions = [];
  let barColors = [];
  let hoverPositions = [];
  let isHoveringSkill = false;
  
  const faceColorObj = new THREE.Color('#555555'); // Grayscale for face
  const textColorObj = new THREE.Color('#8b5cf6'); // Keep WIBI text purple
  const phoneColorObj = new THREE.Color('#64748B'); // Slate - visible on both light and dark backgrounds
  const barColorObj = new THREE.Color('#8b5cf6'); // Purple for bars

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const scale = 0.5; 
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    const step = 1; 
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;

    // --- 1. GENERATE FACE DATA ---
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        
        const distFromCenter = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        if (distFromCenter > maxRadius) continue;

        const i = (y * canvas.width + x) * 4;
        const r = pixels[i];
        const g = pixels[i+1];
        const b = pixels[i+2];

        let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
        const pX = (x - canvas.width / 2) * 1.3; 
        const pY = -(y - canvas.height / 2) * 1.3; 
        
        const nx = (x / canvas.width) * 2 - 1; 
        const ny = (y / canvas.height) * 2 - 1; 
        
        const baseCurve = Math.cos(nx * Math.PI/2) * Math.cos(ny * Math.PI/2) * 40; 
        const detailZ = (luminance / 255.0) * 15; 
        const pZ = baseCurve + detailZ;

        facePositions.push(pX, pY, pZ);

        const edgeFade = Math.pow(Math.max(0, 1 - (distFromCenter / maxRadius)), 0.5);
        const baseIntensity = (luminance / 255.0);
        const finalIntensity = baseIntensity * 4.0 * edgeFade;
        const highlight = Math.pow(baseIntensity, 3.0) * 2.0 * edgeFade;

        faceColors.push(
          Math.min(1.0, faceColorObj.r * finalIntensity + highlight), 
          Math.min(1.0, faceColorObj.g * finalIntensity + highlight), 
          Math.min(1.0, faceColorObj.b * finalIntensity + highlight)
        );
      }
    }

    const numParticles = facePositions.length / 3;

    // --- 1.5 GENERATE TEXT DATA ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 220px var(--font-display), sans-serif'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WIBI', canvas.width/2, canvas.height/2);

    const textImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const textPixels = textImgData.data;
    
    let textValidPoints = [];
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const i = (y * canvas.width + x) * 4;
        if (textPixels[i] > 100) {
           textValidPoints.push({x, y});
        }
      }
    }

    // Shuffle array for better modulo distribution
    for (let i = textValidPoints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [textValidPoints[i], textValidPoints[j]] = [textValidPoints[j], textValidPoints[i]];
    }

    for (let i = 0; i < numParticles; i++) {
      if (textValidPoints.length > 0) {
        const pt = textValidPoints[i % textValidPoints.length];
        const nx = (pt.x - canvas.width/2) * 1.3 + (Math.random() - 0.5) * 5;
        const ny = -(pt.y - canvas.height/2) * 1.3 + (Math.random() - 0.5) * 5;
        const nz = (Math.random() - 0.5) * 15; 
        
        textPositions.push(nx, ny, nz);
      } else {
        textPositions.push(0, 0, 0); 
      }
      textColors.push(textColorObj.r, textColorObj.g, textColorObj.b);
    }

    // --- 2. GENERATE PHONE DATA ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '900 200px "Font Awesome 6 Free"'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uf095', canvas.width/2, canvas.height/2);

    const phoneImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const phonePixels = phoneImgData.data;
    
    let phoneValidPoints = [];
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const i = (y * canvas.width + x) * 4;
        if (phonePixels[i] > 100) {
           phoneValidPoints.push({x, y});
        }
      }
    }

    for (let i = 0; i < numParticles; i++) {
      if (phoneValidPoints.length > 0) {
        const pt = phoneValidPoints[Math.floor(Math.random() * phoneValidPoints.length)];
        const nx = (pt.x - canvas.width/2) * 1.3 + (Math.random() - 0.5) * 5;
        const ny = -(pt.y - canvas.height/2) * 1.3 + (Math.random() - 0.5) * 5;
        const nz = (Math.random() - 0.5) * 20; 
        
        phonePositions.push(nx, ny, nz);
      } else {
        phonePositions.push(0, 0, 0); 
      }
      phoneColors.push(phoneColorObj.r, phoneColorObj.g, phoneColorObj.b);
    }

    // --- 3. GENERATE BARS DATA ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    
    const skills = [
      { text: "Voice & Telephony", percent: "95%", val: 0.95 },
      { text: "Full-Stack Web (React/Node)", percent: "90%", val: 0.90 },
      { text: "Voice AI & LLMs", percent: "85%", val: 0.85 },
      { text: "3D & Immersive Web", percent: "75%", val: 0.75 }
    ];
    
    const fontSize = Math.floor(canvas.width * 0.035);
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    const startY = canvas.height * 0.25;
    const ySpacing = canvas.height * 0.18;
    
    const maxBarWidth = canvas.width * 0.8;
    const startX = canvas.width * 0.1;

    for (let i = 0; i < skills.length; i++) {
        const currentY = startY + (i * ySpacing);
        
        ctx.textAlign = 'left';
        ctx.fillText(skills[i].text, startX, currentY - fontSize);
        
        ctx.textAlign = 'right';
        ctx.fillText(skills[i].percent, startX + maxBarWidth, currentY - fontSize);
        
        ctx.textAlign = 'left'; // Reset
        const barActualWidth = maxBarWidth * skills[i].val;
        ctx.fillRect(startX, currentY, barActualWidth, fontSize * 0.4);
    }

    const barImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const barPixels = barImgData.data;
    
    let barValidPoints = [];
    // Step 1 to grab high resolution text pixels
    for (let y = 0; y < canvas.height; y += 1) { 
      for (let x = 0; x < canvas.width; x += 1) {
        const i = (y * canvas.width + x) * 4;
        if (barPixels[i] > 100) {
           barValidPoints.push({x, y});
        }
      }
    }

    for (let i = 0; i < numParticles; i++) {
      if (barValidPoints.length > 0) {
        const pt = barValidPoints[Math.floor(Math.random() * barValidPoints.length)];
        
        const jitter = 1.0; 
        const nx = (pt.x - canvas.width/2) * 1.3 + (Math.random() - 0.5) * jitter;
        const ny = -(pt.y - canvas.height/2) * 1.3 + (Math.random() - 0.5) * jitter;
        const nz = (Math.random() - 0.5) * 10; // Z-depth for holographic 3D feel
        
        barPositions.push(nx, ny, nz);
        
        // Subtle left-to-right gradient for the whole text block
        const colorLerp = Math.max(0, Math.min(1, (pt.x / canvas.width)));
        barColors.push(
          barColorObj.r * (1 - colorLerp * 0.3), 
          barColorObj.g * (1 - colorLerp * 0.3), 
          barColorObj.b
        );
      } else {
        barPositions.push(0, 0, 0); 
        barColors.push(barColorObj.r, barColorObj.g, barColorObj.b);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(faceColors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.NormalBlending, 
      depthWrite: false
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // --- 4. HOVER EVENTS ---
    const skillChips = document.querySelectorAll('.skill-chip');
    skillChips.forEach(chip => {
      chip.addEventListener('mouseenter', () => {
        const iconEl = chip.querySelector('i');
        if (!iconEl) return;
        
        const style = window.getComputedStyle(iconEl, '::before');
        const content = style.getPropertyValue('content').replace(/['"]/g, ''); 
        const fontFamily = style.getPropertyValue('font-family'); 
        const fontWeight = style.getPropertyValue('font-weight'); 
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        // IMPORTANT: FontAwesome solid icons require font-weight 900 to render!
        ctx.font = `${fontWeight} 200px ${fontFamily}`; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(content, canvas.width/2, canvas.height/2);
        
        const hoverImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hoverPixels = hoverImgData.data;
        
        let hoverValidPoints = [];
        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            const i = (y * canvas.width + x) * 4;
            if (hoverPixels[i] > 100) {
               hoverValidPoints.push({x, y});
            }
          }
        }
        
        let newHoverPositions = [];
        for (let i = 0; i < numParticles; i++) {
          if (hoverValidPoints.length > 0) {
            const pt = hoverValidPoints[Math.floor(Math.random() * hoverValidPoints.length)];
            const nx = (pt.x - canvas.width/2) * 1.3 + (Math.random() - 0.5) * 5;
            const ny = -(pt.y - canvas.height/2) * 1.3 + (Math.random() - 0.5) * 5;
            const nz = (Math.random() - 0.5) * 20; 
            newHoverPositions.push(nx, ny, nz);
          } else {
            newHoverPositions.push(0, 0, 0); 
          }
        }
        hoverProgress = 0; // Reset so particles visibly morph from bars into new logo
        hoverPositions = newHoverPositions;
        isHoveringSkill = true;
      });
      
      chip.addEventListener('mouseleave', () => {
        isHoveringSkill = false;
      });
    });
  };

  // --- SCROLL LOGIC & COORDINATES PRE-CACHING ---
  let scrollProgress0 = 0; // Text -> Face
  let scrollProgress1 = 0; // Face -> Phone
  let scrollProgress2 = 0; // Phone -> Bars
  
  let startX = 0, startY = 0, targetX = 0, targetY = 0, target2X = 0, target2Y = 0;
  let statementTop = 0;
  let skillsTop = 0;
  let profileTop = 0;

  const recalculateHologramCoordinates = () => {
    if (!container) return;
    
    // 1. Origin (Face in dark box)
    const originRect = container.getBoundingClientRect();
    const profileCenterX = originRect.left + (originRect.width / 2) + window.scrollX;
    const profileCenterY = originRect.top + (originRect.height / 2) + window.scrollY;
    
    startX = profileCenterX - (1200 / 2);
    startY = profileCenterY - (1200 / 2);
    profileTop = profileCenterY;
    
    // 2. Middle Target (Phone next to Statement)
    const statementText = document.getElementById('statementText');
    if (statementText) {
      const textRect = statementText.getBoundingClientRect();
      const statementCenterY = textRect.top + (textRect.height / 2) + window.scrollY;
      statementTop = statementCenterY;
      
      let phoneCenterX, phoneCenterY;
      if (window.innerWidth <= 900) {
        phoneCenterX = window.innerWidth / 2 + window.scrollX;
        phoneCenterY = textRect.bottom + window.scrollY + 150;
        if (particleSystem) particleSystem.scale.set(0.6, 0.6, 0.6);
      } else {
        phoneCenterX = window.innerWidth * 0.80 + window.scrollX;
        phoneCenterY = statementCenterY;
        if (particleSystem) particleSystem.scale.set(1, 1, 1);
      }
      
      targetX = phoneCenterX - (1200 / 2);
      targetY = phoneCenterY - (1200 / 2);
    }

    // 3. Final Target (Stats Chart over Skills)
    const skillsTarget = document.getElementById('skillsHologramContainer');
    if (skillsTarget) {
      const skillsRect = skillsTarget.getBoundingClientRect();
      const skillsCenterX = skillsRect.left + (skillsRect.width / 2) + window.scrollX;
      const skillsCenterY = skillsRect.top + (skillsRect.height / 2) + window.scrollY;
      
      target2X = skillsCenterX - (1200 / 2);
      target2Y = skillsCenterY - (1200 / 2);
      skillsTop = skillsCenterY;
    }
  };

  setTimeout(recalculateHologramCoordinates, 300);

  window.addEventListener('scroll', () => {
    recalculateHologramCoordinates();
    const scrollY = window.scrollY;
    
    // Scroll 0: From top to bottom of hero
    const rawP0 = scrollY / (window.innerHeight * 0.8);
    scrollProgress0 = Math.max(0, Math.min(1, rawP0));

    if (profileTop && statementTop) {
       // Phase 1: Face -> Phone
       // Start morph only when Profile section is leaving the top of the viewport (20%)
       // This guarantees the Face stays perfect while the user is reading the Profile.
       const start1 = profileTop - window.innerHeight * 0.2;
       
       // End morph when Statement text reaches the center (50% of viewport)
       const end1 = statementTop - window.innerHeight * 0.5;
       
       if (end1 > start1) {
         let rawP1 = (scrollY - start1) / (end1 - start1);
         scrollProgress1 = Math.max(0, Math.min(1, rawP1));
       } else {
         scrollProgress1 = 1;
       }
    }
    
    if (statementTop && skillsTop) {
       // Phase 2: Phone -> Stats Chart
       // Start morph when text leaves reading zone (20% from top)
       const start2 = statementTop - window.innerHeight * 0.2;
       
       // End morph when Skills section is just entering the middle of the screen (65% from top)
       // This guarantees it is fully formed by the time the user frames the "Tools of the trade" heading.
       const end2 = skillsTop - window.innerHeight * 0.65;
       
       if (end2 > start2) {
         let rawP2 = (scrollY - start2) / (end2 - start2);
         scrollProgress2 = Math.max(0, Math.min(1, rawP2));
       } else {
         scrollProgress2 = 1; // Fallback if sections overlap
       }
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!container) return;
    // Camera aspect remains 1 because canvas is always 1200x1200
    recalculateHologramCoordinates();
  });

  // --- ANIMATION LOOP ---
  let targetRotationX = 0;
  let targetRotationY = 0;

  // Mouse rotation removed as requested

  const clock = new THREE.Clock();
  let hoverProgress = 0;
  
  // Pause rendering when hologram canvas goes offscreen
  let isHologramVisible = true;
  if ('IntersectionObserver' in window) {
    const hologramObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHologramVisible = entry.isIntersecting;
      });
    }, { threshold: 0 });
    hologramObserver.observe(canvasElement);
  }

  function animateHologram() {
    requestAnimationFrame(animateHologram);
    if (!isHologramVisible) return;
    
    if (particleSystem && facePositions.length > 0 && phonePositions.length > 0 && barPositions.length > 0) {
      
      const positions = particleSystem.geometry.attributes.position.array;
      const colors = particleSystem.geometry.attributes.color.array;
      
      // Start at Text (Stay in hero section)
      let currentX = startX;
      let currentY = startY;

      // Phase 1: Face -> Phone (Move to statement)
      currentX = currentX * (1 - scrollProgress1) + targetX * scrollProgress1;
      currentY = currentY * (1 - scrollProgress1) + targetY * scrollProgress1;
      
      // Phase 2: Phone -> Bars (Move to skills)
      currentX = currentX * (1 - scrollProgress2) + target2X * scrollProgress2;
      currentY = currentY * (1 - scrollProgress2) + target2Y * scrollProgress2;
      
      // Phase 3 state — slow morph so particles visibly travel between logo shapes
      if (scrollProgress2 > 0.5) {
         hoverProgress += (isHoveringSkill ? 1 : -1) * 0.05;
      } else {
         hoverProgress += (0 - hoverProgress) * 0.05;
      }
      hoverProgress = Math.max(0, Math.min(1, hoverProgress));
      
      // Apply strictly via transform3d for buttery smooth, pixel-perfect alignment
      canvasElement.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      for (let i = 0; i < facePositions.length; i+=3) {
        // Phase 0 local morph (Text -> Face)
        let localX = textPositions[i] * (1 - scrollProgress0) + facePositions[i] * scrollProgress0;
        let localY = textPositions[i+1] * (1 - scrollProgress0) + facePositions[i+1] * scrollProgress0;
        let localZ = textPositions[i+2] * (1 - scrollProgress0) + facePositions[i+2] * scrollProgress0;

        // Phase 1 local morph (Face -> Phone)
        localX = localX * (1 - scrollProgress1) + phonePositions[i] * scrollProgress1;
        localY = localY * (1 - scrollProgress1) + phonePositions[i+1] * scrollProgress1;
        localZ = localZ * (1 - scrollProgress1) + phonePositions[i+2] * scrollProgress1;
        
        // Phase 2 local morph
        localX = localX * (1 - scrollProgress2) + barPositions[i] * scrollProgress2;
        localY = localY * (1 - scrollProgress2) + barPositions[i+1] * scrollProgress2;
        localZ = localZ * (1 - scrollProgress2) + barPositions[i+2] * scrollProgress2;
        
        // Phase 3 local morph (Hovering Tool)
        if (hoverProgress > 0 && hoverPositions.length > i) {
           localX = localX * (1 - hoverProgress) + hoverPositions[i] * hoverProgress;
           localY = localY * (1 - hoverProgress) + hoverPositions[i+1] * hoverProgress;
           localZ = localZ * (1 - hoverProgress) + hoverPositions[i+2] * hoverProgress;
        }

        positions[i] = localX;
        positions[i+1] = localY;
        positions[i+2] = localZ;
        
        // Phase 0 color morph
        let cR = textColors[i] * (1 - scrollProgress0) + faceColors[i] * scrollProgress0;
        let cG = textColors[i+1] * (1 - scrollProgress0) + faceColors[i+1] * scrollProgress0;
        let cB = textColors[i+2] * (1 - scrollProgress0) + faceColors[i+2] * scrollProgress0;

        // Phase 1 color morph
        cR = cR * (1 - scrollProgress1) + phoneColors[i] * scrollProgress1;
        cG = cG * (1 - scrollProgress1) + phoneColors[i+1] * scrollProgress1;
        cB = cB * (1 - scrollProgress1) + phoneColors[i+2] * scrollProgress1;
        
        // Phase 2 color morph
        cR = cR * (1 - scrollProgress2) + barColors[i] * scrollProgress2;
        cG = cG * (1 - scrollProgress2) + barColors[i+1] * scrollProgress2;
        cB = cB * (1 - scrollProgress2) + barColors[i+2] * scrollProgress2;
        
        // Phase 3 color morph
        if (hoverProgress > 0) {
           cR = cR * (1 - hoverProgress) + barColorObj.r * hoverProgress;
           cG = cG * (1 - hoverProgress) + barColorObj.g * hoverProgress;
           cB = cB * (1 - hoverProgress) + barColorObj.b * hoverProgress;
        }

        colors[i] = cR;
        colors[i+1] = cG;
        colors[i+2] = cB;
      }
      
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.color.needsUpdate = true;

      const time = clock.getElapsedTime();
      const autoRotateX = Math.sin(time * 0.5) * 0.05;
      const autoRotateY = Math.cos(time * 0.3) * 0.05;
      
      // Auto-rotation only happens strongly when it's the phone
      const targetPhoneRotY = Math.sin(time) * 0.2 * scrollProgress1 * (1 - scrollProgress2);
      
      particleSystem.rotation.x += (autoRotateX - particleSystem.rotation.x) * 0.05;
      particleSystem.rotation.y += (targetPhoneRotY + autoRotateY - particleSystem.rotation.y) * 0.05;
    }

    renderer.render(scene, camera);
  }

  animateHologram();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.fonts) {
    document.fonts.ready.then(initProfileHologram);
  } else {
    initProfileHologram();
  }
});

// --- SPOTLIGHT EFFECT FOR PROFILE ---
document.addEventListener('DOMContentLoaded', () => {
  const profileSection = document.getElementById('profile');
  const bgText = document.getElementById('profileBgText');
  
  if (profileSection && bgText) {
    profileSection.addEventListener('mousemove', (e) => {
      const rect = bgText.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      bgText.style.setProperty('--spotlight-x', `${x}px`);
      bgText.style.setProperty('--spotlight-y', `${y}px`);
    });
  }
});

// --- INTERACTIVE RIVER LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('riverRocks');
  if (!container) return;

  const rocks = document.querySelectorAll('.rock-chip');
  let isDragging = false;
  let currentDragElement = null;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let hasMoved = false;

  // Scatter rocks organically across the stream on load
  const scatterRocks = () => {
    const isMobile = window.innerWidth <= 900;
    
    if (isMobile) {
      // On mobile, let CSS flexbox handle layout — just reset positions
      rocks.forEach(rock => {
        rock.style.left = '';
        rock.style.top = '';
        rock.style.transform = '';
        rock.setAttribute('draggable', 'false');
      });
      return;
    }

    rocks.forEach((rock, index) => {
      // Create a winding path from left to right (5% to 85% width)
      const progress = index / Math.max(1, rocks.length - 1);
      
      // Keep rocks tight within the river's visual path (around 45% to 55% vertically)
      const baseTop = 50; 
      
      const left = 5 + progress * 80; // 5% to 85%
      const top = baseTop + (Math.random() * 10 - 5) + (index % 2 === 0 ? 8 : -8); // Tighter stagger
      
      rock.style.left = `${left}%`;
      rock.style.top = `${top}%`;
      rock.style.transform = `translate(-50%, -50%)`;
      
      // We will handle drag manually, so prevent default anchor drag behavior
      rock.setAttribute('draggable', 'false');
    });
  };

  scatterRocks();
  window.addEventListener('resize', scatterRocks, { passive: true });

  // Mouse / Touch Dragging
  rocks.forEach(rock => {
    // Prevent default click if user dragged
    rock.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
      }
    });

    const startDrag = (e) => {
      if (window.innerWidth <= 900) return; // Do nothing on mobile
      e.preventDefault(); // Prevent text selection/native drag
      isDragging = true;
      hasMoved = false;
      currentDragElement = rock;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      startX = clientX;
      startY = clientY;
      
      // Use offsetLeft/Top which are always robust pixel values relative to the container
      initialLeft = rock.offsetLeft;
      initialTop = rock.offsetTop;
      
      rock.classList.add('is-dragging');
    };

    rock.addEventListener('mousedown', startDrag);
    rock.addEventListener('touchstart', startDrag, { passive: false });
  });

  const onDrag = (e) => {
    if (!isDragging || !currentDragElement) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved = true;
    }
    
    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Constrain to river bounds
    const paddingX = 30; // Padding from horizontal edges
    const minLeft = paddingX;
    const maxLeft = container.clientWidth - paddingX;
    
    // The visual river is roughly between 25% and 75% of the container height
    const minTop = container.clientHeight * 0.25; 
    const maxTop = container.clientHeight * 0.75;

    // Apply constraints
    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(minTop, Math.min(newTop, maxTop));
    
    currentDragElement.style.left = `${newLeft}px`;
    currentDragElement.style.top = `${newTop}px`;
  };

  const endDrag = (e) => {
    if (!isDragging || !currentDragElement) return;
    isDragging = false;
    currentDragElement.classList.remove('is-dragging');
    
    if (hasMoved) {
      // Spawn drop splash effect
      const splash = document.createElement('div');
      splash.classList.add('drop-splash');
      
      // Use offsetLeft/offsetTop directly to perfectly match the rock's absolute center position
      const rockLeft = currentDragElement.offsetLeft;
      const rockTop = currentDragElement.offsetTop;
      
      splash.style.left = `${rockLeft}px`;
      splash.style.top = `${rockTop}px`;
      
      container.appendChild(splash);
      
      // Remove splash after animation (1s)
      setTimeout(() => {
        splash.remove();
      }, 1000);
    }
    
    currentDragElement = null;
  };

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
});

// --- JOURNEY TIMELINE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const timelineProgress = document.getElementById('timelineProgress');
  const journeyTimeline = document.getElementById('journeyTimeline');
  
  if (timelineProgress && journeyTimeline) {
    // Get local length of SVG path for stroke-dash calculations
    const pathLength = timelineProgress.getTotalLength();
    timelineProgress.style.strokeDasharray = pathLength;
    timelineProgress.style.strokeDashoffset = pathLength;
    
    const timelineItems = journeyTimeline.querySelectorAll('.tl-item');
    
    let timelineTop = 0;
    let timelineHeight = 0;
    let itemsData = [];
    
    const measureTimeline = () => {
      const rect = journeyTimeline.getBoundingClientRect();
      timelineTop = rect.top + window.scrollY;
      timelineHeight = rect.height;
      
      itemsData = Array.from(timelineItems).map(item => {
        const itemRect = item.getBoundingClientRect();
        return {
          element: item,
          top: itemRect.top + window.scrollY,
          height: itemRect.height
        };
      });
    };
    
    // Measure coordinates after DOM layout settles
    setTimeout(measureTimeline, 300);
    window.addEventListener('resize', measureTimeline);
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Progress from 0 to 1 as the timeline passes the center of the screen
      const startTrigger = windowHeight / 2;
      const relativeTimelineTop = timelineTop - scrollY;
      let progress = (startTrigger - relativeTimelineTop) / timelineHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      // Animate the SVG trail
      timelineProgress.style.strokeDashoffset = pathLength * (1 - progress);
      
      // Calculate active card without any layout reflow triggers
      itemsData.forEach((item) => {
        const itemCenter = (item.top - scrollY) + item.height / 2;
        const dist = Math.abs(itemCenter - startTrigger);
        
        // Mark as active if it's near the center
        if (dist < windowHeight / 3.5) {
          item.element.classList.add('is-active');
        } else {
          item.element.classList.remove('is-active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger initial calculation slightly delayed to ensure offsets are resolved
    setTimeout(handleScroll, 350);
  }
});

// =====================================================================
// THEME TOGGLE (DARK/LIGHT MODE)
// =====================================================================
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
  const themeIcon = themeToggleBtn.querySelector('i');
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
  
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
    if (typeof updateCachedBg === 'function') updateCachedBg();
  }
  
  applyTheme(currentTheme);
  
  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
  });
}

// =====================================================================
// SMOOTH LERPED HORIZONTAL SCROLL & 3D SKEW EFFECT
// =====================================================================
function initHorizontalScrollProjects() {
  const wrapper = document.querySelector('.horizontal-scroll-wrapper');
  const sticky = document.querySelector('.horizontal-sticky');
  const track = document.getElementById('projectGrid');
  
  if (!wrapper || !sticky || !track) return;
  
  let currentX = 0;
  let targetX = 0;
  let lastX = 0;
  let scrollProgress = 0;
  const lerpFactor = 0.08; // Inertia / smoothness factor
  
  // Track changes to dimensions to avoid layout thrashing
  let lastScrollWidth = 0;
  let lastWindowWidth = 0;
  let lastWindowHeight = 0;
  
  const animate = () => {
    if (window.innerWidth > 900) {
      // Dynamic wrapper height recalculation inside frame to avoid race conditions
      if (track.scrollWidth !== lastScrollWidth || window.innerWidth !== lastWindowWidth || window.innerHeight !== lastWindowHeight) {
        lastScrollWidth = track.scrollWidth;
        lastWindowWidth = window.innerWidth;
        lastWindowHeight = window.innerHeight;
        const maxSlide = Math.max(0, lastScrollWidth - lastWindowWidth + 200);
        wrapper.style.height = `${lastWindowHeight + maxSlide}px`;
      }
      
      const rect = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable > 0) {
        const scrolled = -rect.top;
        scrollProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
        
        const maxSlide = Math.max(0, track.scrollWidth - window.innerWidth + 200);
        targetX = -scrollProgress * maxSlide;
      }
      
      // Buttery smooth lerp transition
      currentX += (targetX - currentX) * lerpFactor;
      
      // Calculate speed velocity for 3D Skew and Tilt
      const velocity = currentX - lastX;
      lastX = currentX;
      
      let skew = velocity * 0.07;
      skew = Math.max(-12, Math.min(12, skew));
      
      track.style.transform = `translateX(${currentX}px)`;
      
      const projectCards = track.querySelectorAll('.project');
      projectCards.forEach(card => {
        if (!card.matches(':hover')) {
          card.style.transform = `perspective(1200px) rotateY(${skew * 0.4}deg) skewX(${skew * 0.6}deg) scale(${1 - Math.abs(skew) * 0.003})`;
        }
      });
    } else {
      // Clear inline transform variables for mobile viewports
      wrapper.style.removeProperty('height');
      track.style.transform = 'none';
      const projectCards = track.querySelectorAll('.project');
      projectCards.forEach(card => {
        card.style.transform = 'none';
      });
    }
    
    requestAnimationFrame(animate);
  };
  
  animate();
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initHorizontalScrollProjects, 100);
});

/* =====================================================================
   UNDERWATER EFFECT & 3D GEO SHAPES LOGIC
===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Animate Underwater SVG Filter
  const turbulence = document.getElementById('waterTurbulence');
  let waterFrame = 0;
  
  function animateWater() {
    waterFrame += 1;
    // Animate baseFrequency slightly for an organic rippling effect
    const freqX = 0.015 + Math.sin(waterFrame * 0.01) * 0.005;
    const freqY = 0.02 + Math.cos(waterFrame * 0.015) * 0.005;
    if (turbulence) {
      turbulence.setAttribute('baseFrequency', `${freqX} ${freqY}`);
    }
    requestAnimationFrame(animateWater);
  }
  requestAnimationFrame(animateWater);

  // (Removed jquery.ripples as requested)

  // (Water cursor effect removed)

  // 3. 3D Geo Shapes Parallax
  const geoShapes = document.querySelectorAll('.geo-shape');
  const cursors = [document.getElementById('lusionCursor'), document.getElementById('cursorGlow')];
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    geoShapes.forEach((shape, index) => {
      // Different parallax speeds based on index
      const speed = 0.05 + (index * 0.02);
      const yOffset = -scrollY * speed;
      shape.style.marginTop = `${yOffset}px`;
    });
  }, { passive: true });
});