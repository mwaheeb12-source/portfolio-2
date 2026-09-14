/**
 * Wibi Portfolio — Core Application & Interactive Logic
 * Owner: Waheeb Ullah (Wibi)
 * Features:
 *   - Three.js Parametric 3D Voice-Wave Sculpture
 *   - Scroll Spy & Header Progress Indicator
 *   - Category Project Filtering
 *   - Light/Dark Theme Controller
 *   - AI Assistant & Voice Interface
 */

// ==========================================================================
// 1. Global Utilities & Preferences
// ==========================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// ==========================================================================
// 2. Navigation & Mobile Drawer
// ==========================================================================
function initNavigation() {
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');
  const mobileLinks = $$('.mobile-nav-link');
  const header = $('#header');
  const scrollBar = $('#scrollBar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id], header[id]');

  if (burger && mobileMenu) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', isOpen);
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    burger.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  // Scroll spy & progress bar
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        
        if (scrollBar) {
          scrollBar.style.width = `${progress}%`;
        }

        // Active section spy
        const scrollPos = scrollY + 140;
        sections.forEach(section => {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          const id = section.getAttribute('id');
          
          if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });

        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });
}

// ==========================================================================
// 3. Theme Controller (Dark / Light Mode)
// ==========================================================================
function initTheme() {
  const themeToggle = $('#themeToggle');
  if (!themeToggle) return;

  const icon = themeToggle.querySelector('i');
  const savedTheme = localStorage.getItem('wibi_theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let activeTheme = savedTheme || (systemDark ? 'dark' : 'light');

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (icon) {
        icon.className = 'fa-solid fa-sun';
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (icon) {
        icon.className = 'fa-solid fa-moon';
      }
    }
    localStorage.setItem('wibi_theme', theme);
  };

  applyTheme(activeTheme);

  themeToggle.addEventListener('click', () => {
    activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
    applyTheme(activeTheme);
  });
}

