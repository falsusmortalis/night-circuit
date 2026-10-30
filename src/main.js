import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const mount = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101629);
scene.fog = new THREE.FogExp2(0x101629, 0.012);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9db9e8, 0x211b2b, 1.7));
const moon = new THREE.DirectionalLight(0xa8c7ff, 1.8);
moon.position.set(-35, 55, 20);
scene.add(moon);
const warmGlow = new THREE.PointLight(0xffa66f, 75, 90);
warmGlow.position.set(4, 9, -15);
scene.add(warmGlow);
const cyanGlow = new THREE.PointLight(0x4b9fc4, 65, 100);
cyanGlow.position.set(-28, 8, -35);
scene.add(cyanGlow);

const mat = (color, roughness = 0.82, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const concrete = mat(0x343b4b);
const darkStone = mat(0x202b3b);
const facade = [0x555365, 0x625b62, 0x394657, 0x74666a].map(c => mat(c));
const glass = new THREE.MeshStandardMaterial({ color: 0x243b55, roughness: 0.2, metalness: 0.45 });
const windowWarm = new THREE.MeshStandardMaterial({ color: 0xffbd83, emissive: 0xff793b, emissiveIntensity: 1.35 });
const neonPink = new THREE.MeshStandardMaterial({ color: 0xff79b8, emissive: 0xb52b79, emissiveIntensity: 1.5 });
const neonBlue = new THREE.MeshStandardMaterial({ color: 0x69c9ef, emissive: 0x247da8, emissiveIntensity: 1.3 });

function addBox(w, h, d, material, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function addCylinder(rt, rb, h, material, x, y, z, parent = scene, sides = 10) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

// Compact coastal promenade: sea on the left, old low-rise street on the right.
addBox(260, 0.35, 260, mat(0x17212e), 0, -0.45, 0);
const sea = new THREE.Mesh(new THREE.PlaneGeometry(240, 210), new THREE.MeshStandardMaterial({
  color: 0x102c43, roughness: 0.22, metalness: 0.42, emissive: 0x061321, emissiveIntensity: 0.35
}));
sea.rotation.x = -Math.PI / 2;
sea.position.set(-75, -0.18, -38);
scene.add(sea);
addBox(34, 0.35, 180, mat(0x4b4b59), -3, -0.1, -25); // promenade
addBox(2.4, 0.6, 180, mat(0x77727b), -20.5, 0.05, -25); // sea wall
addBox(26, 0.28, 180, mat(0x252b37), 26, -0.12, -25); // street
for (let z = -110; z < 70; z += 12) {
  addBox(0.12, 0.025, 5, mat(0x9a8790), 25, 0.04, z);
}

// Distant dark hills and a restrained historic skyline.
const hillMat = mat(0x202a3b);
for (let i = 0; i < 9; i++) {
  const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), hillMat);
  hill.scale.set(20 + (i % 3) * 8, 8 + (i % 4) * 3, 15);
  hill.position.set(-100 + i * 25, 3 + (i % 3) * 2, -112 - (i % 2) * 8);
  scene.add(hill);
}
const towerMat = mat(0x514b50);
const tower = new THREE.Group();
addCylinder(3.5, 4.3, 12, towerMat, 0, 6, 0, tower, 12);
const crown = new THREE.Mesh(new THREE.ConeGeometry(4.5, 4, 12), mat(0x292d3b));
crown.position.y = 14;
tower.add(crown);
tower.position.set(-76, 0, -92);
scene.add(tower);

// Street-facing buildings: varied heights, balconies, lit windows and rooftop silhouettes.
for (let i = 0; i < 13; i++) {
  const z = -104 + i * 14;
  const width = 8 + (i % 3) * 2;
  const height = 9 + (i % 4) * 2.4;
  const x = 42 + (i % 2) * 3;
  const building = new THREE.Group();
  addBox(width, height, 10, facade[i % facade.length], 0, height / 2, 0, building);
  addBox(width + 0.5, 0.35, 10.5, darkStone, 0, height, 0, building);
  for (let floor = 1; floor < Math.floor(height / 2.8); floor++) {
    for (let col = 0; col < 2; col++) {
      const wx = col ? 2.1 : -2.1;
      addBox(1.15, 1.45, 0.12, (i + floor + col) % 4 === 0 ? neonBlue : windowWarm,
        wx, floor * 2.7, 5.08, building);
      addBox(1.5, 0.12, 0.55, darkStone, wx, floor * 2.7 - 0.8, 5.25, building);
    }
  }
  building.position.set(x, 0, z);
  scene.add(building);
  if (i % 3 === 0) {
    const sign = addBox(3.2, 0.7, 0.2, i % 2 ? neonPink : neonBlue, x - 1, 2.8, z + 5.2);
  }
}

