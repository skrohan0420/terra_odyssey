import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
  WebGLRenderer
} from "three";
import { MAX_RENDER_PIXEL_RATIO } from "../../config/graphicsConfig";

export function createRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_RENDER_PIXEL_RATIO));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = false;
  document.body.appendChild(renderer.domElement);

  return renderer;
}