// ==========================================================================
// 4. Single-Line Reserved Typewriter
// ==========================================================================
function initTypewriter() {
  const target = $('#typewriterText');
  if (!target || prefersReducedMotion) return;

  const phrases = [
    "Specializing in FreeSWITCH, WebRTC, Three.js & Voice AI systems.",
    "Engineering sub-600ms conversational AI voice agents.",
    "Carrier-grade SIP routing & high-throughput contact centers.",
    "Available for remote contracts & high-impact architecture."
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let timeoutId = null;

  function tick() {
    const current = phrases[phraseIdx];
    
    if (isDeleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    target.textContent = current.substring(0, charIdx);

    let delay = isDeleting ? 30 : 65;

    if (!isDeleting && charIdx === current.length) {
      delay = 2400; // Pause at full phrase
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }

    timeoutId = setTimeout(tick, delay);
  }

  // Start after brief delay
  setTimeout(tick, 1000);
}

// ==========================================================================
// 5. Three.js Parametric Voice-Wave 3D Sculpture
// ==========================================================================
function init3DVoiceSculpture() {
  const container = $('#hero-3d-stage');
  if (!container) return;

  // Verify WebGL availability
  if (typeof THREE === 'undefined') {
    console.warn('Three.js library not loaded');
    return;
  }

  let scene, camera, renderer, sculptureGroup, waveRibbon, innerCore, particleWave;
  let isVisible = true;
  let animFrameId = null;
  let clock = new THREE.Clock();

  // Mouse & Scroll orientation targets
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let scrollProgress = 0;

  try {
    // 1. Scene setup
    scene = new THREE.Scene();

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const purpleKeyLight = new THREE.PointLight(0xa855f7, 3.5, 30);
    purpleKeyLight.position.set(5, 5, 6);
    scene.add(purpleKeyLight);

    const cyanFillLight = new THREE.PointLight(0x06b6d4, 2.2, 30);
    cyanFillLight.position.set(-6, -4, 4);
    scene.add(cyanFillLight);

    const rimLight = new THREE.DirectionalLight(0xc084fc, 1.8);
    rimLight.position.set(0, 8, -4);
    scene.add(rimLight);

    // 3. Sculpture Geometry: Parametric Voice Wave Loop (Torus Knot + Harmonic Ribbons)
    sculptureGroup = new THREE.Group();

    // Primary Voice Wave Ring (Torus Knot with Satin Purple Material)
    const waveGeo = new THREE.TorusKnotGeometry(2.1, 0.45, 160, 36, 2, 3);
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.28,
      metalness: 0.65,
      emissive: 0x2e1065,
      emissiveIntensity: 0.35,
      wireframe: false
    });
    waveRibbon = new THREE.Mesh(waveGeo, waveMat);
    sculptureGroup.add(waveRibbon);

    // Secondary Nested Signal Ring
    const coreGeo = new THREE.TorusGeometry(1.4, 0.12, 24, 80);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x083344,
      emissiveIntensity: 0.5
    });
    innerCore = new THREE.Mesh(coreGeo, coreMat);
    innerCore.rotation.x = Math.PI / 3;
    sculptureGroup.add(innerCore);

    // Outer Harmonic Orbit Particles (Voice Frequency Constellation)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * Math.PI;
      const rad = 3.2 + (Math.random() - 0.5) * 0.8;

      positions[i * 3] = rad * Math.cos(v) * Math.cos(u);
      positions[i * 3 + 1] = rad * Math.cos(v) * Math.sin(u);
      positions[i * 3 + 2] = rad * Math.sin(v);

      // Gradient purple to cyan
      colors[i * 3] = 0.65 + Math.random() * 0.35;     // R
      colors[i * 3 + 1] = 0.35 + Math.random() * 0.5; // G
      colors[i * 3 + 2] = 0.95;                       // B
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    particleWave = new THREE.Points(particleGeo, particleMat);
    sculptureGroup.add(particleWave);

    scene.add(sculptureGroup);

    // 4. Pointer Interaction (Bounded inside hero)
    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      if (clientX !== undefined && clientY !== undefined) {
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
        
        targetRotY = x * 0.45;
        targetRotX = -y * 0.35;
      }
    };

    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('touchmove', handlePointerMove, { passive: true });

    container.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    // 5. Scroll synchronization (tracks scroll through Hero)
    const heroSection = $('#home');
    const updateScrollSync = () => {
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const heroHeight = rect.height;
        const scrolled = -rect.top;
        scrollProgress = Math.max(0, Math.min(1, scrolled / heroHeight));
      }
    };
    window.addEventListener('scroll', updateScrollSync, { passive: true });

    // 6. Resize handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // 7. Visibility Observer (Pauses rendering when Hero is off-screen)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameId) {
          animate();
        }
      });
    }, { threshold: 0.05 });

    if (heroSection) observer.observe(heroSection);

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && !animFrameId) {
        animate();
      }
    });

    // 8. Animation Loop
    function animate() {
      if (!isVisible) {
        animFrameId = null;
        return;
      }

      animFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous organic idle wave motion
        waveRibbon.rotation.x = elapsedTime * 0.22 + (scrollProgress * 1.8);
        waveRibbon.rotation.y = elapsedTime * 0.35 + (scrollProgress * 2.4);

        innerCore.rotation.x = -elapsedTime * 0.45;
        innerCore.rotation.y = elapsedTime * 0.28;

        particleWave.rotation.y = elapsedTime * 0.12;
        particleWave.rotation.z = Math.sin(elapsedTime * 0.3) * 0.15;

        // Damped mouse response
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        sculptureGroup.rotation.x = currentRotX;
        sculptureGroup.rotation.y = currentRotY;

        // Subtle scale transition with scroll
        const targetScale = 1.0 - (scrollProgress * 0.15);
        sculptureGroup.scale.set(targetScale, targetScale, targetScale);
      }

      renderer.render(scene, camera);
    }

    animate();

  } catch (err) {
    console.error('Failed to initialize 3D Voice Sculpture:', err);
    container.innerHTML = `
      <div class="stage-fallback">
        <div class="waveform-bars">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <p>Interactive 3D Voice Sculpture</p>
      </div>
    `;
  }
}

