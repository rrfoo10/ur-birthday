import * as THREE from "three";
import { OrbitControls } from "OrbitControls";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 70);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg"),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);

const starsGeometry = new THREE.BufferGeometry();

const starCount = 9000;

const positions = new Float32Array(starCount * 3);
const galaxyColors = new Float32Array(starCount * 3);

const galaxyCoreColor = new THREE.Color(0xffffff);
const galaxyMidColor = new THREE.Color(0xff2d6e);
const galaxyOuterColor = new THREE.Color(0x7a0030);

const GALAXY_RADIUS = 60;
const GALAXY_ARMS = 3;
const GALAXY_SPIN = 4.5;
const GALAXY_RANDOMNESS = 0.4;

for (let i = 0; i < starCount; i++) {

    const i3 = i * 3;

    const radius = Math.pow(Math.random(), 1.5) * GALAXY_RADIUS;

    const armAngle = (i % GALAXY_ARMS) * ((Math.PI * 2) / GALAXY_ARMS);
    const spinAngle = (radius / GALAXY_RADIUS) * GALAXY_SPIN;

    const randomness = GALAXY_RANDOMNESS * (radius / GALAXY_RADIUS);
    const randomX = (Math.random() - 0.5) * randomness * GALAXY_RADIUS * 0.3;
    const randomZ = (Math.random() - 0.5) * randomness * GALAXY_RADIUS * 0.3;
    const randomY = (Math.random() - 0.5) * 1.2;

    const angle = armAngle + spinAngle;

    positions[i3] = Math.cos(angle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(angle) * radius + randomZ;

    const t = radius / GALAXY_RADIUS;
    let mixedColor;

    if (t < 0.15) {
        mixedColor = galaxyCoreColor.clone().lerp(galaxyMidColor, t / 0.15);
    } else {
        mixedColor = galaxyMidColor.clone().lerp(galaxyOuterColor, (t - 0.15) / 0.85);
    }

    galaxyColors[i3] = mixedColor.r;
    galaxyColors[i3 + 1] = mixedColor.g;
    galaxyColors[i3 + 2] = mixedColor.b;

}

starsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);

starsGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(galaxyColors, 3)
);
const starsMaterial = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const stars = new THREE.Points(
    starsGeometry,
    starsMaterial
);

stars.position.y = -10;

scene.add(stars);

const galaxyCoreGeometry = new THREE.SphereGeometry(1.4, 32, 32);
const galaxyCoreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
});
const galaxyCore = new THREE.Mesh(galaxyCoreGeometry, galaxyCoreMaterial);
galaxyCore.position.y = -10;
scene.add(galaxyCore);

// نجوم خلفية متناثرة (سماء عامة، منفصلة عن قرص المجرة)
const bgStarsGeometry = new THREE.BufferGeometry();
const bgStarCount = 1500;
const bgStarPositions = new Float32Array(bgStarCount * 3);

for (let i = 0; i < bgStarCount * 3; i++) {
    bgStarPositions[i] = (Math.random() - 0.5) * 300;
}

bgStarsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(bgStarPositions, 3)
);

const bgStarsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false
});

const bgStars = new THREE.Points(bgStarsGeometry, bgStarsMaterial);

scene.add(bgStars);
const light = new THREE.PointLight(0xff6ea8, 80, 300);

light.position.set(0, 0, 0);

scene.add(light);

const heartGroup = new THREE.Group();

scene.add(heartGroup);

const HEART_COUNT = 12000;
const HEART_SCALE = 13 ;        // كبر القلب (تكبير عام)
const HEART_WIDTH_FACTOR = 0.92; // نضغط العرض شوي عشان يصير القلب أنحف وأطول
const FORM_DURATION = 40.0;      // مدة التكوّن بالثواني

function heartPoint() {

    const t = Math.random() * Math.PI * 2;

    const onOutline = Math.random() < 0.8;

    let r;
    if (onOutline) {
        r = 0.985 + Math.random() * 0.02;
    } else {
        r = Math.random() * 0.9;
    }

    let x = 16 * Math.pow(Math.sin(t), 3);
    let y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

   x *= r * HEART_WIDTH_FACTOR;
    y *= r;

    const z = onOutline
        ? (Math.random() - 0.5) * 0.5
        : (Math.random() - 0.5) * 1.8;

    return {
        x: (x * 0.1) * HEART_SCALE,
        y: (y * 0.1 + 1) * HEART_SCALE,
        z: z * HEART_SCALE,
        onOutline
    };
}
const heartGeometry = new THREE.BufferGeometry();

const heartCurrentPositions = new Float32Array(HEART_COUNT * 3);
const heartTargetPositions = new Float32Array(HEART_COUNT * 3);
const heartBasePositions = new Float32Array(HEART_COUNT * 3);

const heartColors = new Float32Array(HEART_COUNT * 3);

const colorOutline = new THREE.Color(0xff1f5e);
const colorGlow = new THREE.Color(0xffffff);
const colorInside = new THREE.Color(0xff6f91);

