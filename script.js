/**
 * Wibi Portfolio — Core Application & Interactive Logic
 * Owner: Waheeb Ullah (Wibi)
 * Features:
 *   - Three.js Floating 3D Browser Showcase
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
    if (update3DBrowserTheme) {
      update3DBrowserTheme(theme);
    }
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
// 5. Three.js Floating 3D Browser Window
// ==========================================================================
let update3DBrowserTheme = null;

function init3DFloatingBrowser() {
  const container = $('#hero-3d-stage');
  const fallback = $('#hero-fallback-browser');
  if (!container) return;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js library not loaded; retaining accessible project fallback.');
    return;
  }

  let scene, camera, renderer, browserGroup, frameMesh, toolbarMesh, addressMesh, screenMesh, shadowMesh;
  let isVisible = true;
  let isSceneReady = false;
  let animFrameId = null;
  const clock = new THREE.Clock();

  // Reduced motion preference query and dynamic listener
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = mediaQuery.matches;
  mediaQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
    if (isReducedMotion && browserGroup) {
      browserGroup.rotation.set(baseRotX, baseRotY, baseRotZ);
      browserGroup.position.set(0, 0, 0);
    }
  });

  // Base 3/4 resting angle orientation (in radians)
  // ~13.7° Y-turn, ~4.6° X-tilt, -1.7° Z-roll
  const baseRotX = 0.08;
  const baseRotY = 0.24;
  const baseRotZ = -0.03;

  let targetRotX = baseRotX;
  let targetRotY = baseRotY;
  let currentRotX = baseRotX;
  let currentRotY = baseRotY;
  let scrollProgress = 0;

  // Helper to generate rounded rectangle shapes for satin chassis
  function createRoundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(x + w, y + h - r);
    shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    shape.lineTo(x + r, y + h);
    shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(x, y + r);
    shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return shape;
  }

  try {
    // 1. Scene & Camera Setup
    scene = new THREE.Scene();

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 440;

    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h);
    // Cap pixel ratio to 2 for balanced rendering efficiency
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (renderer.outputEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    // Dynamic Camera Distance calculation to guarantee 100% camera-fit across viewports
    function fitCamera() {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;

      const aspect = width / height;
      camera.aspect = aspect;

      // Ensure full 4.84 x 3.04 model fits comfortably throughout rotation range
      const modelWidth = 5.4;
      const modelHeight = 3.6;
      const vFovRad = (38 * Math.PI) / 180;
      const distH = (modelHeight / 2) / Math.tan(vFovRad / 2);
      const distW = (modelWidth / 2) / (Math.tan(vFovRad / 2) * aspect);
      const targetZ = Math.max(distH, distW, 7.8);

      camera.position.set(0, 0, targetZ);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    fitCamera();

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const purpleAccentLight = new THREE.PointLight(0xa855f7, 2.2, 20);
    purpleAccentLight.position.set(-4, -3, 3);
    scene.add(purpleAccentLight);

    const rimLight = new THREE.DirectionalLight(0xc084fc, 0.85);
    rimLight.position.set(0, 6, -3);
    scene.add(rimLight);

    // 3. Floating Browser Model Construction
    browserGroup = new THREE.Group();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Satin Frame Material
    const frameMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x141724 : 0xf1f3f9,
      roughness: 0.35,
      metalness: 0.22
    });

    const toolbarMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e2235 : 0xe2e8f0,
      roughness: 0.45,
      metalness: 0.15
    });

    const addressMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f111a : 0xffffff,
      roughness: 0.5,
      metalness: 0.1
    });

    // Outer Chassis Frame (Extruded Rounded Rectangle with subtle bevel)
    const frameWidth = 4.8;
    const frameHeight = 3.0;
    const frameRadius = 0.14;
    const chassisShape = createRoundedRectShape(frameWidth, frameHeight, frameRadius);
    const frameGeo = new THREE.ExtrudeGeometry(chassisShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });
    frameGeo.center();
    frameMesh = new THREE.Mesh(frameGeo, frameMat);
    browserGroup.add(frameMesh);

    // Purple Chamfer Edge Outline
    const edgesGeo = new THREE.EdgesGeometry(frameGeo, 24);
    const edgeMat = new THREE.LineBasicMaterial({
      color: isDark ? 0xa855f7 : 0x8b5cf6,
      transparent: true,
      opacity: isDark ? 0.6 : 0.45
    });
    const edgeLines = new THREE.LineSegments(edgesGeo, edgeMat);
    browserGroup.add(edgeLines);

    // Top Browser Toolbar
    const toolbarHeight = 0.34;
    const toolbarWidth = frameWidth - 0.14;
    const toolbarGeo = new THREE.BoxGeometry(toolbarWidth, toolbarHeight, 0.02);
    toolbarMesh = new THREE.Mesh(toolbarGeo, toolbarMat);
    toolbarMesh.position.set(0, (frameHeight / 2) - (toolbarHeight / 2) - 0.07, 0.056);
    browserGroup.add(toolbarMesh);

    // 3 Window Control Dots (Red, Amber, Green)
    const dotColors = [0xef4444, 0xf59e0b, 0x10b981];
    const dotRadius = 0.045;
    const dotStartX = - (toolbarWidth / 2) + 0.18;
    const dotSpacing = 0.13;
    const dotGeo = new THREE.CircleGeometry(dotRadius, 16);

    dotColors.forEach((colorHex, idx) => {
      const dotMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.set(dotStartX + (idx * dotSpacing), toolbarMesh.position.y, 0.068);
      browserGroup.add(dotMesh);
    });

    // Subtle Recessed Address Bar Pill
    const addressWidth = 1.9;
    const addressHeight = 0.18;
    const addressGeo = new THREE.PlaneGeometry(addressWidth, addressHeight);
    addressMesh = new THREE.Mesh(addressGeo, addressMat);
    addressMesh.position.set(0.12, toolbarMesh.position.y, 0.068);
    browserGroup.add(addressMesh);

    // Project Screenshot Screen (16:10 ratio, 4.66 x 2.40)
    const screenWidth = toolbarWidth;
    const screenHeight = frameHeight - toolbarHeight - 0.20;
    const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);

    // Load authentic project capture with sRGB color handling
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'siparch_preview.png',
      (projectTexture) => {
        projectTexture.generateMipmaps = true;
        projectTexture.minFilter = THREE.LinearMipmapLinearFilter;
        if (projectTexture.encoding !== undefined) {
          projectTexture.encoding = THREE.sRGBEncoding;
        }

        // Unlit emissive screen material for 100% crystal-clear readability
        const screenMat = new THREE.MeshBasicMaterial({
          map: projectTexture,
          toneMapped: false
        });

        screenMesh = new THREE.Mesh(screenGeo, screenMat);
        screenMesh.position.set(0, - (toolbarHeight / 2) - 0.04, 0.065);
        browserGroup.add(screenMesh);

        // First render
        renderer.render(scene, camera);
        isSceneReady = true;

        // Hide fallback only after successful 3D scene creation & texture rendering
        if (fallback) {
          fallback.style.display = 'none';
        }
      },
      undefined,
      (err) => {
        console.warn('Project screenshot failed to load; retaining accessible fallback mockup.', err);
      }
    );

    // Soft Physical Shadow Plane underneath
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const gradient = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = gradient;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(5.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: isDark ? 0.75 : 0.55,
      depthWrite: false
    });

    shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -1.85, -0.15);
    shadowMesh.rotation.x = -Math.PI / 2.3;
    scene.add(shadowMesh);

    // Initial group positioning & pose
    browserGroup.rotation.set(baseRotX, baseRotY, baseRotZ);
    scene.add(browserGroup);

    // Append canvas into container
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none'; // Keeps container touch-scrolling safe
    container.appendChild(renderer.domElement);

    // Dynamic Theme Material Switcher
    update3DBrowserTheme = (theme) => {
      const dark = theme === 'dark';
      if (frameMat) frameMat.color.setHex(dark ? 0x141724 : 0xf1f3f9);
      if (toolbarMat) toolbarMat.color.setHex(dark ? 0x1e2235 : 0xe2e8f0);
      if (addressMat) addressMat.color.setHex(dark ? 0x0f111a : 0xffffff);
      if (edgeMat) edgeMat.color.setHex(dark ? 0xa855f7 : 0x8b5cf6);
      if (shadowMat) shadowMat.opacity = dark ? 0.75 : 0.55;
    };

    // 4. Pointer Interaction (Frame-rate independent damped tilt on .hero-stage)
    const handlePointerMove = (e) => {
      if (isReducedMotion) return;
      // Skip touch events to allow seamless vertical touch scrolling
      if (e.pointerType === 'touch') return;

      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        targetRotY = baseRotY + (x * 0.08); // ±4.5 degrees
        targetRotX = baseRotX + (-y * 0.06); // ±3.5 degrees
      }
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', () => {
      targetRotX = baseRotX;
      targetRotY = baseRotY;
    });

    // 5. Scroll Synchronization
    const heroSection = $('#home');
    const updateScrollSync = () => {
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const heroHeight = rect.height;
        const scrolled = -rect.top;
        scrollProgress = Math.max(0, Math.min(1, scrolled / (heroHeight * 0.85)));
      }
    };
    window.addEventListener('scroll', updateScrollSync, { passive: true });

    // 6. Resize Handling
    window.addEventListener('resize', fitCamera, { passive: true });

    // 7. Visibility Observer (Pauses rendering when Hero is off-screen or tab hidden)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameId) {
          clock.getDelta(); // reset delta timer
          animate();
        }
      });
    }, { threshold: 0.05 });

    if (heroSection) observer.observe(heroSection);

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && !animFrameId) {
        clock.getDelta(); // reset delta timer
        animate();
      }
    });

    // 8. Animation Loop (Frame-rate independent exponential damping)
    function animate() {
      if (!isVisible) {
        animFrameId = null;
        return;
      }

      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      if (!isReducedMotion) {
        // Subtle vertical floating drift
        const floatOffset = Math.sin(elapsedTime * 1.2) * 0.06;
        const rollOffset = Math.sin(elapsedTime * 0.9) * 0.01;
        browserGroup.position.y = floatOffset;

        // Frame-rate independent exponential smoothing
        const decay = 7.5;
        const lerpFactor = 1.0 - Math.exp(-decay * delta);
        currentRotX += (targetRotX - currentRotX) * lerpFactor;
        currentRotY += (targetRotY - currentRotY) * lerpFactor;

        // Scroll choreography: transitions toward front-facing view as hero scrolls
        const scrollRotY = currentRotY * (1.0 - (scrollProgress * 0.8));
        const scrollRotX = currentRotX * (1.0 - (scrollProgress * 0.5));
        const scrollScale = 1.0 - (scrollProgress * 0.06);

        browserGroup.rotation.x = scrollRotX;
        browserGroup.rotation.y = scrollRotY;
        browserGroup.rotation.z = baseRotZ + rollOffset;
        browserGroup.scale.set(scrollScale, scrollScale, scrollScale);

        // Shadow synchronization
        shadowMesh.position.y = -1.85 + (floatOffset * 0.3);
        shadowMesh.scale.set(1.0 - (floatOffset * 0.1), 1.0, 1.0);
      } else {
        browserGroup.rotation.set(baseRotX, baseRotY, baseRotZ);
        browserGroup.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    }

    animate();

  } catch (err) {
    console.error('Failed to initialize 3D Floating Browser; retaining accessible fallback mockup:', err);
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
  init3DFloatingBrowser();
  initProjectFilters();
  initAIAssistant();
});