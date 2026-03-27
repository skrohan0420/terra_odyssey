import { generateChunk } from "./chunk";
import { CHUNK_SIZE } from "../../config/worldConfig";

export class ChunkManager {

    constructor(scene, renderDistance, terrainGenerator) {

        this.scene = scene;
        this.renderDistance = renderDistance;
        this.terrainGenerator = terrainGenerator;

        this.loadedChunks = new Map();
        this.loadedChunkList = [];
        this.currentPlayerChunk = { x: null, z: null };
    }

    getChunkKey(x, z) {
        return `${x},${z}`;
    }

    worldToChunkCoord(value) {
        return Math.floor(value / CHUNK_SIZE);
    }

    disposeChunk(mesh) {
        this.scene.remove(mesh);
        mesh.traverse?.((object) => {
            object.dispose?.();
        });
    }

    clearLoadedChunks() {
        for (const mesh of this.loadedChunks.values()) {
            this.disposeChunk(mesh);
        }

        this.loadedChunks.clear();
        this.loadedChunkList = [];
    }

    reloadAround(playerPosition) {
        this.clearLoadedChunks();
        this.currentPlayerChunk = { x: null, z: null };

        return this.update(playerPosition);
    }

    update(playerPosition) {

        const playerChunkX = this.worldToChunkCoord(playerPosition.x);
        const playerChunkZ = this.worldToChunkCoord(playerPosition.z);

        if (
            playerChunkX === this.currentPlayerChunk.x &&
            playerChunkZ === this.currentPlayerChunk.z
        ) {
            return false;
        }

        this.currentPlayerChunk = { x: playerChunkX, z: playerChunkZ };

        this.updateVisibleChunks();

        return true;
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

                    const mesh = generateChunk(
                        this.scene,
                        this.terrainGenerator,
                        chunkX,
                        chunkZ
                    );

                    this.loadedChunks.set(key, mesh);
                }
            }
        }

        for (const [key, mesh] of this.loadedChunks.entries()) {

                if (!newChunkSet.has(key)) {

                    this.disposeChunk(mesh);
                    this.loadedChunks.delete(key);
                }
            }

        this.loadedChunkList = Array.from(this.loadedChunks.values());
        }

    getLoadedChunkCount() {
        return this.loadedChunks.size;
    }
    getLoadedChunks() {
        return this.loadedChunkList;
    }
}
