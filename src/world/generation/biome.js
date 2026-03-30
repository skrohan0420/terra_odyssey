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
      baseOffset: 4,
      macroAmplitude: 8,
      rollingAmplitude: 6,
      detailAmplitude: 2,
      ridgeAmplitude: 2,
      duneAmplitude: 0,
      temperatureOffset: 1,
      moistureOffset: 2,
      ruggednessOffset: -4,
      peaksOffset: -5
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.GRASS,
      fillerBlockId: BLOCK_IDS.DIRT,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 3,
      fillerDepthMax: 5,
      stoneSlopeThreshold: 10,
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
      baseOffset: 5,
      macroAmplitude: 7,
      rollingAmplitude: 5,
      detailAmplitude: 1,
      ridgeAmplitude: 2,
      duneAmplitude: 8,
      temperatureOffset: 3,
      moistureOffset: -5,
      ruggednessOffset: -2,
      peaksOffset: -5
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.SAND,
      fillerBlockId: BLOCK_IDS.SAND,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 4,
      fillerDepthMax: 7,
      stoneSlopeThreshold: 10,
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
      baseOffset: 16,
      macroAmplitude: 16,
      rollingAmplitude: 13,
      detailAmplitude: 3,
      ridgeAmplitude: 14,
      duneAmplitude: 0,
      temperatureOffset: 0,
      moistureOffset: 1,
      ruggednessOffset: 8,
      peaksOffset: 8
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.GRASS,
      fillerBlockId: BLOCK_IDS.DIRT,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 3,
      fillerDepthMax: 5,
      stoneSlopeThreshold: 8,
      stoneHeightThreshold: 136
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
      baseOffset: 44,
      macroAmplitude: 18,
      rollingAmplitude: 10,
      detailAmplitude: 4,
      ridgeAmplitude: 36,
      duneAmplitude: 0,
      temperatureOffset: -1,
      moistureOffset: 0,
      ruggednessOffset: 8,
      peaksOffset: 18
    }),
    surface: Object.freeze({
      topBlockId: BLOCK_IDS.GRASS,
      fillerBlockId: BLOCK_IDS.DIRT,
      stoneBlockId: BLOCK_IDS.STONE,
      fillerDepthMin: 2,
      fillerDepthMax: 4,
      stoneSlopeThreshold: 6,
      stoneHeightThreshold: 170
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