// ==========================================================================
// 6. Project Archive Category Filtering
// ==========================================================================
function initProjectFilters() {
  const filterBtns = $$('.filter-btn');
  const projectCards = $$('.archive-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards
      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ==========================================================================
// 7. AI Assistant Widget & Voice Client
// ==========================================================================
function initAIAssistant() {
  const launcher = $('#chatLauncher');
  const chatUI = $('#robotChatUI');
  const minimizeBtn = $('#chatMinimize');
  const talkModeToggle = $('#talkModeToggle');
  const chatForm = $('#chatForm');
  const chatInput = $('#chatInput');
  const chatHistory = $('#chatHistory');
  const chatMic = $('#chatMic');

  if (!launcher || !chatUI || !chatForm || !chatInput || !chatHistory) return;

  let isTalkMode = false;
  let isListening = false;
  let currentAudio = null;
  let recognition = null;

  // Toggle modal open/close
  const toggleChat = (open) => {
    const isHidden = open !== undefined ? !open : !chatUI.classList.contains('hidden');
    chatUI.classList.toggle('hidden', isHidden);
    chatUI.setAttribute('aria-hidden', String(isHidden));
    if (!isHidden) {
      chatInput.focus();
    }
  };

  launcher.addEventListener('click', () => toggleChat(true));
  minimizeBtn.addEventListener('click', () => toggleChat(false));

  // Toggle voice talk mode
  if (talkModeToggle) {
    talkModeToggle.addEventListener('click', () => {
      isTalkMode = !isTalkMode;
      talkModeToggle.classList.toggle('active', isTalkMode);
      talkModeToggle.title = isTalkMode ? 'Audio responses active' : 'Audio responses muted';
    });
  }

  // Append message helper
  const appendMessage = (sender, text) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg chat-msg--${sender}`;
    msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return msgDiv;
  };

  // Play TTS audio
  const playAudioResponse = async (text) => {
    if (!isTalkMode || !text) return;
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        currentAudio.play().catch(e => console.warn('Audio autoplay blocked:', e));
      }
    } catch (e) {
      console.warn('TTS playback error:', e);
    }
  };

  // Send message to /api/chat
  const handleSendMessage = async (userText) => {
    if (!userText.trim()) return;

    appendMessage('user', userText);
    chatInput.value = '';

    const typingIndicator = appendMessage('bot', '<i class="fa-solid fa-circle-notch fa-spin"></i> Thinking...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();
      typingIndicator.remove();

      if (response.ok && data.reply) {
        appendMessage('bot', data.reply);
        playAudioResponse(data.reply);
      } else {
        appendMessage('bot', `<em>${data.error || 'Unable to connect to AI assistant right now.'}</em>`);
      }
    } catch (err) {
      typingIndicator.remove();
      appendMessage('bot', '<em>Network error connecting to assistant. Please try again.</em>');
    }
  };

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value;
    handleSendMessage(text);
  });

  // Speech Recognition (Web Speech API)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && chatMic) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening = true;
      chatMic.classList.add('listening');
      chatInput.placeholder = 'Listening... speak now';
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      chatInput.value = transcript;
      handleSendMessage(transcript);
    };

    recognition.onerror = (e) => {
      console.warn('Speech error:', e.error);
      isListening = false;
      chatMic.classList.remove('listening');
      chatInput.placeholder = 'Ask about skills, projects, contact...';
    };

    recognition.onend = () => {
      isListening = false;
      chatMic.classList.remove('listening');
      chatInput.placeholder = 'Ask about skills, projects, contact...';
    };

    chatMic.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  } else if (chatMic) {
    chatMic.style.display = 'none';
  }
}

// ==========================================================================
// 8. Application Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTheme();
  initTypewriter();
  init3DVoiceSculpture();
  initProjectFilters();
  initAIAssistant();
});