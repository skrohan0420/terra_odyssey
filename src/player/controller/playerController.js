import * as THREE from "three";
import { CONTROLLER_SPEED, CONTROLLER_SENSiTIVITY } from "../../config/config"

export class PlayerController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Movement settings
    this.speed = CONTROLLER_SPEED;
    this.sensitivity = CONTROLLER_SENSiTIVITY;

    // Rotation
    this.yaw = 0;
    this.pitch = 0;

    // Input state
    this.keys = {};

    this._initEvents();
  }

  _initEvents() {
    // Keyboard
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

    // Mouse look
    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === this.domElement) {
        this.yaw -= e.movementX * this.sensitivity;
        this.pitch -= e.movementY * this.sensitivity;

        // Clamp vertical look
        this.pitch = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, this.pitch)
        );

        this.camera.rotation.order = "YXZ";
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
      }
    });
  }

  update() {
    const direction = new THREE.Vector3();

    if (this.keys["KeyW"]) direction.z += 1;
    if (this.keys["KeyS"]) direction.z -= 1;
    if (this.keys["KeyA"]) direction.x -= 1;
    if (this.keys["KeyD"]) direction.x += 1;

    direction.normalize();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      this.camera.quaternion
    );
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
      this.camera.quaternion
    );

    this.camera.position.addScaledVector(
      forward,
      direction.z * this.speed
    );
    this.camera.position.addScaledVector(
      right,
      direction.x * this.speed
    );
  }
}