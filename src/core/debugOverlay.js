import Stats from "stats.js";

export class DebugOverlay {
    constructor(renderer, camera, getChunkCount) {
        this.renderer = renderer;
        this.camera = camera;
        this.getChunkCount = getChunkCount;

        this.enabled = true;

        this.stats = new Stats();

        this.infoEl = document.createElement("div");
        this.infoEl.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(4px);
            color: #00ff6a;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.6;
            letter-spacing: 0.5px;
            z-index: 1000;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            font-weight: bold;
        `;
        document.body.appendChild(this.infoEl);

        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();

        this.setupToggle();
    }

    setupToggle() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "F2") {
                this.enabled = !this.enabled;
                this.setVisibility(this.enabled);
            }
        });
    }

    setVisibility(state) {
        this.stats.dom.style.display = state ? "block" : "none";
        this.infoEl.style.display = state ? "flex" : "none";
    }

    updateFps() {
        this.frames++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= 100) {
            this.fps = Math.round((this.frames * 1000) / delta);
            this.frames = 0;
            this.lastTime = now;
        }
    }

    updateInfo() {
        if (!this.enabled) return;

        const r = this.renderer.info;

        const drawCalls = r.render.calls;
        const triangles = r.render.triangles;
        const geometries = r.memory.geometries;
        const textures = r.memory.textures;

        let fpsColor = "#00ff88";
        if (this.fps < 50) fpsColor = "#ffff00";
        if (this.fps < 30) fpsColor = "#ff4444";

        this.infoEl.innerHTML = `
            <div>FPS: <span style="color: ${fpsColor}">${this.fps}</span></div>
            <div>Draw Calls: <span style="color: lightblue">${drawCalls}</span></div>
            <div>Triangles: <span style="color: lightblue">${triangles.toLocaleString()}</span></div>
            <div>Geometries: <span style="color: lightblue">${geometries}</span></div>
            <div>Textures: <span style="color: lightblue">${textures}</span></div>
            <div>Camera: <span style="color: lightblue">
                ${this.camera.position.x.toFixed(1)},
                ${this.camera.position.y.toFixed(1)},
                ${this.camera.position.z.toFixed(1)}
            </span></div>
            <div>Chunks: <span style="color: lightblue">${this.getChunkCount()}</span></div>
        `;
    }

    begin() {
        if (this.enabled) this.stats.begin();
    }

    end() {
        if (this.enabled) this.stats.end();
    }

    update() {
        if (!this.enabled) return;
        this.updateFps();
        this.updateInfo();
    }
}