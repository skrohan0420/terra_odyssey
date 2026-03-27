import { BIOME_IDS, getBiomeDefinition } from "./biome";
import { clamp, clamp01, lerp, smoothstep } from "./terrainMath";

const NATURAL_BIOME_IDS = Object.freeze([
  BIOME_IDS.PLAINS,
  BIOME_IDS.DESERT,
  BIOME_IDS.HILLS,
  BIOME_IDS.MOUNTAINS
]);

export function createBiomeWeightScratch() {
  return {
    [BIOME_IDS.PLAINS]: 0,
    [BIOME_IDS.DESERT]: 0,
    [BIOME_IDS.HILLS]: 0,
    [BIOME_IDS.MOUNTAINS]: 0
  };
}

export function computeBiomeWeights(climate, config, out) {
  const weights = config.biomeWeights;
  const mountainWeight =
    smoothstep(
      weights.mountainPeakStart,
      weights.mountainPeakEnd,
      climate.peaks
    ) *
    smoothstep(
      weights.mountainRuggedStart,
      weights.mountainRuggedEnd,
      climate.ruggedness
    );
  const hillSeed = Math.max(climate.ruggedness, climate.peaks * 0.76);
  const hillWeight =
    Math.max(
      smoothstep(weights.hillStart, weights.hillEnd, hillSeed),
      smoothstep(
        weights.hillPeakAssistStart,
        weights.hillPeakAssistEnd,
        climate.peaks
      ) * smoothstep(weights.hillStart, weights.hillEnd, climate.ruggedness)
    ) *
    (1 - mountainWeight * 0.82);
  const desertWeight =
    smoothstep(
      weights.desertTempStart,
      weights.desertTempEnd,
      climate.temperature
    ) *
    (1 -
      smoothstep(
        weights.desertMoistureStart,
        weights.desertMoistureEnd,
        climate.moisture
      )) *
    (1 - mountainWeight * 0.6);
  const plainsWeight =
    weights.plainsBase +
    (1 - climate.ruggedness) * 0.42 +
    (1 - climate.peaks) * 0.18 +
    climate.moisture * 0.08;
  const blendFloor = weights.blendFloor;

  out[BIOME_IDS.PLAINS] = plainsWeight + blendFloor;
  out[BIOME_IDS.DESERT] = desertWeight + blendFloor;
  out[BIOME_IDS.HILLS] = hillWeight + blendFloor;
  out[BIOME_IDS.MOUNTAINS] = mountainWeight + blendFloor;

  let totalWeight = 0;

  for (const biomeId of NATURAL_BIOME_IDS) {
    totalWeight += out[biomeId];
  }

  if (totalWeight <= 0) {
    out[BIOME_IDS.PLAINS] = 1;
    out[BIOME_IDS.DESERT] = 0;
    out[BIOME_IDS.HILLS] = 0;
    out[BIOME_IDS.MOUNTAINS] = 0;
    return out;
  }

  for (const biomeId of NATURAL_BIOME_IDS) {
    out[biomeId] /= totalWeight;
  }

  return out;
}

export function getDominantBiomeId(weights) {
  let dominantBiomeId = BIOME_IDS.PLAINS;
  let dominantWeight = Number.NEGATIVE_INFINITY;

  for (const biomeId of NATURAL_BIOME_IDS) {
    if (weights[biomeId] > dominantWeight) {
      dominantBiomeId = biomeId;
      dominantWeight = weights[biomeId];
    }
  }

  return dominantBiomeId;
}

export function computeBiomeHeight(biomeId, climate, signals, config) {
  const biome = getBiomeDefinition(biomeId);
  const elevation = biome.elevation;
  const rawProfile =
    elevation.bias +
    signals.macro * elevation.macroWeight +
    signals.rolling * elevation.rollingWeight +
    signals.detail * elevation.detailWeight +
    signals.ridge * elevation.ridgeWeight +
    signals.dune * elevation.duneWeight +
    climate.temperature * elevation.temperatureWeight +
    climate.moisture * elevation.moistureWeight +
    climate.ruggedness * elevation.ruggednessWeight +
    climate.peaks * elevation.peaksWeight;
  const normalizedProfile = clamp01(rawProfile);
  const shapedProfile = Math.pow(
    normalizedProfile,
    elevation.profileExponent ?? 1
  );

  return clamp(
    Math.round(
      lerp(elevation.minHeight, elevation.maxHeight, shapedProfile)
    ),
    config.height.minSurfaceHeight,
    config.height.maxSurfaceHeight
  );
}

export function computeNaturalHeight(climate, signals, config, biomeWeights) {
  let totalHeight = 0;
  let totalWeight = 0;

  for (const biomeId of NATURAL_BIOME_IDS) {
    const weight = biomeWeights[biomeId];
    totalHeight += computeBiomeHeight(biomeId, climate, signals, config) * weight;
    totalWeight += weight;
  }

  if (totalWeight <= 0) {
    return config.height.baseHeight;
  }

  return clamp(
    Math.round(totalHeight / totalWeight),
    config.height.minSurfaceHeight,
    config.height.maxSurfaceHeight
  );
}
