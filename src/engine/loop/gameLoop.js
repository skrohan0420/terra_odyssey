export function startGameLoop({
    scene,
    camera,
    renderer,
    worldMap,
    debug,
    systemManager,
    chunkStreamingSystem,
    saveSystem
}) {
    let running = false;
    let isStarted = false;

    let lastTime = performance.now();

    function update(delta) {
        systemManager.update(delta);
    }

    function render() {
        renderer.render(scene, camera);

        if (worldMap.visible && chunkStreamingSystem.consumeChunkChange()) {
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
            saveSystem?.flush?.();
        }
    };
}
