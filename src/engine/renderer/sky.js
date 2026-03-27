import {
  BoxGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  Sprite,
  SpriteMaterial,
  Vector3
} from "three";
import {
  SKY_CLOUD_CELL_SIZE,
  SKY_CLOUD_GRID_RADIUS,
  SKY_CLOUD_LAYER_Y,
  SKY_SUN_DISTANCE,
  SKY_SUN_SIZE
} from "../../config/graphicsConfig";

const CLOUD_SHAPES = Object.freeze([
  Object.freeze([
    { x: 0, y: 0, z: 0, width: 52, height: 2, depth: 16 },
    { x: -22, y: 0, z: 3, width: 18, height: 2, depth: 10 },
    { x: 20, y: 0, z: -2, width: 20, height: 2, depth: 10 },
    { x: 6, y: 0, z: 9, width: 24, height: 2, depth: 8 }
  ]),
  Object.freeze([
    { x: 0, y: 0, z: 0, width: 44, height: 2, depth: 14 },
    { x: -16, y: 0, z: -7, width: 20, height: 2, depth: 8 },
    { x: 18, y: 0, z: 5, width: 18, height: 2, depth: 10 },
    { x: 32, y: 0, z: -1, width: 12, height: 2, depth: 8 }
  ]),
  Object.freeze([
    { x: 0, y: 0, z: 0, width: 58, height: 2, depth: 18 },
    { x: -26, y: 0, z: -3, width: 16, height: 2, depth: 8 },
    { x: 24, y: 0, z: 6, width: 16, height: 2, depth: 8 }
  ])
]);

function freezeObjectTransforms(object) {
  object.updateMatrix();
  object.updateMatrixWorld(true);
  object.matrixAutoUpdate = false;

  for (const child of object.children) {
    freezeObjectTransforms(child);
  }
}

function createSunVisual() {
  const sunGroup = new Group();
  const sunMaterial = new SpriteMaterial({
    color: 0xfff0b3,
    fog: false,
    depthWrite: false
  });
  sunMaterial.toneMapped = false;

  const haloMaterial = new SpriteMaterial({
    color: 0xfff7d1,
    transparent: true,
    opacity: 0.22,
    fog: false,
    depthWrite: false
  });
  haloMaterial.toneMapped = false;

  const sunCore = new Sprite(sunMaterial);
  const halo = new Sprite(haloMaterial);

  sunCore.scale.set(SKY_SUN_SIZE, SKY_SUN_SIZE, 1);
  halo.scale.set(SKY_SUN_SIZE * 1.8, SKY_SUN_SIZE * 1.8, 1);

  sunGroup.add(halo);
  sunGroup.add(sunCore);

  return {
    object: sunGroup,
    halo,
    sunCore
  };
}

function getCellRandom(cellX, cellZ, salt) {
  const value = Math.sin(cellX * 127.1 + cellZ * 311.7 + salt * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function getCloudScale(cellX, cellZ) {
  return 1.2 + getCellRandom(cellX, cellZ, 2) * 0.75;
}

function createCloudCluster(cellX, cellZ, geometry, material) {
  if (getCellRandom(cellX, cellZ, 0) < 0.28) {
    return null;
  }

  const shapeIndex = Math.floor(
    getCellRandom(cellX, cellZ, 1) * CLOUD_SHAPES.length
  );
  const shape = CLOUD_SHAPES[shapeIndex];
  const cluster = new Group();
  const jitterX = (getCellRandom(cellX, cellZ, 3) - 0.5) * SKY_CLOUD_CELL_SIZE * 0.55;
  const jitterZ = (getCellRandom(cellX, cellZ, 4) - 0.5) * SKY_CLOUD_CELL_SIZE * 0.55;

  cluster.position.set(
    cellX * SKY_CLOUD_CELL_SIZE + jitterX,
    SKY_CLOUD_LAYER_Y,
    cellZ * SKY_CLOUD_CELL_SIZE + jitterZ
  );
  cluster.scale.setScalar(getCloudScale(cellX, cellZ));

  for (const slab of shape) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(slab.x, slab.y, slab.z);
    mesh.scale.set(slab.width, slab.height, slab.depth);
    cluster.add(mesh);
  }

  freezeObjectTransforms(cluster);

  return cluster;
}

export function getStaticSunDirection(camera) {
  const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0;

  if (forward.lengthSq() === 0) {
    forward.set(1, 0, 0);
  }

  forward.normalize();

  return new Vector3(forward.x * 0.72, 0.68, forward.z * 0.72).normalize();
}

class StaticSky {
  constructor(camera, sunlight, sunDirection) {
    this.camera = camera;
    this.sunlight = sunlight;
    this.sunDirection = sunDirection.clone().normalize();
    this.object = new Group();
    this.cloudGroup = new Group();
    this.currentCloudCellX = Number.NaN;
    this.currentCloudCellZ = Number.NaN;

    this.cloudGeometry = new BoxGeometry(1, 1, 1);
    this.cloudMaterial = new MeshLambertMaterial({
      color: 0xf9fdff,
      fog: false
    });

    const sunVisual = createSunVisual();
    this.sunGroup = sunVisual.object;
    this.sunCore = sunVisual.sunCore;
    this.sunHalo = sunVisual.halo;

    this.object.add(this.cloudGroup);
    this.object.add(this.sunGroup);

    this.updateSun();
    this.rebuildClouds();
  }

  update() {
    this.updateSun();

    const nextCellX = this.getCloudCell(this.camera.position.x);
    const nextCellZ = this.getCloudCell(this.camera.position.z);

    if (
      nextCellX !== this.currentCloudCellX ||
      nextCellZ !== this.currentCloudCellZ
    ) {
      this.rebuildClouds();
    }
  }

  getCloudCell(value) {
    return Math.floor(value / SKY_CLOUD_CELL_SIZE);
  }

  updateSun() {
    const sunPosition = this.camera.position
      .clone()
      .addScaledVector(this.sunDirection, SKY_SUN_DISTANCE);

    this.sunCore.position.copy(sunPosition);
    this.sunHalo.position.copy(
      sunPosition.clone().addScaledVector(this.sunDirection, -1)
    );

    this.sunlight.position.copy(
      this.camera.position
        .clone()
        .addScaledVector(this.sunDirection, SKY_SUN_DISTANCE * 0.5)
    );
    this.sunlight.target.position.copy(this.camera.position);
    this.sunlight.target.updateMatrixWorld();
  }

  rebuildClouds() {
    const centerCellX = this.getCloudCell(this.camera.position.x);
    const centerCellZ = this.getCloudCell(this.camera.position.z);

    this.currentCloudCellX = centerCellX;
    this.currentCloudCellZ = centerCellZ;
    this.cloudGroup.clear();

    for (
      let cellX = centerCellX - SKY_CLOUD_GRID_RADIUS;
      cellX <= centerCellX + SKY_CLOUD_GRID_RADIUS;
      cellX++
    ) {
      for (
        let cellZ = centerCellZ - SKY_CLOUD_GRID_RADIUS;
        cellZ <= centerCellZ + SKY_CLOUD_GRID_RADIUS;
        cellZ++
      ) {
        const cluster = createCloudCluster(
          cellX,
          cellZ,
          this.cloudGeometry,
          this.cloudMaterial
        );

        if (cluster) {
          this.cloudGroup.add(cluster);
        }
      }
    }
  }
}

export function createStaticSky(camera, sunlight, sunDirection) {
  return new StaticSky(camera, sunlight, sunDirection);
}
