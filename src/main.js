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
import { loadPlayerState, savePlayerState } from "./player/playerState";
import { InspectorMode } from "./engine/debug/inspectorMode";


/* ========================= */
/*        SCENE SETUP        */
/* ========================= */

const scene = createScene();
const renderer = createRenderer();
const clock = new THREE.Clock();

/* ========================= */
/*          CAMERA           */
/* ========================= */

const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR_PALE,
    CAMERA_FAR_PALE
);


const state = loadPlayerState();

if (state) {
    camera.position.set(
        state.position.x,
        state.position.y,
        state.position.z
    );

    camera.rotation.set(
        state.rotation.x,
        state.rotation.y,
        state.rotation.z
    );
} else {
    camera.position.set(0, 40, 0);
    camera.lookAt(100, 0, 0);
}

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
    () => chunkManager.getLoadedChunkCount(),
    () => inspector.enabled
);

/* ========================= */
/*     WINDOW RESIZE         */
/* ========================= */

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const inspector = new InspectorMode(
    camera,
    controller,
    chunkManager
);

/* ========================= */
/*        ANIMATION LOOP     */
/* ========================= */
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    debug.begin();

    controller.update(delta);
    inspector.update(delta);

    if (!inspector.enabled) {
        chunkManager.update(camera.position);
    }
    savePlayerState(camera);

    renderer.render(scene, camera);

    debug.update();

    debug.end();
}

animate();