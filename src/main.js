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

// Hooded anime-noir skater heroine with a cigarette and skateboard.
const player = new THREE.Group();
const skin = mat(0xe2b49b), hair = mat(0x11131c), hoodie = mat(0x171c2a);
const hoodieFold = mat(0x30364a), trousers = mat(0x111722), shoe = mat(0x090d15);
const cigaretteMat = mat(0xe7dfd2);
const emberMat = new THREE.MeshStandardMaterial({color:0xff8b48,emissive:0xff4a16,emissiveIntensity:2.2});

const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.43,0.65,5,12),hoodie);
torso.position.set(0,1.47,0); torso.rotation.x=-0.12; player.add(torso);
const fold = new THREE.Mesh(new THREE.SphereGeometry(0.38,12,10),hoodieFold);
fold.scale.set(1,0.65,0.7); fold.position.set(0,1.42,0.22); player.add(fold);
const hood = new THREE.Mesh(new THREE.SphereGeometry(0.43,16,12),hoodie);
hood.scale.set(1.02,1.05,0.82); hood.position.set(0,2.28,-0.13); player.add(hood);
const face = new THREE.Mesh(new THREE.SphereGeometry(0.285,16,14),skin);
face.scale.set(0.92,1,0.8); face.position.set(0,2.27,0.12); player.add(face);
const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.31,16,12,0,Math.PI*2,0,Math.PI*0.62),hair);
hairCap.position.set(0,2.37,0.04); player.add(hairCap);
const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.2,12,8),hair);
fringe.scale.set(1.25,0.5,0.75); fringe.position.set(0,2.24,0.31); player.add(fringe);

// Cigarette at the corner of the mouth, with a small glowing tip.
const cigarette = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.24,8),cigaretteMat);
cigarette.rotation.z=Math.PI/2; cigarette.position.set(0.27,2.19,0.36); player.add(cigarette);
const ember = new THREE.Mesh(new THREE.SphereGeometry(0.035,8,8),emberMat);
ember.position.set(0.39,2.19,0.36); player.add(ember);

// Bent knees and a low, relaxed cruising stance.
for (const side of [-1,1]) {
  const leg = new THREE.Group(); leg.position.set(side*0.22,0.98,0);
  const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14,0.46,4,8),trousers);
  thigh.rotation.x=side*0.25; thigh.position.set(0,-0.22,0); leg.add(thigh);
  addBox(0.3,0.16,0.48,shoe,0,-0.58,side<0?0.1:-0.12,leg);
  player.add(leg);
}
const arms=[];
for (const side of [-1,1]) {
  const arm=new THREE.Group(); arm.position.set(side*0.39,1.68,0);
  const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(0.13,0.5,4,8),hoodie);
  sleeve.rotation.z=side*-0.24; sleeve.rotation.x=-0.12;
  sleeve.position.set(side*0.06,-0.25,0.03); arm.add(sleeve);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(0.105,10,8),skin);
  hand.position.set(side*0.12,-0.55,0.07); arm.add(hand);
  player.add(arm); arms.push(arm);
}

// Skateboard deck, trucks and four visible wheels.
const board=new THREE.Group();
const deck=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.12,1.82),mat(0x282a3c,0.48,0.25));
deck.position.y=0.24; board.add(deck);
const grip=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.018,1.65),mat(0x10131d));
grip.position.y=0.307; board.add(grip);
const truckMat=mat(0x9aa5b5,0.32,0.75), wheelMat=mat(0xd4c8bd,0.45,0.08), wheels=[];
for (const z of [-0.57,0.57]) {
  addBox(0.12,0.08,0.22,truckMat,0,0.13,z,board);
  for (const x of [-0.36,0.36]) {
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.11,14),wheelMat);
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


/* Original A-Del soundtrack player */
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

function audioTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}
function loadTrack(index, autoplay = false) {
  trackIndex = (index + playlist.length) % playlist.length;
  const track = playlist[trackIndex];
  soundtrack.src = './assets/audio/' + encodeURIComponent(track.file);
  trackName.textContent = track.title;
  seekControl.value = 0;
  timeLabel.textContent = '0:00 / 0:00';
  playButton.textContent = '▶';
  if (autoplay) startAudio();
}
function startAudio() {
  soundtrack.play().then(() => {
    playButton.textContent = 'Ⅱ';
    playButton.setAttribute('aria-label', 'Пауза');
  }).catch(() => {
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', 'Воспроизвести');
    trackName.textContent = playlist[trackIndex].title + ' · нажми ▶';
  });
}
function toggleAudio() {
  if (soundtrack.paused) startAudio();
  else {
    soundtrack.pause();
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', 'Воспроизвести');
  }
}
prevButton.addEventListener('click', () => loadTrack(trackIndex - 1, true));
nextButton.addEventListener('click', () => loadTrack(trackIndex + 1, true));
playButton.addEventListener('click', toggleAudio);
volumeControl.addEventListener('input', () => { soundtrack.volume = Number(volumeControl.value); });
seekControl.addEventListener('input', () => {
  if (Number.isFinite(soundtrack.duration)) soundtrack.currentTime = Number(seekControl.value) / 1000 * soundtrack.duration;
});
soundtrack.addEventListener('loadedmetadata', () => { timeLabel.textContent = '0:00 / ' + audioTime(soundtrack.duration); });
soundtrack.addEventListener('timeupdate', () => {
  if (Number.isFinite(soundtrack.duration) && soundtrack.duration > 0) {
    seekControl.value = Math.round(soundtrack.currentTime / soundtrack.duration * 1000);
    timeLabel.textContent = audioTime(soundtrack.currentTime) + ' / ' + audioTime(soundtrack.duration);
  }
});
soundtrack.addEventListener('ended', () => loadTrack(trackIndex + 1, true));
soundtrack.addEventListener('error', () => { trackName.textContent = playlist[trackIndex].title + ' · ошибка загрузки'; });
loadTrack(0, false);

document.querySelector('#enter').addEventListener('click', () => {
  started = true;
  document.querySelector('#intro').classList.add('hidden');
  toggleAudio();
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
