import { buildChunkMesh } from "./chunkMeshBuilder";

export function generateChunk(scene, terrainGenerator, chunkX, chunkZ) {
  const chunkData = terrainGenerator.generateChunkData(chunkX, chunkZ);
  const { chunk } = buildChunkMesh(chunkData);

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
    }
  };

  scene.add(chunk);

  return chunk;
}
