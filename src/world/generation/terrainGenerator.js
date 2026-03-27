import { WORLD_GEN_CONFIG } from "../../config/worldGenConfig";
import { CHUNK_SIZE, WORLD_HEIGHT } from "../../config/worldConfig";
import { createChunkData } from "../chunk/chunkData";
import {
  BIOME_IDS,
  BIOME_MODE_OPTIONS,
  NATURAL_BIOME_MODE,
  getBiomeDefinition,
  getBiomeLabel
} from "./biome";
import {
  computeBiomeHeight,
  computeBiomeWeights,
  computeNaturalHeight,
  createBiomeWeightScratch,
  getDominantBiomeId
} from "./terrainElevation";
import { clamp, toBlockCoord } from "./terrainMath";
import {
  createClimateScratch,
  createTerrainSignalScratch,
  sampleClimate,
  sampleFillerDepthNoise,
  sampleTerrainSignals
} from "./terrainSampling";

class TerrainGenerator {
  constructor(config = WORLD_GEN_CONFIG) {
    this.config = config;
    this.biomeMode = NATURAL_BIOME_MODE;
    this.columnScratch = createClimateScratch();
    this.terrainScratch = createTerrainSignalScratch();
    this.biomeWeightScratch = createBiomeWeightScratch();
  }

  generateChunkData(chunkX, chunkZ) {
    const chunkData = createChunkData(chunkX, chunkZ, CHUNK_SIZE);
    const offsetX = chunkX * CHUNK_SIZE;
    const offsetZ = chunkZ * CHUNK_SIZE;

    for (let z = 0; z < CHUNK_SIZE; z++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const worldX = offsetX + x;
        const worldZ = offsetZ + z;
        const index = z * CHUNK_SIZE + x;
        const column = this.sampleColumnBase(worldX, worldZ, this.columnScratch);

        chunkData.heights[index] = column.height;
        chunkData.biomeIds[index] = column.biomeId;
        chunkData.minHeight = Math.min(chunkData.minHeight, column.height);
        chunkData.maxHeight = Math.max(chunkData.maxHeight, column.height);
      }
    }

