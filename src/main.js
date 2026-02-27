import * as THREE from "three";
import { createScene } from "./core/scene";
import { createRenderer } from "./core/renderer";
import Stats from "stats.js";
import { generateChunk } from "./world/chunk";
import { PlayerController } from "./player/controller";
import { CAMERA_FOV, CAMERA_FAR_PALE, CAMERA_NEAR_PALE } from "./config"

const scene = createScene();
const renderer = createRenderer();

const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR_PALE,
    CAMERA_FAR_PALE
);

camera.position.set(0, 20, 400);

const renderDistance = 16;

for (let x = -renderDistance; x < renderDistance; x++) {
    for (let z = -renderDistance; z < renderDistance; z++) {
        generateChunk(scene, x, z);
    }
}
const controller = new PlayerController(
    camera,
    renderer.domElement
);
// add FPS stats (stats.js)
const stats = new Stats();

// simple renderer info overlay
const infoEl = document.createElement("div");
infoEl.style.cssText = `
    position: absolute;
    left: 10px;
    bottom: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    color: #00ff6a;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.6;
    letter-spacing: 0.5px;
    z-index: 1000;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    font-weight: bold;
`;
document.body.appendChild(infoEl);

// lightweight fps counter (for display alongside stats.js)
let fps = 0;
function updateInfo() {
    const r = renderer.info;

    const drawCalls = r.render.calls;
    const triangles = r.render.triangles;
    const geometries = r.memory.geometries;
    const textures = r.memory.textures;

    // Color FPS
    let fpsColor = "#00ff88";
    if (fps < 50) fpsColor = "#ffff00";
    if (fps < 30) fpsColor = "#ff4444";

    infoEl.innerHTML = `
        <div>FPS: <span style="color: lightblue">${fps}<span></div>
        <div>Draw Calls: <span style="color: lightblue">${drawCalls}<span></div>
        <div>Triangles: <span style="color: lightblue">${triangles.toLocaleString()}<span></div>
        <div>Geometries: <span style="color: lightblue">${geometries}<span></div>
        <div>Textures: <span style="color: lightblue">${textures}<span></div>
        <div>Camera: <span style="color: lightblue">${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)}<span></div>
        <div>Chunks: <span style="color: lightblue">${(renderDistance * 2) ** 2}<span></div>
    `;
}
let frames = 0;
let lastTime = performance.now();

function updateFpsCounter() {
    frames++;
    const now = performance.now();
    const delta = now - lastTime;

    if (delta >= 100) {
        fps = Math.round((frames * 1000) / delta);
        frames = 0;
        lastTime = now;
    }
}

function animate() {
    requestAnimationFrame(animate);

    stats.begin();

    controller.update();
    renderer.render(scene, camera);

    updateFpsCounter();
    updateInfo();

    stats.end();
}

animate();