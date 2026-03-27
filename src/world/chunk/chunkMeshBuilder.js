import { BoxGeometry, Group, InstancedMesh, Object3D } from "three";
import { BLOCK_SIZE, CHUNK_SIZE } from "../../config/worldConfig";
import { RENDERABLE_BLOCKS } from "../block/blockRegistry";

const geometry = new BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
const dummy = new Object3D();

function createBlockMesh(materials, capacity) {
  return new InstancedMesh(geometry, materials, capacity);
}

function countChunkInstances(chunkData) {
  const counts = {};

  for (let index = 0; index < chunkData.columnCount; index++) {
    const height = chunkData.heights[index];
    const surfaceY = height - 1;
    const bottomY = chunkData.bottomHeights[index];
    const topBlockId = chunkData.topBlockIds[index];
    const fillerBlockId = chunkData.fillerBlockIds[index];
    const stoneBlockId = chunkData.stoneBlockIds[index];
    const fillerStartY = Math.max(bottomY, surfaceY - chunkData.fillerDepths[index]);

    counts[topBlockId] = (counts[topBlockId] ?? 0) + 1;

    if (surfaceY > fillerStartY) {
      counts[fillerBlockId] =
        (counts[fillerBlockId] ?? 0) + (surfaceY - fillerStartY);
    }

    if (fillerStartY > bottomY) {
      counts[stoneBlockId] =
        (counts[stoneBlockId] ?? 0) + (fillerStartY - bottomY);
    }
  }

  return counts;
}

function createChunkMeshes(chunk, chunkData) {
  const instanceCounts = countChunkInstances(chunkData);

  return Object.fromEntries(
    RENDERABLE_BLOCKS.map((block) => {
      const capacity = Math.max(1, instanceCounts[block.id] ?? 0);
      const mesh = createBlockMesh(block.materials, capacity);

      chunk.add(mesh);

      return [block.id, { mesh, nextIndex: 0, capacity }];
    })
  );
}

export function appendBlockInstance(meshEntries, blockId, x, y, z) {
  const entry = meshEntries[blockId];

  if (!entry || entry.nextIndex >= entry.capacity) {
    return;
  }

  dummy.position.set(x, y, z);
  dummy.updateMatrix();

  entry.mesh.setMatrixAt(entry.nextIndex, dummy.matrix);
  entry.nextIndex++;
  entry.mesh.count = entry.nextIndex;
  entry.mesh.instanceMatrix.needsUpdate = true;
}

function finalizeChunkMeshes(meshEntries) {
  Object.values(meshEntries).forEach((entry) => {
    entry.mesh.count = entry.nextIndex;
    entry.mesh.instanceMatrix.needsUpdate = true;
  });
}

export function buildChunkMesh(chunkData) {
  const chunk = new Group();
  const meshEntries = createChunkMeshes(chunk, chunkData);
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

      for (let y = bottomY; y <= surfaceY; y++) {
        appendBlockInstance(
          meshEntries,
          y === surfaceY
            ? topBlockId
            : y >= fillerStartY
              ? fillerBlockId
              : stoneBlockId,
          worldX,
          y,
          worldZ
        );
      }
    }
  }

  finalizeChunkMeshes(meshEntries);

  return {
    chunk,
    meshEntries
  };
}
