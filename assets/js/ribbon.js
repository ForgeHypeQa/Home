// ribbon.js: the live 3D "forged" ribbon behind the home hero.
// Loads three.js only after the page has painted and the browser is idle, adapts quality to the device,
// pauses when the hero is off-screen or the tab is hidden, and renders a single still frame for reduced motion.
// If WebGL is unavailable, the inline SVG ribbon in the page simply stays visible.

const canvas = document.querySelector('[data-ribbon]');
const fallback = document.querySelector('.hero-fallback');

if (canvas && hasWebGL()) {
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  const go = () => idle(() => boot().catch((e) => console.warn('[ribbon] staying on the static ribbon:', e)), { timeout: 1500 });
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

async function boot() {
  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');

  const hero = canvas.closest('.hero') || canvas.parentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 8) <= 4;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  let dprCap = lowPower ? 1.25 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  const key = new THREE.DirectionalLight(0xffc89a, 1.7); key.position.set(5, 7, 9);
  const rim = new THREE.DirectionalLight(0xff5a00, 4.5); rim.position.set(-7, -3, -5);
  const top = new THREE.PointLight(0xffa040, 26, 30); top.position.set(2, 5, 4);
  scene.add(key, rim, top, new THREE.AmbientLight(0x2a0e00, 1.2));

  // Brushed, streaked silk: lines run along the ribbon, colour varies across it.
  const tex = new THREE.CanvasTexture(streaks());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const material = new THREE.MeshPhysicalMaterial({
    map: tex, color: 0xffffff, roughness: 0.36, metalness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.35, sheenColor: new THREE.Color(0xff7a1f), sheenRoughness: 0.45,
    side: THREE.DoubleSide,
  });

  // The path: a sweep from the left that curls once on the right, like a ribbon of molten metal.
  const BASE = [
    [-12, -1.4, -1], [-7.6, 1.2, 1.6], [-4.4, -1.1, 2.6], [-1.4, 0.9, 0.6], [1.4, 2.5, -1.2],
    [3.9, 1.4, 1.9], [3.1, -0.9, 2.8], [1.6, 0.1, 1.1], [2.6, 1.9, -0.9], [5.3, 2.3, -1.6],
    [7.8, 0.2, 0.6], [10, 1.8, 1.6], [14, 4.2, 0],
  ].map((p) => new THREE.Vector3(...p));
  const pts = BASE.map((p) => p.clone());
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);

  let SEG = lowPower ? 260 : 420;
  const ACROSS = 6;
  const WIDTH = 1.35;
  let geometry, pos;
  function build() {
    if (geometry) geometry.dispose();
    geometry = new THREE.BufferGeometry();
    const vCount = (SEG + 1) * (ACROSS + 1);
    pos = new Float32Array(vCount * 3);
    const uv = new Float32Array(vCount * 2);
    const idx = [];
    for (let i = 0; i <= SEG; i++) {
      for (let j = 0; j <= ACROSS; j++) {
        const k = i * (ACROSS + 1) + j;
        uv[k * 2] = i / SEG; uv[k * 2 + 1] = j / ACROSS;
        if (i < SEG && j < ACROSS) {
          const a = k, b = k + 1, c = k + ACROSS + 1, d = c + 1;
          idx.push(a, c, b, b, c, d);
        }
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.setIndex(idx);
    if (mesh) mesh.geometry = geometry;
  }
  let mesh = null;
  build();
  mesh = new THREE.Mesh(geometry, material);
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  const P = new THREE.Vector3(), D = new THREE.Vector3();
  function shape(t) {
    for (let i = 0; i < pts.length; i++) {
      const b = BASE[i];
      pts[i].set(
        b.x + Math.sin(t * 0.21 + i * 0.7) * 0.18,
        b.y + Math.sin(t * 0.47 + i * 0.9) * 0.32,
        b.z + Math.cos(t * 0.39 + i * 1.1) * 0.42,
      );
    }
    curve.updateArcLengths();
    const frames = curve.computeFrenetFrames(SEG, false);
    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG;
      curve.getPointAt(s, P);
      const n = frames.normals[i], bn = frames.binormals[i];
      const twist = s * Math.PI * 2.6 + Math.sin(s * 7 + t * 0.6) * 0.55 + t * 0.12;
      const c = Math.cos(twist), sn = Math.sin(twist);
      D.set(n.x * c + bn.x * sn, n.y * c + bn.y * sn, n.z * c + bn.z * sn);
      const w = WIDTH * (0.82 + 0.18 * Math.sin(s * 9 + t * 0.5));
      for (let j = 0; j <= ACROSS; j++) {
        const off = (j / ACROSS - 0.5) * w;
        const k = (i * (ACROSS + 1) + j) * 3;
        pos[k] = P.x + D.x * off; pos[k + 1] = P.y + D.y * off; pos[k + 2] = P.z + D.z * off;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }

  // Framing: wide screens keep the ribbon high and right so the headline stays clear;
  // tall phones shrink it into the upper half.
  let baseY = 0, baseX = 0;
  function layout() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const aspect = w / h;
    const s = Math.min(1, Math.max(0.36, aspect / 1.75));
    group.scale.setScalar(s);
    const visH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    baseY = aspect < 1 ? visH * 0.42 : visH * 0.16;
    baseX = aspect < 1 ? 0.2 : visH * aspect * 0.08;
  }
  layout();

  // Pointer parallax (desktop) and scroll drift
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  let scrollP = 0;
  const onScroll = () => { scrollP = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1))); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function pose() {
    cur.x += (target.x - cur.x) * 0.045;
    cur.y += (target.y - cur.y) * 0.045;
    group.rotation.y = cur.x * 0.12;
    group.rotation.x = cur.y * 0.08 + scrollP * 0.25;
    group.rotation.z = -scrollP * 0.18;
    group.position.set(baseX, baseY + scrollP * 2.4, -scrollP * 2);
  }

  const ready = () => {
    canvas.classList.add('is-ready');
    if (fallback) fallback.classList.add('is-hidden');
  };
  if (reduce) {
    shape(3.2); pose(); renderer.render(scene, camera); ready();
    new ResizeObserver(() => { layout(); pose(); renderer.render(scene, camera); }).observe(hero);
    return;
  }

  let running = false, inView = true, raf = 0, last = performance.now(), t = 3.2;
  let samples = 0, sum = 0, tuned = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    shape(t); pose();
    renderer.render(scene, camera);
    if (!tuned) {
      sum += dt; samples++;
      if (samples === 30) ready();
      if (samples >= 90) {
        tuned = true;
        if (sum / samples > 1 / 34) { // slower than ~34fps: drop resolution and detail
          dprCap = 1; renderer.setPixelRatio(1); SEG = 220; build(); layout();
        }
      }
    }
  }
  const play = () => { if (!running && inView && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? play() : stop(); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
  new ResizeObserver(() => layout()).observe(hero);
  play();
}

function streaks() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 1024;
  const g = c.getContext('2d');
  const base = g.createLinearGradient(0, 0, 0, c.height);
  base.addColorStop(0, '#a83200');
  base.addColorStop(0.18, '#f25200');
  base.addColorStop(0.5, '#ff6a10');
  base.addColorStop(0.82, '#f25200');
  base.addColorStop(1, '#a83200');
  g.fillStyle = base;
  g.fillRect(0, 0, c.width, c.height);
  const tones = ['#ffb23f', '#ff8a3d', '#e04800', '#ffd08a', '#c23800', '#ff7a1f'];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 220; i++) {
    g.globalAlpha = 0.25 + rnd() * 0.6;
    g.fillStyle = tones[(rnd() * tones.length) | 0];
    g.fillRect(0, rnd() * c.height, c.width, 1 + rnd() * 3.5);
  }
  g.globalAlpha = 1;
  return c;
}
