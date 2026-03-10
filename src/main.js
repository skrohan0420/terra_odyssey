import * as THREE from "three";
import { createScene } from "./engine/renderer/scene";
import { createRenderer } from "./engine/renderer/renderer";
import { PlayerController } from "./player/controller/playerController";
import { DebugOverlay } from "./engine/debug/debugOverlay";
import {
    CAMERA_FOV,
    CAMERA_FAR_PALE,
    CAMERA_NEAR_PALE
} from "./config/config";
import { ChunkManager } from "./world/chunk/chunkManager";

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

camera.position.set(0, 40, 0);
// camera.lookAt(0, 0, 0);

/* ========================= */
/*       WORLD GEN           */
/* ========================= */

const renderDistance = 8;

const chunkManager = new ChunkManager(scene, renderDistance);

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
    () => chunkManager.getLoadedChunkCount()
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

    chunkManager.update(camera.position);

    renderer.render(scene, camera);

    debug.update();

    debug.end();
}

animate();