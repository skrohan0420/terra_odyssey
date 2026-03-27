import { PerspectiveCamera } from "three";
import {
  CAMERA_FAR_PALE,
  CAMERA_FOV,
  CAMERA_NEAR_PALE,
  MAX_RENDER_PIXEL_RATIO
} from "../../config/graphicsConfig";
import { WORLD_BASE_HEIGHT } from "../../config/worldConfig";

export function createCamera(savedState) {
  const camera = new PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR_PALE,
    CAMERA_FAR_PALE
  );

  if (savedState) {
    camera.position.set(
      savedState.position.x,
      savedState.position.y,
      savedState.position.z
    );

    camera.rotation.set(
      savedState.rotation.x,
      savedState.rotation.y,
      savedState.rotation.z
    );

    return camera;
  }

  camera.position.set(0, WORLD_BASE_HEIGHT + 28, 0);
  camera.lookAt(100, WORLD_BASE_HEIGHT + 4, 0);

  return camera;
}

export function bindCameraResize(camera, renderer) {
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, MAX_RENDER_PIXEL_RATIO)
    );
  }

  window.addEventListener("resize", handleResize);
  handleResize();

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}