// Pools of warm light along the sea wall.
for (let z = -95; z < 70; z += 23) {
  const pole = addCylinder(0.12, 0.18, 5.2, darkStone, -16.8, 2.6, z);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), windowWarm);
  lamp.position.set(-16.8, 5.3, z);
  scene.add(lamp);
  const light = new THREE.PointLight(0xffa56c, 16, 19);
  light.position.set(-16.8, 5.1, z);
  scene.add(light);
}

// Stylized anime skater: layered oversized hoodie, flowing hair, expressive pose and detailed deck.
const player = new THREE.Group();
const skin = mat(0xe6b7a2, 0.72), hair = mat(0x11121d, 0.48), hairLight = mat(0x332638, 0.5);
const hoodie = mat(0x171b29, 0.88), hoodieEdge = mat(0x34394b, 0.8);
const trousers = mat(0x101522, 0.92), shoe = mat(0x090d16, 0.72);
const sole = mat(0xc2b5ad, 0.8), cigaretteMat = mat(0xe7dfd2);
const emberMat = new THREE.MeshStandardMaterial({color:0xffa05a,emissive:0xff4a16,emissiveIntensity:3});
const metal = mat(0x9aa5b5, 0.32, 0.75);

function ellipsoid(parent, material, pos, scale, segments=20) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, Math.floor(segments*0.7))), material);
  m.position.set(...pos); m.scale.set(...scale); parent.add(m); return m;
}
function limb(parent, a, b, radius, material, radius2=radius) {
  const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b);
  const delta = bv.clone().sub(av);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius2, radius, delta.length(), 12, 1), material);
  m.position.copy(av).add(bv).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), delta.normalize());
  parent.add(m);
  ellipsoid(parent, material, a, [radius,radius,radius], 12);
  ellipsoid(parent, material, b, [radius2,radius2,radius2], 12);
  return m;
}
function tube(parent, points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, radius, 7, false), material);
  parent.add(mesh); return mesh;
}

// Torso leans into the ride; sculpted hoodie silhouette and hood.
const torso = ellipsoid(player, hoodie, [0,1.48,0], [0.55,0.72,0.38], 24);
torso.rotation.x = -0.13;
ellipsoid(player, hoodieEdge, [0,1.08,0.015], [0.54,0.18,0.39], 20);
ellipsoid(player, hoodie, [0,2.08,-0.12], [0.46,0.46,0.43], 24); // hood behind head
ellipsoid(player, hoodieEdge, [0,2.11,-0.40], [0.34,0.35,0.10], 20);
ellipsoid(player, skin, [0,2.17,0.17], [0.31,0.39,0.28], 24);

// Long dark hair: crown, side locks and wind-swept strands.
ellipsoid(player, hair, [0,2.43,0.02], [0.36,0.37,0.34], 24);
for (const s of [-1,1]) {
  const lock = ellipsoid(player, hair, [s*0.29,2.03,-0.02], [0.17,0.57,0.19], 18);
  lock.rotation.z = s*0.13;
  const rear = ellipsoid(player, hair, [s*0.20,1.87,-0.32], [0.19,0.68,0.14], 16);
  rear.rotation.z = s*0.22;
  tube(player, [[s*0.25,2.28,-0.15],[s*0.40,2.05,-0.20],[s*0.46,1.78,-0.35],[s*0.52,1.52,-0.48]], 0.035, hairLight);
}
ellipsoid(player, hair, [0,2.25,0.36], [0.34,0.18,0.12], 18); // fringe
// A few separated locks give the silhouette a hand-shaped anime look.
tube(player, [[-0.18,2.48,0.22],[-0.32,2.26,0.35],[-0.30,2.04,0.40]], 0.045, hairLight);
tube(player, [[0.08,2.52,0.24],[0.23,2.30,0.36],[0.18,2.10,0.43]], 0.04, hairLight);

