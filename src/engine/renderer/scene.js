import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();
  const skyColor = new THREE.Color(0x9ecbff);
  scene.background = skyColor;
  scene.fog = new THREE.Fog(skyColor, 150, 250);

  const sun = new THREE.DirectionalLight(0xffefc0, 1.45);
  sun.position.set(-90, 140, 70);

  const skyLight = new THREE.HemisphereLight(0xd8efff, 0x7c644b, 1.1);
  const fillLight = new THREE.DirectionalLight(0xb7d3ff, 0.28);
  fillLight.position.set(70, 90, -80);

  scene.add(skyLight);
  scene.add(sun);
  scene.add(fillLight);

  return scene;
}
