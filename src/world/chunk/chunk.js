import * as THREE from "three";
import { CHUNK_SIZE, BLOCK_SIZE } from "../../config/config";
import { getHeight } from "../generation/noise";

const geometry = new THREE.BoxGeometry(
  BLOCK_SIZE,
  BLOCK_SIZE,
  BLOCK_SIZE
);

const material = new THREE.MeshStandardMaterial();

export function generateChunk(scene, chunkX, chunkZ) {
  const offsetX = chunkX * CHUNK_SIZE;
  const offsetZ = chunkZ * CHUNK_SIZE;

  const blocks = [];

  // First count blocks
  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      const worldX = x + offsetX;
      const worldZ = z + offsetZ;
      const height = getHeight(worldX, worldZ);

      for (let y = 0; y < height; y++) {
        blocks.push({ x: worldX, y, z: worldZ, height });
      }
    }
  }

  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    blocks.length
  );

  mesh.instanceColor = new THREE.InstancedBufferAttribute(
    new Float32Array(blocks.length * 3),
    3
  );

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  blocks.forEach((block, i) => {
    dummy.position.set(block.x, block.y, block.z);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    // Set color per block
    if (block.y === block.height - 1) {
      color.set(0x2ecc71);
    } else if (block.y > block.height - 5) {
      color.set(0x8b4513);
    } else {
      color.set(0x777777);
    }

    mesh.setColorAt(i, color);
  });


  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);

  const points = [];
  const epsilon = 0.01;

  const topY = (x, z) => {
    const h = getHeight(x, z);
    return h - 1 + BLOCK_SIZE / 2 + epsilon;
  };

  // bottom edge
  for (let x = 0; x < CHUNK_SIZE; x++) {
    const worldX = offsetX + x;
    const worldZ = offsetZ;
    points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  }

  // right edge
  for (let z = 0; z < CHUNK_SIZE; z++) {
    const worldX = offsetX + CHUNK_SIZE ;
    const worldZ = offsetZ + z;
    points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  }

  // top edge
  for (let x = CHUNK_SIZE ; x >= 0; x--) {
    const worldX = offsetX + x;
    const worldZ = offsetZ + CHUNK_SIZE ;
    points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  }

  // left edge
  for (let z = CHUNK_SIZE ; z >= 0; z--) {
    const worldX = offsetX;
    const worldZ = offsetZ + z;
    points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  }

  const borderGeometry = new THREE.BufferGeometry().setFromPoints(points);

  const borderMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    depthTest: false
  });

  const border = new THREE.LineLoop(borderGeometry, borderMaterial);

  scene.add(border);
  mesh.userData.border = border;

  return mesh;
}