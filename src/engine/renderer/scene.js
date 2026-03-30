import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Scene,
  Vector3
} from "three";
import {
  HORIZON_FOG_END,
  HORIZON_FOG_START
} from "../../config/graphicsConfig";

const DEFAULT_SUN_DIRECTION = new Vector3(-0.5, 0.76, 0.41);

export function createScene(sunDirection = DEFAULT_SUN_DIRECTION) {
  const scene = new Scene();
  const skyColor = new Color(0x9ecbff);
  scene.background = skyColor;
  scene.fog = new Fog(skyColor, HORIZON_FOG_START, HORIZON_FOG_END);

  const sun = new DirectionalLight(0xffefc0, 1.45);
  sun.position.copy(sunDirection.clone().normalize().multiplyScalar(180));

  const skyLight = new HemisphereLight(0xd8efff, 0x7c644b, 1.1);
  const fillLight = new DirectionalLight(0xb7d3ff, 0.28);
  fillLight.position.set(70, 90, -80);

  scene.add(skyLight);
  scene.add(sun);
  scene.add(sun.target);
  scene.add(fillLight);

  return {
    scene,
    sunlight: sun
  };
}
