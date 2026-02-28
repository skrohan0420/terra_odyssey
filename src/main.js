import * as THREE from "three";
import { createScene } from "./core/scene";
import { createRenderer } from "./core/renderer";
import { generateChunk } from "./world/chunk";
import { PlayerController } from "./player/controller";
import { DebugOverlay } from "./core/debugOverlay";
import {
    CAMERA_FOV,
    CAMERA_FAR_PALE,
    CAMERA_NEAR_PALE
} from "./config";

/* ========================= */
/*        SCENE SETUP        */
/* ========================= */

const scene = createScene();
const renderer = createRenderer();

/* ========================= */
/*          CAMERA           */
/* ========================= */

const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR_PALE,
    CAMERA_FAR_PALE
);

camera.position.set(0, 20, 400);

/* ========================= */
/*       WORLD GEN           */
/* ========================= */

const renderDistance = 4;

for (let x = -renderDistance; x < renderDistance; x++) {
    for (let z = -renderDistance; z < renderDistance; z++) {
        generateChunk(scene, x, z);
    }
}

/* ========================= */
/*        CONTROLLER         */
/* ========================= */

const controller = new PlayerController(
    camera,
    renderer.domElement
);

/* ========================= */
/*       DEBUG SYSTEM        */
/* ========================= */

const debug = new DebugOverlay(
    renderer,
    camera,
    () => (renderDistance) 
);

/* ========================= */
/*     WINDOW RESIZE         */
/* ========================= */

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ========================= */
/*        ANIMATION LOOP     */
/* ========================= */

function animate() {
    requestAnimationFrame(animate);

    debug.begin();

    controller.update();
    renderer.render(scene, camera);

    debug.update();

    debug.end();
}

animate();