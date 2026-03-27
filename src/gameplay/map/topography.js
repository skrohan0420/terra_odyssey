import { CHUNK_SIZE, WATER_LEVEL } from "../../config/worldConfig";
import { getBiomeDefinition } from "../../world/generation/biome";

const LOWLAND_COLOR = [66, 118, 84];
const PLAIN_COLOR = [97, 148, 92];
const HIGHLAND_COLOR = [144, 138, 103];
const MOUNTAIN_COLOR = [166, 167, 172];
const SNOW_COLOR = [232, 239, 244];
const CONTOUR_STEP = 8;

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mixColors(from, to, amount) {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount
  ];
}

function sampleHeight(heights, x, z) {
  const clampedX = Math.max(0, Math.min(CHUNK_SIZE - 1, x));
  const clampedZ = Math.max(0, Math.min(CHUNK_SIZE - 1, z));
  return heights[clampedZ * CHUNK_SIZE + clampedX];
}

function sampleBiomeId(biomeIds, x, z) {
  if (!biomeIds) return 0;

  const clampedX = Math.max(0, Math.min(CHUNK_SIZE - 1, x));
  const clampedZ = Math.max(0, Math.min(CHUNK_SIZE - 1, z));
  return biomeIds[clampedZ * CHUNK_SIZE + clampedX];
}

function getHeightTint(height) {
  if (height < WATER_LEVEL + 6) {
    return mixColors(
      LOWLAND_COLOR,
      PLAIN_COLOR,
      Math.max(0, height - (WATER_LEVEL - 10)) / 16
    );
  }

  if (height < WATER_LEVEL + 28) {
    return mixColors(
      PLAIN_COLOR,
      HIGHLAND_COLOR,
      (height - (WATER_LEVEL + 6)) / 22
    );
  }

  if (height < WATER_LEVEL + 72) {
    return mixColors(
      HIGHLAND_COLOR,
      MOUNTAIN_COLOR,
      (height - (WATER_LEVEL + 28)) / 44
    );
  }

  return mixColors(
    MOUNTAIN_COLOR,
    SNOW_COLOR,
    Math.min((height - (WATER_LEVEL + 72)) / 54, 1)
  );
}

function getBaseColor(height, biomeId) {
  const biome = getBiomeDefinition(biomeId);
  const tint = getHeightTint(height);

  return mixColors(biome.visual.mapColor, tint, 0.32);
}

function hasContourLine(heights, x, z, height) {
  const contourBand = Math.floor(height / CONTOUR_STEP);

  return (
    Math.floor(sampleHeight(heights, x + 1, z) / CONTOUR_STEP) !== contourBand ||
    Math.floor(sampleHeight(heights, x - 1, z) / CONTOUR_STEP) !== contourBand ||
    Math.floor(sampleHeight(heights, x, z + 1) / CONTOUR_STEP) !== contourBand ||
    Math.floor(sampleHeight(heights, x, z - 1) / CONTOUR_STEP) !== contourBand
  );
}

function applyReliefShading(baseColor, heights, x, z, height) {
  const east = sampleHeight(heights, x + 1, z);
  const west = sampleHeight(heights, x - 1, z);
  const south = sampleHeight(heights, x, z + 1);
  const north = sampleHeight(heights, x, z - 1);

  const slopeX = west - east;
  const slopeZ = north - south;
  const relief = slopeX * 4 + slopeZ * 3;
  const ridge = Math.max(
    Math.abs(height - east),
    Math.abs(height - west),
    Math.abs(height - south),
    Math.abs(height - north)
  );

  let shade = relief;

  if (ridge >= 5) {
    shade -= 5;
  }

  if (hasContourLine(heights, x, z, height)) {
    shade -= 12;
  }

  return [
    clampChannel(baseColor[0] + shade),
    clampChannel(baseColor[1] + shade),
    clampChannel(baseColor[2] + shade)
  ];
}

export function createTopographyTile(surfaceData) {
  const tile = document.createElement("canvas");
  tile.width = CHUNK_SIZE;
  tile.height = CHUNK_SIZE;

  const ctx = tile.getContext("2d");
  const imageData = ctx.createImageData(CHUNK_SIZE, CHUNK_SIZE);
  const pixels = imageData.data;

  for (let z = 0; z < CHUNK_SIZE; z++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      const index = z * CHUNK_SIZE + x;
      const height = surfaceData.heights[index];
      const biomeId = sampleBiomeId(surfaceData.biomeIds, x, z);
      const shaded = applyReliefShading(
        getBaseColor(height, biomeId),
        surfaceData.heights,
        x,
        z,
        height
      );

      const pixelIndex = index * 4;
      pixels[pixelIndex] = shaded[0];
      pixels[pixelIndex + 1] = shaded[1];
      pixels[pixelIndex + 2] = shaded[2];
      pixels[pixelIndex + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return tile;
}