for (let i = 0; i < HEART_COUNT; i++) {

    const i3 = i * 3;

    const startRadius = 25 + Math.random() * 35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    heartCurrentPositions[i3] = startRadius * Math.sin(phi) * Math.cos(theta);
    heartCurrentPositions[i3 + 1] = startRadius * Math.sin(phi) * Math.sin(theta);
    heartCurrentPositions[i3 + 2] = startRadius * Math.cos(phi);

    const p = heartPoint();

    heartTargetPositions[i3] = p.x;
    heartTargetPositions[i3 + 1] = p.y;
    heartTargetPositions[i3 + 2] = p.z;

    heartBasePositions[i3] = p.x;
    heartBasePositions[i3 + 1] = p.y;
    heartBasePositions[i3 + 2] = p.z;

    if (p.onOutline) {
        const mixedColor = colorOutline.clone().lerp(colorGlow, Math.random() * 0.04);

        heartColors[i3] = mixedColor.r;
        heartColors[i3 + 1] = mixedColor.g;
        heartColors[i3 + 2] = mixedColor.b;
    } else {
        const mixedColor = colorInside.clone();

        heartColors[i3] = mixedColor.r;
        heartColors[i3 + 1] = mixedColor.g;
        heartColors[i3 + 2] = mixedColor.b;

    }

}

heartGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(heartCurrentPositions, 3)
);

heartGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(heartColors, 3)
);

const heartMaterial = new THREE.PointsMaterial({
    size: 0.11,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const heartPoints = new THREE.Points(heartGeometry, heartMaterial);

heartGroup.add(heartPoints);

let heartFormStartTime = null;
let heartFormed = false;

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;

controls.enablePan = false;

controls.minDistance = 25;
controls.maxDistance = 110;

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

});

function animate(){

    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    controls.update();

    stars.rotation.y += 0.0009;
      bgStars.rotation.y += 0.00003;

    light.intensity = 80 + Math.sin(t * 0.6) * 8;

    if (heartFormStartTime !== null) {

        const elapsed = t - heartFormStartTime;
        const posAttr = heartGeometry.attributes.position;

        if (!heartFormed) {

            const progress = Math.min(elapsed / FORM_DURATION, 1);
            const eased = easeOutCubic(progress);

            for (let i = 0; i < HEART_COUNT; i++) {

                const i3 = i * 3;

                posAttr.array[i3] = THREE.MathUtils.lerp(
                    posAttr.array[i3],
                    heartTargetPositions[i3],
                    eased * 0.12 + 0.02
                );

                posAttr.array[i3 + 1] = THREE.MathUtils.lerp(
                    posAttr.array[i3 + 1],
                    heartTargetPositions[i3 + 1],
                    eased * 0.12 + 0.02
                );

                posAttr.array[i3 + 2] = THREE.MathUtils.lerp(
                    posAttr.array[i3 + 2],
                    heartTargetPositions[i3 + 2],
                    eased * 0.12 + 0.02
                );

            }

            posAttr.needsUpdate = true;

            if (progress >= 1) {
                heartFormed = true;
            }

        } else {

            const pulse = 1 + Math.sin((elapsed - FORM_DURATION) * 2.2) * 0.045;

            for (let i = 0; i < HEART_COUNT; i++) {

                const i3 = i * 3;

                posAttr.array[i3] = heartBasePositions[i3] * pulse;
                posAttr.array[i3 + 1] = heartBasePositions[i3 + 1] * pulse;
                posAttr.array[i3 + 2] = heartBasePositions[i3 + 2] * pulse;

            }

            posAttr.needsUpdate = true;

            heartGroup.rotation.y += 0.0025;

        }

    }

    renderer.render(scene, camera);

}
const clock = new THREE.Clock();

animate();
// =========================
// Orbit Words
// =========================

const orbitItems = document.querySelectorAll(".orbit-item");

const orbitRadius = 220;
let orbitRotation = 0;

function animateOrbit() {

    orbitRotation += 0.002;

    orbitItems.forEach((item, index) => {

        const angle =
            orbitRotation +
            (index / orbitItems.length) * Math.PI * 2;

        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius;

        item.style.left = `calc(50% + ${x}px)`;
        item.style.top = `calc(50% + ${y}px)`;

    });

    requestAnimationFrame(animateOrbit);

}

animateOrbit();
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("startBtn");
const music = document.getElementById("music");

music.volume = 0.3;

startBtn.addEventListener("click", () => {

    music.play();

    startScreen.style.opacity = "0";

    heartFormStartTime = clock.getElapsedTime();

    setTimeout(() => {

        startScreen.style.display = "none";

    }, 700);

});

scene.add(bgStars);
// ===== نجوم أرضية تحت المجرة =====

// ===== Pink Floor Stars =====

const floorGeometry = new THREE.BufferGeometry();
const floorCount = 12000;

const floorPositions = new Float32Array(floorCount * 3);

for (let i = 0; i < floorCount; i++) {

    const i3 = i * 3;

   const angle = Math.random() * Math.PI * 2;
const radius = Math.sqrt(Math.random()) * 90;

floorPositions[i3] = Math.cos(angle) * radius;
floorPositions[i3 + 2] = Math.sin(angle) * radius;
    // تحت المجرة
    floorPositions[i3 + 1] = -16 + (Math.random() - 0.5) * 1.2;
    

}

floorGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(floorPositions, 3)
);

const floorMaterial = new THREE.PointsMaterial({
    color: 0xff8fd8,
    size: 0.2,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const floorStars = new THREE.Points(
    floorGeometry,
    floorMaterial
);

scene.add(floorStars);