import * as THREE from "three";

export const TEXTURE_SIZE = 8;

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function toStyle([r, g, b], shade = 0) {
  return `rgb(${clampChannel(r + shade)}, ${clampChannel(g + shade)}, ${clampChannel(b + shade)})`;
}

export function paintTexture(drawPixel) {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      ctx.fillStyle = drawPixel(x, y);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  return texture;
}

export function createLambertMaterial(texture) {
  return new THREE.MeshLambertMaterial({
    map: texture,
    dithering: true
  });
}

export function borderShade(x, y, shade = -8) {
  if (x === 0 || y === 0 || x === TEXTURE_SIZE - 1 || y === TEXTURE_SIZE - 1) {
    return shade;
  }

  return 0;
}