// Face details, mostly glimpsed when the camera swings around.
for (const s of [-1,1]) {
  ellipsoid(player, hair, [s*0.13,2.22,0.405], [0.075,0.025,0.025], 12);
  ellipsoid(player, mat(0xf0d7c7), [s*0.13,2.20,0.424], [0.052,0.012,0.012], 10);
}
ellipsoid(player, mat(0x8e4f55), [0.02,2.02,0.43], [0.055,0.018,0.018], 10);

// Hoodie pocket, drawstrings, seams and cuffs.
addBox(0.52,0.24,0.035,hoodieEdge,0,1.25,0.365,player);
for (const s of [-1,1]) {
  tube(player, [[s*0.10,1.95,0.34],[s*0.12,1.68,0.39],[s*0.10,1.40,0.40]], 0.012, hoodieEdge);
  ellipsoid(player, metal, [s*0.10,1.38,0.405], [0.025,0.035,0.018], 10);
}

// Crouched legs, baggy trousers and chunky skate shoes.
const legPivots = [];
for (const s of [-1,1]) {
  const leg = new THREE.Group(); leg.position.set(s*0.22,1.02,0.02); player.add(leg); legPivots.push(leg);
  limb(leg, [0,0,0], [s*0.07,-0.39,0.18], 0.20, trousers, 0.17);
  limb(leg, [s*0.07,-0.39,0.18], [s*0.10,-0.68,0.34], 0.16, trousers, 0.14);
  ellipsoid(leg, shoe, [s*0.10,-0.72,0.46], [0.20,0.12,0.34], 16);
  ellipsoid(leg, sole, [s*0.10,-0.80,0.46], [0.205,0.045,0.34], 16);
  for(let n=0;n<3;n++) tube(leg, [[s*0.10-0.10,-0.69+n*0.035,0.56],[s*0.10,-0.66+n*0.035,0.62],[s*0.10+0.10,-0.69+n*0.035,0.56]],0.012,sole);
}

// One arm reaches out for balance; the other is bent up with a cigarette.
const arms = [];
const armBalance = new THREE.Group(); armBalance.position.set(-0.45,1.83,0); player.add(armBalance); arms.push(armBalance);
limb(armBalance,[0,0,0],[-0.30,-0.20,-0.03],0.19,hoodie,0.15);
limb(armBalance,[-0.30,-0.20,-0.03],[-0.56,-0.30,-0.10],0.15,hoodie,0.12);
ellipsoid(armBalance,skin,[-0.59,-0.31,-0.10],[0.10,0.11,0.10],12);
const armSmoke = new THREE.Group(); armSmoke.position.set(0.43,1.86,0.02); player.add(armSmoke); arms.push(armSmoke);
limb(armSmoke,[0,0,0],[0.26,0.22,0.06],0.19,hoodie,0.16);
limb(armSmoke,[0.26,0.22,0.06],[0.30,0.53,0.20],0.16,hoodie,0.12);
ellipsoid(armSmoke,skin,[0.31,0.57,0.22],[0.105,0.12,0.09],12);
// Cigarette held between two fingers, ember visible in the night.
const cigarette = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.22,8),cigaretteMat);
cigarette.rotation.z = -0.30; cigarette.rotation.x = 0.55; cigarette.position.set(0.40,0.69,0.28); armSmoke.add(cigarette);
const ember = new THREE.Mesh(new THREE.SphereGeometry(0.028,10,8),emberMat);
ember.position.set(0.47,0.72,0.34); armSmoke.add(ember);

