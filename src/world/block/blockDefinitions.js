import { BLOCK_IDS } from "./blockTypes";
import { borderShade, paintTexture, toStyle } from "./textureUtils";

const grassPalette = [
  [104, 160, 74],
  [118, 176, 84],
  [132, 188, 95]
];

const dirtPalette = [
  [113, 84, 58],
  [124, 92, 64],
  [138, 104, 76]
];

const stonePalette = [
  [118, 124, 130],
  [132, 138, 144],
  [148, 153, 158]
];

function grassTone(x, y) {
  const patchX = Math.floor(x / 3);
  const patchY = Math.floor(y / 3);
  return grassPalette[(patchX + patchY) % grassPalette.length];
}

function dirtTone(x, y) {
  const patchX = Math.floor(x / 4);
  const patchY = Math.floor(y / 2);
  return dirtPalette[(patchX + patchY) % dirtPalette.length];
}

function stoneTone(x, y) {
  const patchX = Math.floor(x / 2);
  const patchY = Math.floor(y / 2);
  return stonePalette[(patchX + patchY) % stonePalette.length];
}

function createGrassTopTexture() {
  return paintTexture((x, y) => {
    const base = grassTone(x, y);
    let shade = borderShade(x, y, -6);

    if ((x === 2 && y === 2) || (x === 5 && y === 3) || (x === 3 && y === 5)) {
      shade += 8;
    }

    return toStyle(base, shade);
  });
}

function createDirtTexture() {
  return paintTexture((x, y) => {
    const base = dirtTone(x, y);
    let shade = borderShade(x, y, -7);

    if ((x === 1 && y === 4) || (x === 6 && y === 2)) {
      shade -= 8;
    }

    return toStyle(base, shade);
  });
}

function createGrassSideTexture() {
  return paintTexture((x, y) => {
    if (y < 3) {
      const paletteIndex = Math.min(
        grassPalette.length - 1,
        Math.floor(x / 3)
      );
      const base = grassPalette[paletteIndex];
      return toStyle(base, borderShade(x, y, -6) - y * 2);
    }

    const base = dirtTone(x, y);
    let shade = borderShade(x, y, -8);

    if (y === 3 && (x === 2 || x === 5)) {
      shade += 6;
    }

    return toStyle(base, shade);
  });
}

function createStoneTexture() {
  return paintTexture((x, y) => {
    const base = stoneTone(x, y);
    let shade = borderShade(x, y, -6);

    if ((x === 2 && y === 1) || (x === 5 && y === 4) || (x === 3 && y === 6)) {
      shade += 7;
    }

    if ((x === 1 && y === 5) || (x === 6 && y === 2)) {
      shade -= 7;
    }

    return toStyle(base, shade);
  });
}

export const BLOCK_DEFINITIONS = Object.freeze({
  [BLOCK_IDS.GRASS]: Object.freeze({
    id: BLOCK_IDS.GRASS,
    isSolid: true,
    maxInstancesPerColumn: 1,
    textures: Object.freeze({
      top: createGrassTopTexture,
      side: createGrassSideTexture,
      bottom: createDirtTexture
    })
  }),
  [BLOCK_IDS.DIRT]: Object.freeze({
    id: BLOCK_IDS.DIRT,
    isSolid: true,
    maxInstancesPerColumn: 3,
    textures: Object.freeze({
      all: createDirtTexture
    })
  }),
  [BLOCK_IDS.STONE]: Object.freeze({
    id: BLOCK_IDS.STONE,
    isSolid: true,
    maxInstancesPerColumn: 2,
    textures: Object.freeze({
      all: createStoneTexture
    })
  })
});
