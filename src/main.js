import * as THREE from "three";
import { createScene } from "./core/scene";
import { createRenderer } from "./core/renderer";
import { PlayerController } from "./player/controller";
import { DebugOverlay } from "./core/debugOverlay";
import {
    CAMERA_FOV,
    CAMERA_FAR_PALE,
    CAMERA_NEAR_PALE
} from "./config";
import { ChunkManager } from "./world/chunkManager";

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

camera.position.set(0, 130, 0);
// camera.lookAt(0, 0, 0);

/* ========================= */
/*       WORLD GEN           */
/* ========================= */

const renderDistance = 16;

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