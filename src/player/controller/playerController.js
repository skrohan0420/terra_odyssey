import * as THREE from "three";
import { CONTROLLER_SPEED, CONTROLLER_SENSiTIVITY } from "../../config/config";

export class PlayerController {

  constructor(camera, domElement) {

    this.camera = camera;
    this.domElement = domElement;

    // Settings
    this.speed = CONTROLLER_SPEED;
    this.sensitivity = CONTROLLER_SENSiTIVITY;

    // Rotation
    this.yaw = 0;
    this.pitch = 0;

    // Input
    this.keys = {};

    // Reusable vectors (prevents garbage collection)
    this.direction = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();

    this.euler = new THREE.Euler(0, 0, 0, "YXZ");

    this._initEvents();
  }

  _initEvents() {

    // Keyboard input
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Pointer lock
    this.domElement.addEventListener("click", () => {
      this.domElement.requestPointerLock();
    });

    // Mouse movement
    document.addEventListener("mousemove", (e) => {

      if (document.pointerLockElement !== this.domElement) return;

      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;

      // Clamp vertical rotation
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

      this.euler.set(this.pitch, this.yaw, 0);

      this.camera.quaternion.setFromEuler(this.euler);

    });

  }

  update(delta) {

    this.direction.set(0, 0, 0);

    // WASD movement
    if (this.keys["KeyW"]) this.direction.z += 1;
    if (this.keys["KeyS"]) this.direction.z -= 1;
    if (this.keys["KeyA"]) this.direction.x -= 1;
    if (this.keys["KeyD"]) this.direction.x += 1;

    const velocity = this.speed * delta;

    // Horizontal movement
    if (this.direction.lengthSq() > 0) {

      this.direction.normalize();

      this.forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
      this.right.set(1, 0, 0).applyQuaternion(this.camera.quaternion);

      // Prevent forward movement from affecting Y axis
      this.forward.y = 0;
      this.right.y = 0;

      this.forward.normalize();
      this.right.normalize();

      this.camera.position.addScaledVector(
        this.forward,
        this.direction.z * velocity
      );

      this.camera.position.addScaledVector(
        this.right,
        this.direction.x * velocity
      );
    }

    // Vertical movement
    if (this.keys["Space"]) {
      this.camera.position.y += velocity;
    }

    if (this.keys["ShiftLeft"]) {
      this.camera.position.y -= velocity;
    }

  }

}