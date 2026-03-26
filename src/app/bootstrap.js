import { createRenderer } from "../engine/renderer/renderer";
import { createScene } from "../engine/renderer/scene";
import {
  createStaticSky,
  getStaticSunDirection
} from "../engine/renderer/sky";
import {
  bindCameraResize,
  createCamera
} from "../engine/renderer/camera";
import { DebugOverlay } from "../engine/debug/debugOverlay";
import { InspectorMode } from "../engine/debug/inspectorMode";
import { startGameLoop } from "../engine/loop/gameLoop";
import { WorldMap } from "../gameplay/map/map";
import { loadPlayerState } from "../player/playerState";
import { PlayerController } from "../player/controller/playerController";
import { ChunkStreamingSystem } from "../systems/chunkStreamingSystem";
import { SaveSystem } from "../systems/saveSystem";
import { SystemManager } from "../systems/systemManager";
import { WORLD_RENDER_DISTANCE } from "../config/worldConfig";
import { ChunkManager } from "../world/chunk/chunkManager";

export function bootstrapGame() {
  const camera = createCamera(loadPlayerState());
  const sunDirection = getStaticSunDirection(camera);
  const { scene, sunlight } = createScene(sunDirection);
  const staticSky = createStaticSky(camera, sunlight, sunDirection);
  const renderer = createRenderer();

  bindCameraResize(camera, renderer);
  scene.add(staticSky.object);

  const chunkManager = new ChunkManager(scene, WORLD_RENDER_DISTANCE);
  const controller = new PlayerController(camera, renderer.domElement);
  const inspector = new InspectorMode(camera, controller, chunkManager);
  const worldMap = new WorldMap(
    () => chunkManager.getLoadedChunks(),
    () => camera.position,
    () => camera.quaternion
  );
  const debug = new DebugOverlay(
    renderer,
    camera,
    () => chunkManager.getLoadedChunkCount(),
    () => inspector.enabled
  );

  const systemManager = new SystemManager();
  systemManager.register(staticSky);
  systemManager.register(controller);
  systemManager.register(inspector);

  const chunkStreamingSystem = systemManager.register(
    new ChunkStreamingSystem(
      chunkManager,
      () => camera.position,
      () => inspector.enabled
    )
  );
  const saveSystem = systemManager.register(new SaveSystem(camera));

  const game = startGameLoop({
    scene,
    camera,
    renderer,
    debug,
    worldMap,
    systemManager,
    chunkStreamingSystem,
    saveSystem
  });

  return {
    game,
    scene,
    camera,
    renderer,
    controller,
    inspector,
    chunkManager,
    worldMap,
    debug,
    staticSky,
    systemManager,
    chunkStreamingSystem,
    saveSystem
  };
}
