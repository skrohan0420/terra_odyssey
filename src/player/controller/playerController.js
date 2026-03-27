import { Euler, Vector3 } from "three";
import {
  CONTROLLER_SENSiTIVITY,
  PLAYER_EYE_HEIGHT,
  PLAYER_GRAVITY,
  PLAYER_JUMP_FORCE,
  PLAYER_STEP_HEIGHT,
  PLAYER_STEP_SPEED,
  PLAYER_SPRINT_MULTIPLIER,
  PLAYER_WALK_SPEED
} from "../../config/playerConfig";

export class PlayerController {

  constructor(camera, domElement, terrainGenerator) {

    this.camera = camera;
    this.domElement = domElement;
    this.terrainGenerator = terrainGenerator;
    this.enabled = true;

    // Settings
    this.walkSpeed = PLAYER_WALK_SPEED;
    this.sprintMultiplier = PLAYER_SPRINT_MULTIPLIER;
    this.jumpForce = PLAYER_JUMP_FORCE;
    this.gravity = PLAYER_GRAVITY;
    this.eyeHeight = PLAYER_EYE_HEIGHT;
    this.stepHeight = PLAYER_STEP_HEIGHT;
    this.stepSpeed = PLAYER_STEP_SPEED;
    this.sensitivity = CONTROLLER_SENSiTIVITY;

    // Rotation
    this.euler = new Euler(0, 0, 0, "YXZ");
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.yaw = this.euler.y;
    this.pitch = this.euler.x;

    // Input
    this.keys = {};
    this.jumpQueued = false;

    // Reusable vectors
    this.direction = new Vector3();
    this.forward = new Vector3();
    this.right = new Vector3();

    this.verticalVelocity = 0;
    this.isGrounded = false;

    this._initEvents();
  }

  _initEvents() {

    // Keyboard input
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      if (e.code === "Space" && !e.repeat) {
        this.jumpQueued = true;
        e.preventDefault();
      }
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
    if (!this.enabled) return;

    const wasGrounded = this.isGrounded;
    const startX = this.camera.position.x;
    const startZ = this.camera.position.z;

    this.direction.set(0, 0, 0);

    // WASD movement
    if (this.keys["KeyW"]) this.direction.z += 1;
    if (this.keys["KeyS"]) this.direction.z -= 1;
    if (this.keys["KeyA"]) this.direction.x -= 1;
    if (this.keys["KeyD"]) this.direction.x += 1;

    const isSprinting = this.keys["ShiftLeft"] || this.keys["ShiftRight"];
    const moveSpeed = this.walkSpeed * (isSprinting ? this.sprintMultiplier : 1);
    const movementStep = moveSpeed * delta;

    let movedHorizontally = false;

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
        this.direction.z * movementStep
      );

      this.camera.position.addScaledVector(
        this.right,
        this.direction.x * movementStep
      );

      movedHorizontally = true;
    }

    let jumpStarted = false;

    if (this.jumpQueued && wasGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
      jumpStarted = true;
    }

    this.jumpQueued = false;

    let groundHeight = this.getGroundHeight(
      this.camera.position.x,
      this.camera.position.z
    );

    const heightDelta = groundHeight - this.camera.position.y;

    if (!jumpStarted && wasGrounded) {
      if (heightDelta > this.stepHeight && movedHorizontally) {
        this.camera.position.x = startX;
        this.camera.position.z = startZ;
        groundHeight = this.getGroundHeight(startX, startZ);
        this.camera.position.y = this.moveTowards(
          this.camera.position.y,
          groundHeight,
          this.stepSpeed * delta
        );
        this.verticalVelocity = 0;
        this.isGrounded = true;
        return;
      }

      if (heightDelta >= -this.stepHeight && heightDelta <= this.stepHeight) {
        this.camera.position.y = this.moveTowards(
          this.camera.position.y,
          groundHeight,
          this.stepSpeed * delta
        );
        this.verticalVelocity = 0;
        this.isGrounded = true;
        return;
      }
    }

    this.isGrounded = false;
    this.verticalVelocity -= this.gravity * delta;
    this.camera.position.y += this.verticalVelocity * delta;

    groundHeight = this.getGroundHeight(
      this.camera.position.x,
      this.camera.position.z
    );

    if (this.verticalVelocity <= 0 && this.camera.position.y <= groundHeight) {
      this.camera.position.y = groundHeight;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }
  }

  getGroundHeight(x = this.camera.position.x, z = this.camera.position.z) {
    const sampleX = this.getBlockCoord(x);
    const sampleZ = this.getBlockCoord(z);

    return this.terrainGenerator.getGroundHeight(sampleX, sampleZ) + this.eyeHeight - 0.5;
  }

  getBlockCoord(value) {
    return Math.floor(value + 0.5);
  }

  moveTowards(current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }

    return current + Math.sign(target - current) * maxDelta;
  }
}
