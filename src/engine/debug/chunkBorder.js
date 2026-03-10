
  // const points = [];
  // const epsilon = 0.01;

  // const topY = (x, z) => {
  //   const h = getHeight(x, z);
  //   return h - 1 + BLOCK_SIZE / 2 + epsilon;
  // };

  // // bottom edge
  // for (let x = 0; x < CHUNK_SIZE; x++) {
  //   const worldX = offsetX + x;
  //   const worldZ = offsetZ;
  //   points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  // }

  // // right edge
  // for (let z = 0; z < CHUNK_SIZE; z++) {
  //   const worldX = offsetX + CHUNK_SIZE ;
  //   const worldZ = offsetZ + z;
  //   points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  // }

  // // top edge
  // for (let x = CHUNK_SIZE ; x >= 0; x--) {
  //   const worldX = offsetX + x;
  //   const worldZ = offsetZ + CHUNK_SIZE ;
  //   points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  // }

  // // left edge
  // for (let z = CHUNK_SIZE ; z >= 0; z--) {
  //   const worldX = offsetX;
  //   const worldZ = offsetZ + z;
  //   points.push(new THREE.Vector3(worldX, topY(worldX, worldZ), worldZ));
  // }

  // const borderGeometry = new THREE.BufferGeometry().setFromPoints(points);

  // const borderMaterial = new THREE.LineBasicMaterial({
  //   color: 0xff0000,
  //   depthTest: false
  // });

  // const border = new THREE.LineLoop(borderGeometry, borderMaterial);

  // scene.add(border);
  // mesh.userData.border = border;