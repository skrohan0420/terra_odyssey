import { CHUNK_SIZE } from "../../config/worldConfig";
import { BLOCK_IDS } from "../block/blockTypes";
import {
  appendBlockInstance,
  buildChunkMesh
} from "./chunkMeshBuilder";

export function generateChunk(scene, terrainGenerator, chunkX, chunkZ) {
  const chunkData = terrainGenerator.generateChunkData(chunkX, chunkZ);
  const { chunk, meshEntries } = buildChunkMesh(chunkData);

  chunk.userData = {
    chunkX,
    chunkZ,
    surfaceData: {
      heights: chunkData.heights,
      biomeIds: chunkData.biomeIds,
      slopeValues: chunkData.slopeValues,
      topBlockIds: chunkData.topBlockIds,
      fillerBlockIds: chunkData.fillerBlockIds,
      minHeight: chunkData.minHeight,
      maxHeight: chunkData.maxHeight
    },
    revealBlock(worldX, worldZ, y) {
      if (y < 0) return;

      appendBlockInstance(meshEntries, BLOCK_IDS.STONE, worldX, y, worldZ);
    }
  };

  scene.add(chunk);

  return chunk;
}
