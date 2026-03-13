import * as THREE from "three";
import { CHUNK_SIZE, BLOCK_SIZE } from "../../config/config";
import { getHeight } from "../generation/noise";

const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

const material = new THREE.MeshLambertMaterial();

const dummy = new THREE.Object3D();
const color = new THREE.Color();

export function generateChunk(scene, chunkX, chunkZ) {

  const offsetX = chunkX * CHUNK_SIZE;
  const offsetZ = chunkZ * CHUNK_SIZE;

  const maxInstances = CHUNK_SIZE * CHUNK_SIZE * 6;

  const mesh = new THREE.InstancedMesh(geometry, material, maxInstances);

  mesh.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(maxInstances * 3),
    3
  );

  const columnHeights = {};

  let index = 0;

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {

      const worldX = x + offsetX;
      const worldZ = z + offsetZ;

      const height = getHeight(worldX, worldZ);
      columnHeights[`${worldX},${worldZ}`] = height;

      const minY = Math.max(0, height - 3);

      for (let y = minY; y < height; y++) {

        dummy.position.set(worldX, y, worldZ);
        dummy.updateMatrix();

        mesh.setMatrixAt(index, dummy.matrix);

        if (y === height - 1) color.set(0x2ecc71);
        else color.set(0x8b4513);

        mesh.setColorAt(index, color);

        index++;
      }
    }
  }

  mesh.count = index;

  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  mesh.userData = {
    chunkX,
    chunkZ,
    columnHeights,
    revealBlock(worldX, worldZ, y) {

      if (y < 0) return;

      dummy.position.set(worldX, y, worldZ);
      dummy.updateMatrix();

      mesh.setMatrixAt(mesh.count, dummy.matrix);

      color.set(0x777777);
      mesh.setColorAt(mesh.count, color);

      mesh.count++;

      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    }
  };

  scene.add(mesh);

  return mesh;
}