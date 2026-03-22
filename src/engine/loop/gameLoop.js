import { savePlayerState } from "../../player/playerState";

export function startGameLoop({
    scene,
    camera,
    renderer,
    controller,
    inspector,
    chunkManager,
    worldMap,
    debug
}) {
    let running = false;
    let isStarted = false;

    let lastTime = performance.now();
    let saveTimer = 0;
    let chunkChanged = false;

    const updatables = [controller, inspector];

    function update(delta) {
        // Update all systems
        updatables.forEach(obj => obj.update?.(delta));

        // Chunk system
        if (!inspector.enabled) {
            chunkChanged = chunkManager.update(camera.position);
        }

        // Save player state every 2 seconds
        saveTimer += delta;
        if (saveTimer > 2) {
            savePlayerState(camera);
            saveTimer = 0;
        }
    }

    function render() {
        renderer.render(scene, camera);

        if (worldMap.visible && chunkChanged) {
            worldMap.render();
        }
    }

    function animate() {
        if (!running) return;

        requestAnimationFrame(animate);

        // Calculate delta time
        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        debug.begin();

        update(delta);
        render();

        debug.update();
        debug.end();
    }

    return {
        start: () => {
            if (!isStarted) {
                isStarted = true;
                running = true;
                lastTime = performance.now(); // reset time
                animate();
            }
        },
        stop: () => {
            running = false;
        }
    };
}
