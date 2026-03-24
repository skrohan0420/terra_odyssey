import * as THREE from "three";

export class InspectorMode {

    constructor(camera, controller, chunkManager) {
        this.camera = camera;
        this.controller = controller;
        this.chunkManager = chunkManager;

        this.enabled = false;

        this.speed = 80;
        this.direction = new THREE.Vector3();
        this.forward = new THREE.Vector3();
        this.right = new THREE.Vector3();
        this.keys = {};

        window.addEventListener("keydown", (e) => this.onKeyDown(e));
        window.addEventListener("keyup", (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        this.keys[e.code] = true;

        if (e.altKey && e.key.toLowerCase() === "i") {
            this.toggle();
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    toggle() {
        this.enabled = !this.enabled;

        if (this.enabled) {
            console.log("Inspector Mode Enabled");
            this.controller.enabled = false;
        } else {
            console.log("Inspector Mode Disabled");
            this.controller.enabled = true;
        }
    }

    update(delta) {

        if (!this.enabled) return;

        this.direction.set(0, 0, 0);

        if (this.keys["KeyW"]) this.direction.z += 1;
        if (this.keys["KeyS"]) this.direction.z -= 1;
        if (this.keys["KeyA"]) this.direction.x -= 1;
        if (this.keys["KeyD"]) this.direction.x += 1;

        const velocity = this.speed * delta;

        if (this.direction.lengthSq() > 0) {

            this.direction.normalize();

            this.forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
            this.right.set(1, 0, 0).applyQuaternion(this.camera.quaternion);

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

        // vertical movement
        if (this.keys["KeyQ"]) this.camera.position.y += velocity;
        if (this.keys["KeyE"]) this.camera.position.y -= velocity;
    }
}
