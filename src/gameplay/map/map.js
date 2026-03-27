import { Vector3 } from "three";
import { CHUNK_SIZE } from "../../config/worldConfig";
import {
    WORLD_MAP_CANVAS_SIZE,
    WORLD_MAP_DEFAULT_ZOOM_INDEX,
    WORLD_MAP_MIN_CANVAS_SIZE,
    WORLD_MAP_ZOOM_LEVELS
} from "./mapConfig";
import { createTopographyTile } from "./topography";

export class WorldMap {

    constructor(getChunks, getPlayerPosition, getPlayerQuaternion) {

        this.root = document.getElementById("worldMap");

        this.getChunks = getChunks;
        this.getPlayerPosition = getPlayerPosition;
        this.getPlayerQuaternion = getPlayerQuaternion;

        this.visible = false;

        this.zoomLevels = WORLD_MAP_ZOOM_LEVELS;
        this.zoomIndex = WORLD_MAP_DEFAULT_ZOOM_INDEX;
        this.chunkTileCache = new Map();
        this.forward = new Vector3();

        this.setupUi();

        this.resize();

        window.addEventListener("resize", () => this.resize());
        window.addEventListener("keydown", (e) => this.onKeyDown(e));
        this.canvas.addEventListener("wheel", (e) => this.onWheel(e), {
            passive: false
        });
    }

    setupUi() {
        this.root.innerHTML = `
            <div class="world-map__backdrop"></div>
            <section class="world-map__panel" aria-label="World map">
                <div class="world-map__frame">
                    <canvas class="world-map__canvas"></canvas>
                </div>
            </section>
        `;

        this.panel = this.root.querySelector(".world-map__panel");
        this.canvas = this.root.querySelector(".world-map__canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    }

    resize() {
        const nextSize = Math.max(
            WORLD_MAP_MIN_CANVAS_SIZE,
            Math.min(WORLD_MAP_CANVAS_SIZE, Math.floor(window.innerWidth * 0.72))
        );

        this.canvas.width = nextSize;
        this.canvas.height = nextSize;
        this.ctx.imageSmoothingEnabled = false;

        if (this.visible) {
            this.render();
        }
    }

    toggle() {
        this.visible = !this.visible;
        this.root.classList.toggle("world-map--visible", this.visible);

        if (this.visible) {
            this.syncChunkTiles(true);
            this.render();
        }
    }

    onKeyDown(e) {
        if (e.key.toLowerCase() === "m") {
            this.toggle();
            return;
        }

        if (!this.visible) return;

        if (e.code === "Equal" || e.code === "NumpadAdd") {
            this.zoomIn();
            e.preventDefault();
        }

        if (e.code === "Minus" || e.code === "NumpadSubtract") {
            this.zoomOut();
            e.preventDefault();
        }
    }

    onWheel(e) {
        if (!this.visible) return;

        e.preventDefault();

        if (e.deltaY < 0) {
            this.zoomIn();
            return;
        }

        this.zoomOut();
    }

    zoomIn() {
        const nextIndex = Math.min(this.zoomLevels.length - 1, this.zoomIndex + 1);

        if (nextIndex === this.zoomIndex) return;

        this.zoomIndex = nextIndex;
        this.render();
    }

    zoomOut() {
        const nextIndex = Math.max(0, this.zoomIndex - 1);

        if (nextIndex === this.zoomIndex) return;

        this.zoomIndex = nextIndex;
        this.render();
    }

    update(chunksChanged = false) {
        if (!this.visible) return;

        if (chunksChanged) {
            this.syncChunkTiles();
        }

        this.render();
    }

    invalidateTiles() {
        this.chunkTileCache.clear();

        if (this.visible) {
            this.syncChunkTiles(true);
            this.render();
        }
    }

    syncChunkTiles(force = false) {
        const chunks = this.getChunks() || [];
        const activeKeys = new Set();

        for (const chunk of chunks) {
            const data = chunk.userData;

            if (!data?.surfaceData) continue;

            const key = this.getChunkKey(data.chunkX, data.chunkZ);
            activeKeys.add(key);

            if (!force && this.chunkTileCache.has(key)) {
                continue;
            }

            this.chunkTileCache.set(key, createTopographyTile(data.surfaceData));
        }

        for (const key of this.chunkTileCache.keys()) {
            if (!activeKeys.has(key)) {
                this.chunkTileCache.delete(key);
            }
        }
    }

    render() {

        const chunks = this.getChunks() || [];
        const player = this.getPlayerPosition();

        if (!player) return;

        const ctx = this.ctx;
        const pixelsPerBlock = this.zoomLevels[this.zoomIndex];
        const centerX = this.canvas.width / 2;
        const centerZ = this.canvas.height / 2;
        const chunkSizePixels = CHUNK_SIZE * pixelsPerBlock;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#08141b";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const mesh of chunks) {

            const data = mesh.userData;
            if (!data?.surfaceData) continue;

            const chunkTile = this.chunkTileCache.get(
                this.getChunkKey(data.chunkX, data.chunkZ)
            );
            if (!chunkTile) continue;

            const worldX = data.chunkX * CHUNK_SIZE;
            const worldZ = data.chunkZ * CHUNK_SIZE;

            const screenX = Math.round(
                centerX + (worldX - player.x) * pixelsPerBlock
            );
            const screenZ = Math.round(
                centerZ + (worldZ - player.z) * pixelsPerBlock
            );

            if (
                screenX > this.canvas.width ||
                screenZ > this.canvas.height ||
                screenX + chunkSizePixels < 0 ||
                screenZ + chunkSizePixels < 0
            ) {
                continue;
            }

            ctx.drawImage(
                chunkTile,
                screenX,
                screenZ,
                chunkSizePixels,
                chunkSizePixels
            );

            ctx.strokeStyle = "rgba(224, 243, 255, 0.08)";
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenZ, chunkSizePixels, chunkSizePixels);
        }

        this.drawCrosshair();
        this.drawPlayer(centerX, centerZ);
    }

    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    drawCrosshair() {
        const centerX = this.canvas.width / 2;
        const centerZ = this.canvas.height / 2;

        this.ctx.strokeStyle = "rgba(234, 246, 255, 0.18)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 14, centerZ);
        this.ctx.lineTo(centerX + 14, centerZ);
        this.ctx.moveTo(centerX, centerZ - 14);
        this.ctx.lineTo(centerX, centerZ + 14);
        this.ctx.stroke();
    }

    drawPlayer(centerX, centerZ) {
        const ctx = this.ctx;
        const heading = this.getHeadingAngle();

        ctx.save();
        ctx.translate(centerX, centerZ);
        ctx.rotate(heading);

        ctx.fillStyle = "#ff7b5a";
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(9, 10);
        ctx.lineTo(0, 5);
        ctx.lineTo(-9, 10);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#fff5ef";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    getHeadingAngle() {
        if (!this.getPlayerQuaternion) return 0;

        const quaternion = this.getPlayerQuaternion();
        if (!quaternion) return 0;

        this.forward.set(0, 0, -1).applyQuaternion(quaternion);

        return Math.atan2(this.forward.x, -this.forward.z);
    }

   
}
