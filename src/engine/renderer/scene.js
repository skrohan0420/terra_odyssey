import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(100, 200, 100);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  return scene;
}