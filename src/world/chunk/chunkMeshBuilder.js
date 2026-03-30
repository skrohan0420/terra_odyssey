import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh
} from "three";
import { CHUNK_SIZE } from "../../config/worldConfig";
import { getBlockEntry, RENDERABLE_BLOCKS } from "../block/blockRegistry";

function createFaceTarget() {
  return {
    positions: [],
    normals: [],
    uvs: []
  };
}

function createGeometryBuckets() {
  return Object.fromEntries(
    RENDERABLE_BLOCKS.map((block) => [
      block.id,
      {
        top: createFaceTarget(),
        side: createFaceTarget()
      }
    ])
  );
}

function pushQuad(target, a, b, c, d, nx, ny, nz) {
  target.positions.push(
    ...a,
    ...d,
    ...c,
    ...a,
    ...c,
    ...b
  );
  target.normals.push(
    nx, ny, nz,
    nx, ny, nz,
    nx, ny, nz,
    nx, ny, nz,
    nx, ny, nz,
    nx, ny, nz
  );
  target.uvs.push(
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 1,
    1, 0
  );
}

function appendTopFace(target, worldX, surfaceY, worldZ) {
  const y = surfaceY + 0.5;
  const x0 = worldX - 0.5;
  const x1 = worldX + 0.5;
  const z0 = worldZ - 0.5;
  const z1 = worldZ + 0.5;

  pushQuad(
    target,
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
    0,
    1,
    0
  );
}

function appendEastFace(target, worldX, blockY, worldZ) {
  const x = worldX + 0.5;
  const y0 = blockY - 0.5;
  const y1 = blockY + 0.5;
  const z0 = worldZ - 0.5;
  const z1 = worldZ + 0.5;

  pushQuad(
    target,
    [x, y0, z0],
    [x, y0, z1],
    [x, y1, z1],
    [x, y1, z0],
    1,
    0,
    0
  );
}

function appendWestFace(target, worldX, blockY, worldZ) {
  const x = worldX - 0.5;
  const y0 = blockY - 0.5;
  const y1 = blockY + 0.5;
  const z0 = worldZ - 0.5;
  const z1 = worldZ + 0.5;

  pushQuad(
    target,
    [x, y0, z1],
    [x, y0, z0],
    [x, y1, z0],
    [x, y1, z1],
    -1,
    0,
    0
  );
}

function appendNorthFace(target, worldX, blockY, worldZ) {
  const y0 = blockY - 0.5;
  const y1 = blockY + 0.5;
  const x0 = worldX - 0.5;
  const x1 = worldX + 0.5;
  const z = worldZ - 0.5;

  pushQuad(
    target,
    [x0, y0, z],
    [x1, y0, z],
    [x1, y1, z],
    [x0, y1, z],
    0,
    0,
    -1
  );
}

function appendSouthFace(target, worldX, blockY, worldZ) {
  const y0 = blockY - 0.5;
  const y1 = blockY + 0.5;
  const x0 = worldX - 0.5;
  const x1 = worldX + 0.5;
  const z = worldZ + 0.5;

  pushQuad(
    target,
    [x1, y0, z],
    [x0, y0, z],
    [x0, y1, z],
    [x1, y1, z],
    0,
    0,
    1
  );
}

function createGeometry(target) {
  if (target.positions.length === 0) {
    return null;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(target.positions, 3)
  );
  geometry.setAttribute(
    "normal",
    new Float32BufferAttribute(target.normals, 3)
  );
  geometry.setAttribute("uv", new Float32BufferAttribute(target.uvs, 2));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

function createChunkMeshes(chunk, geometryBuckets) {
  for (const block of RENDERABLE_BLOCKS) {
    const bucket = geometryBuckets[block.id];
    const topGeometry = createGeometry(bucket.top);
    const sideGeometry = createGeometry(bucket.side);
    const entry = getBlockEntry(block.id);

    if (topGeometry) {
      chunk.add(new Mesh(topGeometry, entry.materials[2]));
    }

    if (sideGeometry) {
      chunk.add(new Mesh(sideGeometry, entry.materials[0]));
    }
  }
}

function getNeighborHeight(chunkData, x, z) {
  if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
    return chunkData.heights[z * CHUNK_SIZE + x];
  }

  if (x < 0 && z >= 0 && z < CHUNK_SIZE) {
    return chunkData.westHeights[z];
  }

  if (x >= CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
    return chunkData.eastHeights[z];
  }

  if (z < 0 && x >= 0 && x < CHUNK_SIZE) {
    return chunkData.northHeights[x];
  }

  if (z >= CHUNK_SIZE && x >= 0 && x < CHUNK_SIZE) {
    return chunkData.southHeights[x];
  }

  return 0;
}

