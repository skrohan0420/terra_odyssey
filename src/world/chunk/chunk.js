import * as THREE from "three";
import { BLOCK_SIZE, CHUNK_SIZE } from "../../config/worldConfig";
import { getHeight } from "../generation/noise";
import { getBlockEntry, RENDERABLE_BLOCKS } from "../block/blockRegistry";
import { BLOCK_IDS } from "../block/blockTypes";

const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

const dummy = new THREE.Object3D();

function createBlockMesh(materials, capacity) {
  const mesh = new THREE.InstancedMesh(geometry, materials, capacity);
  return mesh;
}

function createChunkMeshes(chunk, columnCount) {
  const meshEntries = Object.fromEntries(
    RENDERABLE_BLOCKS.map((block) => {
      const mesh = createBlockMesh(
        block.materials,
        columnCount * block.maxInstancesPerColumn
      );

      chunk.add(mesh);

      return [block.id, { mesh, nextIndex: 0 }];
    })
  );

  return meshEntries;
}

function addBlockInstance(meshEntries, blockId) {
  const entry = meshEntries[blockId];

  entry.mesh.setMatrixAt(entry.nextIndex, dummy.matrix);
  entry.nextIndex++;
}

function finalizeChunkMeshes(meshEntries) {
  Object.values(meshEntries).forEach((entry) => {
    entry.mesh.count = entry.nextIndex;
    entry.mesh.instanceMatrix.needsUpdate = true;
  });
}

export function generateChunk(scene, chunkX, chunkZ) {
  const offsetX = chunkX * CHUNK_SIZE;
  const offsetZ = chunkZ * CHUNK_SIZE;
  const columnCount = CHUNK_SIZE * CHUNK_SIZE;

  const chunk = new THREE.Group();
  const meshEntries = createChunkMeshes(chunk, columnCount);

  const surfaceHeights = new Int16Array(columnCount);
  let minSurfaceHeight = Number.POSITIVE_INFINITY;
  let maxSurfaceHeight = Number.NEGATIVE_INFINITY;

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      const worldX = x + offsetX;
      const worldZ = z + offsetZ;
      const surfaceIndex = z * CHUNK_SIZE + x;

      const height = getHeight(worldX, worldZ);
      surfaceHeights[surfaceIndex] = height;
      minSurfaceHeight = Math.min(minSurfaceHeight, height);
      maxSurfaceHeight = Math.max(maxSurfaceHeight, height);

      const minY = Math.max(0, height - 3);

      for (let y = minY; y < height; y++) {
        dummy.position.set(worldX, y, worldZ);
        dummy.updateMatrix();

        if (y === height - 1) {
          addBlockInstance(meshEntries, BLOCK_IDS.GRASS);
        } else {
          addBlockInstance(meshEntries, BLOCK_IDS.DIRT);
        }
      }
    }
  }

  finalizeChunkMeshes(meshEntries);

  chunk.userData = {
    chunkX,
    chunkZ,
    surfaceData: {
      heights: surfaceHeights,
      minHeight: minSurfaceHeight,
      maxHeight: maxSurfaceHeight
    },
    revealBlock(worldX, worldZ, y) {
      if (y < 0) return;

      dummy.position.set(worldX, y, worldZ);
      dummy.updateMatrix();

      const stoneEntry = getBlockEntry(BLOCK_IDS.STONE);
      const meshEntry = meshEntries[stoneEntry.id];

      meshEntry.mesh.setMatrixAt(meshEntry.nextIndex, dummy.matrix);
      meshEntry.nextIndex++;
      meshEntry.mesh.count = meshEntry.nextIndex;

      meshEntry.mesh.instanceMatrix.needsUpdate = true;
    }
  };

  scene.add(chunk);

  return chunk;
}
