import { generateChunk } from "./chunk";
import { CHUNK_SIZE } from "../../config/config";

export class ChunkManager {
    constructor(scene, renderDistance) {
        this.scene = scene;
        this.renderDistance = renderDistance;

        this.loadedChunks = new Map(); // key = "x,z"
        this.currentPlayerChunk = { x: null, z: null };
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    worldToChunkCoord(value) {
        return Math.floor(value / CHUNK_SIZE);
    }

    update(playerPosition) {
        const playerChunkX = this.worldToChunkCoord(playerPosition.x);
        const playerChunkZ = this.worldToChunkCoord(playerPosition.z);

        // Only update if player moved into new chunk
        if (
            playerChunkX === this.currentPlayerChunk.x &&
            playerChunkZ === this.currentPlayerChunk.z
        ) {
            return;
        }

        this.currentPlayerChunk = {
            x: playerChunkX,
            z: playerChunkZ
        };

        this.updateVisibleChunks();
    }

    updateVisibleChunks() {
        const { x: centerX, z: centerZ } = this.currentPlayerChunk;

        const newChunkSet = new Set();

        const radius = this.renderDistance;

        for (let x = -radius; x <= radius; x++) {

            const zMax = Math.floor(Math.sqrt(radius * radius - x * x));

            for (let z = -zMax; z <= zMax; z++) {

                const chunkX = centerX + x;
                const chunkZ = centerZ + z;

                const key = this.getChunkKey(chunkX, chunkZ);
                newChunkSet.add(key);

                if (!this.loadedChunks.has(key)) {
                    const mesh = generateChunk(this.scene, chunkX, chunkZ);
                    this.loadedChunks.set(key, mesh);
                }
            }
        }
        // Remove chunks outside range
        for (const [key, mesh] of this.loadedChunks.entries()) {
            if (!newChunkSet.has(key)) {

                this.scene.remove(mesh);

                if (mesh.userData.border) {
                    this.scene.remove(mesh.userData.border);
                    mesh.userData.border.geometry.dispose();
                    mesh.userData.border.material.dispose();
                }

                this.loadedChunks.delete(key);
            }
        }
    }

    getLoadedChunkCount() {
        return this.loadedChunks.size;
    }
}