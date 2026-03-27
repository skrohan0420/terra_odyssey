import { CHUNK_SIZE } from "../../config/worldConfig";

export function createChunkData(chunkX, chunkZ, chunkSize = CHUNK_SIZE) {
  const columnCount = chunkSize * chunkSize;

  return {
    chunkX,
    chunkZ,
    chunkSize,
    columnCount,
    heights: new Int16Array(columnCount),
    biomeIds: new Uint8Array(columnCount),
    topBlockIds: new Uint16Array(columnCount),
    fillerBlockIds: new Uint16Array(columnCount),
    stoneBlockIds: new Uint16Array(columnCount),
    fillerDepths: new Uint8Array(columnCount),
    slopeValues: new Uint8Array(columnCount),
    bottomHeights: new Int16Array(columnCount),
    minHeight: Number.POSITIVE_INFINITY,
    maxHeight: Number.NEGATIVE_INFINITY
  };
}
