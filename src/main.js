import * as THREE from "three";
import { createScene } from "./engine/renderer/scene";
import { createRenderer } from "./engine/renderer/renderer";
import { PlayerController } from "./player/controller/playerController";
import { DebugOverlay } from "./engine/debug/debugOverlay";
import {
    CAMERA_FOV,
    CAMERA_FAR_PALE,
    CAMERA_NEAR_PALE,
    MAX_RENDER_PIXEL_RATIO,
    WORLD_RENDER_DISTANCE
} from "./config/config";
import { ChunkManager } from "./world/chunk/chunkManager";
import { loadPlayerState } from "./player/playerState";
import { InspectorMode } from "./engine/debug/inspectorMode";
import { WorldMap } from "./gameplay/map/map";
import { startGameLoop } from "./engine/loop/gameLoop";

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

const renderDistance = WORLD_RENDER_DISTANCE;
const chunkManager = new ChunkManager(scene, renderDistance);

/* ========================= */
/*        CONTROLLER         */
/* ========================= */

const controller = new PlayerController(
    camera,
    renderer.domElement
);

/* ========================= */
/*       INSPECTOR           */
/* ========================= */

const inspector = new InspectorMode(
    camera,
    controller,
    chunkManager
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
/*         WORLD MAP         */
/* ========================= */

const worldMap = new WorldMap(
    () => chunkManager.getLoadedChunks(),
    () => camera.position
);

/* ========================= */
/*     WINDOW RESIZE         */
/* ========================= */

function setupResize(camera, renderer) {
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_RENDER_PIXEL_RATIO));
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // run once on start
}

setupResize(camera, renderer);

/* ========================= */
/*        GAME LOOP          */
/* ========================= */

const game = startGameLoop({
    scene,
    camera,
    renderer,
    controller,
    inspector,
    chunkManager,
    worldMap,
    debug
});

game.start();

