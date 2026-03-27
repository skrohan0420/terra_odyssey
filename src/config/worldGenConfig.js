import { WORLD_BASE_HEIGHT, WORLD_HEIGHT } from "./worldConfig";

export const WORLD_GEN_CONFIG = Object.freeze({
  climate: Object.freeze({
    warpX: Object.freeze({
      frequency: 0.0008,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2,
      amplitude: 96,
      offsetX: 7100,
      offsetZ: -5100
    }),
    warpZ: Object.freeze({
      frequency: 0.0008,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2,
      amplitude: 96,
      offsetX: 8830,
      offsetZ: -6010
    }),
    temperature: Object.freeze({
      frequency: 0.00082,
      octaves: 3,
      persistence: 0.5,
      lacunarity: 2,
      offsetX: 1400,
      offsetZ: -2600
    }),
    moisture: Object.freeze({
      frequency: 0.00095,
      octaves: 3,
      persistence: 0.5,
      lacunarity: 2,
      offsetX: -3200,
      offsetZ: 1800
    }),
    ruggedness: Object.freeze({
      frequency: 0.0014,
      octaves: 3,
      persistence: 0.52,
      lacunarity: 2,
      offsetX: 4100,
      offsetZ: -900
    }),
    peaks: Object.freeze({
      frequency: 0.0018,
      octaves: 4,
      gain: 0.56,
      lacunarity: 2,
      offsetX: -5200,
      offsetZ: 3400
    })
  }),
  terrain: Object.freeze({
    warpX: Object.freeze({
      frequency: 0.0032,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2,
      amplitude: 28,
      offsetX: 6100,
      offsetZ: -4300
    }),
    warpZ: Object.freeze({
      frequency: 0.0032,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2,
      amplitude: 28,
      offsetX: 7470,
      offsetZ: -5210
    }),
    macro: Object.freeze({
      frequency: 0.0019,
      octaves: 4,
      persistence: 0.54,
      lacunarity: 2,
      offsetX: 1900,
      offsetZ: -3100
    }),
    rolling: Object.freeze({
      frequency: 0.0048,
      octaves: 3,
      persistence: 0.5,
      lacunarity: 2,
      offsetX: -900,
      offsetZ: 3300
    }),
    detail: Object.freeze({
      frequency: 0.0145,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2,
      offsetX: 4200,
      offsetZ: -600
    }),
    ridge: Object.freeze({
      frequency: 0.0044,
      octaves: 4,
      gain: 0.58,
      lacunarity: 2,
      offsetX: -4700,
      offsetZ: 1200
    }),
    dune: Object.freeze({
      frequency: 0.0084,
      octaves: 3,
      persistence: 0.45,
      lacunarity: 2,
      offsetX: 2600,
      offsetZ: 4700
    })
  }),
  height: Object.freeze({
    baseHeight: WORLD_BASE_HEIGHT,
    minSurfaceHeight: WORLD_BASE_HEIGHT - 8,
    maxSurfaceHeight: WORLD_HEIGHT - 1
  }),
  biomeWeights: Object.freeze({
    blendFloor: 0.02,
    plainsBase: 0.16,
    mountainPeakStart: 0.54,
    mountainPeakEnd: 0.84,
    mountainRuggedStart: 0.4,
    mountainRuggedEnd: 0.8,
    hillStart: 0.34,
    hillEnd: 0.72,
    hillPeakAssistStart: 0.3,
    hillPeakAssistEnd: 0.64,
    desertTempStart: 0.5,
    desertTempEnd: 0.78,
    desertMoistureStart: 0.22,
    desertMoistureEnd: 0.48
  }),
  surface: Object.freeze({
    fillerDepthNoise: Object.freeze({
      frequency: 0.022,
      offsetX: -2800,
      offsetZ: 2500
    })
  })
});
