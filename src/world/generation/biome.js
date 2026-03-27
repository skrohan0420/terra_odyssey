import { WORLD_BASE_HEIGHT } from "../../config/worldConfig";
import { BLOCK_IDS } from "../block/blockTypes";

export const BIOME_IDS = Object.freeze({
  PLAINS: 1,
  DESERT: 2,
  HILLS: 3,
  MOUNTAINS: 4
});

export const NATURAL_BIOME_MODE = "natural";

export const BIOME_DEFINITIONS = Object.freeze({
  [BIOME_IDS.PLAINS]: Object.freeze({
    id: BIOME_IDS.PLAINS,
    key: "plains",
    label: "Plains",
    visual: Object.freeze({
      mapColor: Object.freeze([97, 148, 92])
    }),
    elevation: Object.freeze({
      minHeight: WORLD_BASE_HEIGHT,
      maxHeight: 92,
      bias: 0.05,
      macroWeight: 0.18,
      rollingWeight: 0.2,
      detailWeight: 0.06,
      ridgeWeight: 0.03,
      duneWeight: 0,
      temperatureWeight: 0.02,
      moistureWeight: 0.08,
      ruggednessWeight: -0.12,
      peaksWeight: -0.16,
      profileExponent: 1.28
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.GRASS,
      fillerBlockId: BLOCK_IDS.DIRT,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 3,
      fillerDepthMax: 5,
      stoneSlopeThreshold: 8,
      stoneHeightThreshold: Number.POSITIVE_INFINITY
    })
  }),
  [BIOME_IDS.DESERT]: Object.freeze({
    id: BIOME_IDS.DESERT,
    key: "desert",
    label: "Desert",
    visual: Object.freeze({
      mapColor: Object.freeze([201, 180, 110])
    }),
    elevation: Object.freeze({
      minHeight: WORLD_BASE_HEIGHT,
      maxHeight: 104,
      bias: 0.08,
      macroWeight: 0.16,
      rollingWeight: 0.14,
      detailWeight: 0.05,
      ridgeWeight: 0.04,
      duneWeight: 0.36,
      temperatureWeight: 0.08,
      moistureWeight: -0.18,
      ruggednessWeight: -0.04,
      peaksWeight: -0.1,
      profileExponent: 1.16
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.SAND,
      fillerBlockId: BLOCK_IDS.SAND,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 4,
      fillerDepthMax: 7,
      stoneSlopeThreshold: 8,
      stoneHeightThreshold: Number.POSITIVE_INFINITY
    })
  }),
  [BIOME_IDS.HILLS]: Object.freeze({
    id: BIOME_IDS.HILLS,
    key: "hills",
    label: "Hills",
    visual: Object.freeze({
      mapColor: Object.freeze([129, 138, 89])
    }),
    elevation: Object.freeze({
      minHeight: WORLD_BASE_HEIGHT,
      maxHeight: 150,
      bias: 0.1,
      macroWeight: 0.24,
      rollingWeight: 0.22,
      detailWeight: 0.1,
      ridgeWeight: 0.3,
      duneWeight: 0,
      temperatureWeight: 0,
      moistureWeight: 0.03,
      ruggednessWeight: 0.24,
      peaksWeight: 0.12,
      profileExponent: 0.94
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.GRASS,
      fillerBlockId: BLOCK_IDS.DIRT,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 3,
      fillerDepthMax: 5,
      stoneSlopeThreshold: 5,
      stoneHeightThreshold: 116
    })
  }),
  [BIOME_IDS.MOUNTAINS]: Object.freeze({
    id: BIOME_IDS.MOUNTAINS,
    key: "mountains",
    label: "Mountains",
    visual: Object.freeze({
      mapColor: Object.freeze([154, 159, 166])
    }),
    elevation: Object.freeze({
      minHeight: 120,
      maxHeight: 200,
      bias: 0.08,
      macroWeight: 0.18,
      rollingWeight: 0.12,
      detailWeight: 0.08,
      ridgeWeight: 0.48,
      duneWeight: 0,
      temperatureWeight: -0.02,
      moistureWeight: 0,
      ruggednessWeight: 0.2,
      peaksWeight: 0.36,
      profileExponent: 0.78
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.GRASS,
      fillerBlockId: BLOCK_IDS.DIRT,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 2,
      fillerDepthMax: 4,
      stoneSlopeThreshold: 4,
      stoneHeightThreshold: 146
    })
  })
});

export function getBiomeDefinition(biomeId) {
  return BIOME_DEFINITIONS[biomeId] ?? BIOME_DEFINITIONS[BIOME_IDS.PLAINS];
}

export function getBiomeLabel(biomeId) {
  return getBiomeDefinition(biomeId).label;
}

export const BIOME_MODE_OPTIONS = Object.freeze([
  Object.freeze({
    value: NATURAL_BIOME_MODE,
    label: "Random Natural World"
  }),
  ...Object.values(BIOME_DEFINITIONS).map((biome) =>
    Object.freeze({
      value: String(biome.id),
      label: biome.label
    })
  )
]);
