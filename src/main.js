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

// A small anime-inspired placeholder avatar. Final character art will replace this rig.
const player = new THREE.Group();
const skin = mat(0xe2b49b);
const hair = mat(0x171923);
const coat = mat(0x252a3d);
const coatLight = mat(0x3d4059);
const legsMat = mat(0x171d2b);
const shoe = mat(0x10131b);
addCylinder(0.42, 0.34, 0.95, coat, 0, 1.15, 0, player, 12);
const torso = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 12), coat);
torso.scale.set(0.95, 1.2, 0.72);
torso.position.y = 1.45;
player.add(torso);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 14), skin);
head.position.y = 2.25;
player.add(head);
const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), hair);
hairCap.position.set(0, 2.34, -0.015);
player.add(hairCap);
const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 8), hair);
fringe.scale.set(1.2, 0.55, 0.8);
fringe.position.set(0, 2.24, 0.22);
player.add(fringe);
for (const x of [-0.2, 0.2]) {
  addBox(0.22, 0.82, 0.25, legsMat, x, 0.48, 0, player);
  addBox(0.25, 0.13, 0.42, shoe, x, 0.08, 0.08, player);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.55, 4, 8), coatLight);
  arm.position.set(x * 2.7, 1.35, 0.02);
  arm.rotation.z = x < 0 ? -0.12 : 0.12;
  player.add(arm);
}
player.position.set(0, 0, 28);
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

document.querySelector('#enter').addEventListener('click', () => {
  started = true;
  document.querySelector('#intro').classList.add('hidden');
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
      const speed = (keys.ShiftLeft ? 5.0 : 2.6);
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