// Skateboard with a graphic underside, trucks, wheels and grip tape.
const board = new THREE.Group();
const deck = new THREE.Mesh(new THREE.BoxGeometry(0.68,0.12,1.92),mat(0x262537,0.42,0.25));
deck.position.y=0.24; board.add(deck);
const underside = new THREE.Mesh(new THREE.BoxGeometry(0.64,0.025,1.76),mat(0x8a365f,0.5,0.12));
underside.position.y=0.17; board.add(underside);
const grip = new THREE.Mesh(new THREE.BoxGeometry(0.59,0.018,1.72),mat(0x10131d));
grip.position.y=0.307; board.add(grip);
tube(board,[[-0.20,0.32,-0.62],[0,0.325,0],[0.20,0.32,0.62]],0.018,neonPink);
const wheels=[];
for (const z of [-0.62,0.62]) {
  addBox(0.12,0.08,0.22,metal,0,0.13,z,board);
  for (const x of [-0.37,0.37]) {
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.12,16),mat(0xd7c7c4,0.42,0.08));
    wheel.rotation.z=Math.PI/2; wheel.position.set(x,0.14,z); board.add(wheel); wheels.push(wheel);
  }
}
player.add(board);
player.position.set(0,0,28);
scene.add(player);
// Camera follows behind the avatar; drag/touch rotates the view around the character.
let yaw = 0;
let cameraPitch = 0.16;
let moveX = 0;
let moveZ = 0;
let started = false;
const keys = {};
addEventListener('keydown', e => { keys[e.code] = true; });
addEventListener('keyup', e => { keys[e.code] = false; });
let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
renderer.domElement.addEventListener('pointerdown', e => {
  dragging = true; lastPointerX = e.clientX; lastPointerY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener('pointerup', () => dragging = false);
renderer.domElement.addEventListener('pointercancel', () => dragging = false);
renderer.domElement.addEventListener('pointermove', e => {
  if (!dragging || !started) return;
  yaw -= (e.clientX - lastPointerX) * 0.004;
  cameraPitch = THREE.MathUtils.clamp(cameraPitch + (e.clientY - lastPointerY) * 0.002, -0.05, 0.55);
  lastPointerX = e.clientX; lastPointerY = e.clientY;
});


/* Author soundtrack — tracks are loaded from assets/audio. */
const playlist = [
  { title: '2 · Безликий', file: '2 безликий.mp3' },
  { title: '3 · Pure', file: '3 Pure.mp3' },
  { title: '4 · Медленно', file: '4 медленно.mp3' },
  { title: '5 · Не верю', file: '5 не верю.mp3' },
  { title: '6 · Неоном по коже', file: '6 неоном по коже.mp3' },
  { title: '7 · Память', file: '7 память.mp3' }
];
const soundtrack = new Audio();
soundtrack.preload = 'metadata';
soundtrack.volume = 0.55;
let trackIndex = 0;
const trackName = document.querySelector('#track-name');
const playButton = document.querySelector('#audio-play');
const prevButton = document.querySelector('#audio-prev');
const nextButton = document.querySelector('#audio-next');
const volumeControl = document.querySelector('#audio-volume');
const seekControl = document.querySelector('#audio-seek');
const timeLabel = document.querySelector('#audio-time');

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
function loadTrack(index, autoplay = false) {
  trackIndex = (index + playlist.length) % playlist.length;
  const track = playlist[trackIndex];
  soundtrack.src = './assets/audio/' + encodeURIComponent(track.file);
  trackName.textContent = track.title;
  seekControl.value = 0;
  timeLabel.textContent = '0:00 / 0:00';
  if (autoplay) {
    soundtrack.play().then(() => {
      playButton.textContent = 'Ⅱ';
      playButton.setAttribute('aria-label', 'Пауза');
    }).catch(() => {
      playButton.textContent = '▶';
      playButton.setAttribute('aria-label', 'Воспроизвести');
      trackName.textContent = track.title + ' · нажми ▶';
    });
  } else {
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', 'Воспроизвести');
  }
}
function togglePlayback() {
  if (!soundtrack.src) loadTrack(trackIndex, false);
  if (soundtrack.paused) {
    soundtrack.play().then(() => {
      playButton.textContent = 'Ⅱ';
      playButton.setAttribute('aria-label', 'Пауза');
    }).catch(() => {
      trackName.textContent = playlist[trackIndex].title + ' · не удалось загрузить';
    });
  } else {
    soundtrack.pause();
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', 'Воспроизвести');
  }
}
prevButton.addEventListener('click', () => loadTrack(trackIndex - 1, true));
nextButton.addEventListener('click', () => loadTrack(trackIndex + 1, true));
playButton.addEventListener('click', togglePlayback);
volumeControl.addEventListener('input', () => { soundtrack.volume = Number(volumeControl.value); });
seekControl.addEventListener('input', () => {
  if (Number.isFinite(soundtrack.duration)) {
    soundtrack.currentTime = Number(seekControl.value) / 1000 * soundtrack.duration;
  }
});
soundtrack.addEventListener('loadedmetadata', () => {
  timeLabel.textContent = `0:00 / ${formatTime(soundtrack.duration)}`;
});
soundtrack.addEventListener('timeupdate', () => {
  if (Number.isFinite(soundtrack.duration) && soundtrack.duration > 0) {
    seekControl.value = Math.round(soundtrack.currentTime / soundtrack.duration * 1000);
    timeLabel.textContent = `${formatTime(soundtrack.currentTime)} / ${formatTime(soundtrack.duration)}`;
  }
});
soundtrack.addEventListener('ended', () => loadTrack(trackIndex + 1, true));
soundtrack.addEventListener('error', () => {
  trackName.textContent = playlist[trackIndex].title + ' · ошибка загрузки';
  playButton.textContent = '▶';
});
loadTrack(0, false);

document.querySelector('#enter').addEventListener('click', () => {
  started = true;
  document.querySelector('#intro').classList.add('hidden');
  togglePlayback();
  document.querySelector('#status').style.opacity = 1;
});

const zone = document.querySelector('#stickzone');
const stick = document.querySelector('#stick');
let stickPointer = null;
function updateStick(e) {
  const r = zone.getBoundingClientRect();
  const dx = e.clientX - r.left - r.width / 2;
  const dy = e.clientY - r.top - r.height / 2;
  const len = Math.hypot(dx, dy);
  const scale = Math.min(1, 40 / (len || 1));
  moveX = dx * scale / 40;
  moveZ = dy * scale / 40;
  stick.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
}
zone.addEventListener('pointerdown', e => {
  stickPointer = e.pointerId; zone.setPointerCapture(stickPointer); updateStick(e);
});
zone.addEventListener('pointermove', e => { if (e.pointerId === stickPointer) updateStick(e); });
function resetStick() {
  stickPointer = null; moveX = moveZ = 0; stick.style.transform = 'translate(0,0)';
}
zone.addEventListener('pointerup', resetStick);
zone.addEventListener('pointercancel', resetStick);

const cameraTarget = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
let previous = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - previous) / 1000, 0.04);
  previous = now;

  if (started) {
    const forwardInput = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - moveZ;
    const sideInput = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + moveX;
    const inputLength = Math.hypot(forwardInput, sideInput);
    if (inputLength > 0.08) {
      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      const direction = forward.multiplyScalar(forwardInput).add(right.multiplyScalar(sideInput)).normalize();
      const speed = (keys.ShiftLeft ? 7.0 : 4.2);
      player.position.addScaledVector(direction, speed * dt);
      player.rotation.y = Math.atan2(direction.x, direction.z);
      player.position.x = THREE.MathUtils.clamp(player.position.x, -17, 36);
      player.position.z = THREE.MathUtils.clamp(player.position.z, -112, 68);
      player.position.y = Math.abs(Math.sin(now * 0.012)) * 0.045;
    } else {
      player.position.y = THREE.MathUtils.damp(player.position.y, 0, 8, dt);
    }
  }

  cameraTarget.set(player.position.x, player.position.y + 1.45, player.position.z);
  const distance = 7.8;
  desiredCamera.set(
    cameraTarget.x + Math.sin(yaw) * distance,
    cameraTarget.y + 3.0 + cameraPitch * 3,
    cameraTarget.z + Math.cos(yaw) * distance
  );
  camera.position.lerp(desiredCamera, 1 - Math.exp(-5 * dt));
  camera.lookAt(cameraTarget);
  sea.position.z = -38 + Math.sin(now * 0.00025) * 0.12;
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.7));
  renderer.setSize(innerWidth, innerHeight);
});
