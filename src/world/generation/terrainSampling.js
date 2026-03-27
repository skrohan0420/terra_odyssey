import {
  sampleFractalNormalized2D,
  sampleNormalized2D,
  sampleRidged2D
} from "./noise";

export function createClimateScratch() {
  return {
    temperature: 0,
    moisture: 0,
    ruggedness: 0,
    peaks: 0,
    biomeId: 0,
    height: 0
  };
}

export function createTerrainSignalScratch() {
  return {
    macro: 0,
    rolling: 0,
    detail: 0,
    ridge: 0,
    dune: 0
  };
}

function getWarpedX(worldX, worldZ, warpX) {
  return (
    worldX +
    sampleFractalNormalized2D(worldX, worldZ, warpX) * 2 * warpX.amplitude -
    warpX.amplitude
  );
}

function getWarpedZ(worldX, worldZ, warpZ) {
  return (
    worldZ +
    sampleFractalNormalized2D(worldX, worldZ, warpZ) * 2 * warpZ.amplitude -
    warpZ.amplitude
  );
}

export function sampleClimate(config, worldX, worldZ, out) {
  const climate = config.climate;
  const sampleX = getWarpedX(worldX, worldZ, climate.warpX);
  const sampleZ = getWarpedZ(worldX, worldZ, climate.warpZ);

  out.temperature = sampleFractalNormalized2D(
    sampleX,
    sampleZ,
    climate.temperature
  );
  out.moisture = sampleFractalNormalized2D(
    sampleX,
    sampleZ,
    climate.moisture
  );
  out.ruggedness = sampleFractalNormalized2D(
    sampleX,
    sampleZ,
    climate.ruggedness
  );
  out.peaks = sampleRidged2D(sampleX, sampleZ, climate.peaks);

  return out;
}

export function sampleTerrainSignals(config, worldX, worldZ, out) {
  const terrain = config.terrain;
  const sampleX = getWarpedX(worldX, worldZ, terrain.warpX);
  const sampleZ = getWarpedZ(worldX, worldZ, terrain.warpZ);

  out.macro = sampleFractalNormalized2D(worldX, worldZ, terrain.macro);
  out.rolling = sampleFractalNormalized2D(sampleX, sampleZ, terrain.rolling);
  out.detail = sampleFractalNormalized2D(sampleX, sampleZ, terrain.detail);
  out.ridge = sampleRidged2D(sampleX, sampleZ, terrain.ridge);
  out.dune = sampleFractalNormalized2D(sampleX, sampleZ, terrain.dune);

  return out;
}

export function sampleFillerDepthNoise(config, worldX, worldZ) {
  const fillerDepthNoise = config.surface.fillerDepthNoise;

  return sampleNormalized2D(
    worldX,
    worldZ,
    fillerDepthNoise.frequency,
    fillerDepthNoise.offsetX,
    fillerDepthNoise.offsetZ
  );
}