    for (let z = 0; z < CHUNK_SIZE; z++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const worldX = offsetX + x;
        const worldZ = offsetZ + z;
        const index = z * CHUNK_SIZE + x;
        const height = chunkData.heights[index];
        const biomeId = chunkData.biomeIds[index];
        const slope = this.sampleChunkSlope(chunkData, x, z);
        const surfaceInfo = this.applySurfaceRules(
          worldX,
          worldZ,
          biomeId,
          height,
          slope,
          this.columnScratch
        );

        chunkData.slopeValues[index] = Math.min(255, Math.round(slope));
        chunkData.topBlockIds[index] = surfaceInfo.topBlockId;
        chunkData.fillerBlockIds[index] = surfaceInfo.fillerBlockId;
        chunkData.stoneBlockIds[index] = surfaceInfo.stoneBlockId;
        chunkData.fillerDepths[index] = surfaceInfo.fillerDepth;
        chunkData.bottomHeights[index] = this.resolveColumnBottom(
          chunkData,
          x,
          z,
          height,
          surfaceInfo.fillerDepth
        );
      }
    }

    return chunkData;
  }

  getGroundHeight(worldX, worldZ) {
    return this.sampleColumnBase(
      toBlockCoord(worldX),
      toBlockCoord(worldZ),
      this.columnScratch
    ).height;
  }

  getBiomeId(worldX, worldZ) {
    return this.sampleColumnBase(
      toBlockCoord(worldX),
      toBlockCoord(worldZ),
      this.columnScratch
    ).biomeId;
  }

  getBiomeLabel(worldX, worldZ) {
    return getBiomeLabel(this.getBiomeId(worldX, worldZ));
  }

  getBiomeMode() {
    return this.biomeMode;
  }

  getBiomeModeOptions() {
    return BIOME_MODE_OPTIONS;
  }

  setBiomeMode(nextMode) {
    if (nextMode === NATURAL_BIOME_MODE) {
      this.biomeMode = NATURAL_BIOME_MODE;
      return this.biomeMode;
    }

    const normalizedMode = Number(nextMode);

    if (Object.values(BIOME_IDS).includes(normalizedMode)) {
      this.biomeMode = String(normalizedMode);
      return this.biomeMode;
    }

    this.biomeMode = NATURAL_BIOME_MODE;
    return this.biomeMode;
  }

  getSurfaceInfo(worldX, worldZ, out = {}) {
    const blockX = toBlockCoord(worldX);
    const blockZ = toBlockCoord(worldZ);
    const column = this.sampleColumnBase(blockX, blockZ, this.columnScratch);
    const slope = this.sampleSlopeAtWorld(blockX, blockZ);

    return this.applySurfaceRules(
      blockX,
      blockZ,
      column.biomeId,
      column.height,
      slope,
      out
    );
  }

  sampleColumnBase(worldX, worldZ, out) {
    const climate = sampleClimate(this.config, worldX, worldZ, out);
    const terrainSignals = sampleTerrainSignals(
      this.config,
      worldX,
      worldZ,
      this.terrainScratch
    );
    if (this.biomeMode === NATURAL_BIOME_MODE) {
      const naturalBiomeWeights = computeBiomeWeights(
        climate,
        this.config,
        this.biomeWeightScratch
      );

      out.biomeId = getDominantBiomeId(naturalBiomeWeights);
      out.height = computeNaturalHeight(
        climate,
        terrainSignals,
        this.config,
        naturalBiomeWeights
      );

      return out;
    }

    out.biomeId = Number(this.biomeMode);
    out.height = computeBiomeHeight(
      out.biomeId,
      climate,
      terrainSignals,
      this.config
    );

    return out;
  }

  sampleChunkSlope(chunkData, x, z) {
    const height = this.getChunkHeight(chunkData, x, z);

    return Math.max(
      Math.abs(height - this.getChunkHeight(chunkData, x + 1, z)),
      Math.abs(height - this.getChunkHeight(chunkData, x - 1, z)),
      Math.abs(height - this.getChunkHeight(chunkData, x, z + 1)),
      Math.abs(height - this.getChunkHeight(chunkData, x, z - 1))
    );
  }

  sampleSlopeAtWorld(worldX, worldZ) {
    const height = this.getGroundHeight(worldX, worldZ);

    return Math.max(
      Math.abs(height - this.getGroundHeight(worldX + 1, worldZ)),
      Math.abs(height - this.getGroundHeight(worldX - 1, worldZ)),
      Math.abs(height - this.getGroundHeight(worldX, worldZ + 1)),
      Math.abs(height - this.getGroundHeight(worldX, worldZ - 1))
    );
  }

  getChunkHeight(chunkData, x, z) {
    if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
      return chunkData.heights[z * CHUNK_SIZE + x];
    }

    const worldX = chunkData.chunkX * CHUNK_SIZE + x;
    const worldZ = chunkData.chunkZ * CHUNK_SIZE + z;

    return this.getGroundHeight(worldX, worldZ);
  }

  applySurfaceRules(worldX, worldZ, biomeId, height, slope, out) {
    const biome = getBiomeDefinition(biomeId);
    const surface = biome.surface;
    const depthNoise = sampleFillerDepthNoise(this.config, worldX, worldZ);
    const fillerDepthRange = surface.fillerDepthMax - surface.fillerDepthMin;
    const fillerDepth =
      surface.fillerDepthMin + Math.round(depthNoise * fillerDepthRange);
    const shouldExposeStone =
      slope >= surface.stoneSlopeThreshold ||
      height >= surface.stoneHeightThreshold;

    out.height = height;
    out.biomeId = biomeId;
    out.slope = slope;
    out.topBlockId = shouldExposeStone ? surface.stoneBlockId : surface.topBlockId;
    out.fillerBlockId = shouldExposeStone
      ? surface.stoneBlockId
      : surface.fillerBlockId;
    out.stoneBlockId = surface.stoneBlockId;
    out.fillerDepth = fillerDepth;

    return out;
  }

  resolveColumnBottom(chunkData, x, z, height, fillerDepth) {
    const surfaceY = height - 1;
    const fillerBottomY = surfaceY - fillerDepth;
    const neighborMinHeight = Math.min(
      this.getChunkHeight(chunkData, x + 1, z),
      this.getChunkHeight(chunkData, x - 1, z),
      this.getChunkHeight(chunkData, x, z + 1),
      this.getChunkHeight(chunkData, x, z - 1)
    );

    return clamp(Math.min(fillerBottomY, neighborMinHeight), 0, WORLD_HEIGHT - 1);
  }
}

export function createTerrainGenerator(config = WORLD_GEN_CONFIG) {
  return new TerrainGenerator(config);
}