function getSideFaceAppender(xOffset, zOffset) {
  if (xOffset > 0) return appendEastFace;
  if (xOffset < 0) return appendWestFace;
  if (zOffset > 0) return appendSouthFace;
  return appendNorthFace;
}

function appendExposedSide(
  geometryBuckets,
  worldX,
  worldZ,
  surfaceY,
  bottomY,
  fillerStartY,
  topBlockId,
  fillerBlockId,
  stoneBlockId,
  neighborHeight,
  faceAppender
) {
  const firstExposedBlockY = Math.max(bottomY, neighborHeight);

  if (firstExposedBlockY > surfaceY) {
    return;
  }

  for (let blockY = firstExposedBlockY; blockY <= surfaceY; blockY++) {
    const blockId = blockY === surfaceY
      ? topBlockId
      : blockY >= fillerStartY
        ? fillerBlockId
        : stoneBlockId;

    faceAppender(geometryBuckets[blockId].side, worldX, blockY, worldZ);
  }
}

export function buildChunkMesh(chunkData) {
  const chunk = new Group();
  const geometryBuckets = createGeometryBuckets();
  const offsetX = chunkData.chunkX * CHUNK_SIZE;
  const offsetZ = chunkData.chunkZ * CHUNK_SIZE;

  for (let z = 0; z < CHUNK_SIZE; z++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      const index = z * CHUNK_SIZE + x;
      const worldX = offsetX + x;
      const worldZ = offsetZ + z;
      const height = chunkData.heights[index];
      const surfaceY = height - 1;
      const bottomY = chunkData.bottomHeights[index];
      const fillerDepth = chunkData.fillerDepths[index];
      const topBlockId = chunkData.topBlockIds[index];
      const fillerBlockId = chunkData.fillerBlockIds[index];
      const stoneBlockId = chunkData.stoneBlockIds[index];
      const fillerStartY = Math.max(bottomY, surfaceY - fillerDepth);

      appendTopFace(geometryBuckets[topBlockId].top, worldX, surfaceY, worldZ);

      appendExposedSide(
        geometryBuckets,
        worldX,
        worldZ,
        surfaceY,
        bottomY,
        fillerStartY,
        topBlockId,
        fillerBlockId,
        stoneBlockId,
        getNeighborHeight(chunkData, x + 1, z),
        getSideFaceAppender(1, 0)
      );
      appendExposedSide(
        geometryBuckets,
        worldX,
        worldZ,
        surfaceY,
        bottomY,
        fillerStartY,
        topBlockId,
        fillerBlockId,
        stoneBlockId,
        getNeighborHeight(chunkData, x - 1, z),
        getSideFaceAppender(-1, 0)
      );
      appendExposedSide(
        geometryBuckets,
        worldX,
        worldZ,
        surfaceY,
        bottomY,
        fillerStartY,
        topBlockId,
        fillerBlockId,
        stoneBlockId,
        getNeighborHeight(chunkData, x, z + 1),
        getSideFaceAppender(0, 1)
      );
      appendExposedSide(
        geometryBuckets,
        worldX,
        worldZ,
        surfaceY,
        bottomY,
        fillerStartY,
        topBlockId,
        fillerBlockId,
        stoneBlockId,
        getNeighborHeight(chunkData, x, z - 1),
        getSideFaceAppender(0, -1)
      );
    }
  }

  createChunkMeshes(chunk, geometryBuckets);

  return { chunk };
}
