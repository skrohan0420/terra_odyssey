import { SEED } from "../config";

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);
const perm = new Uint8Array(512);
const p = new Uint8Array(256);

for (let i = 0; i < 256; i++) p[i] = i;
for (let i = 255; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [p[i], p[j]] = [p[j], p[i]];
}
for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function grad(hash, x, z) {
  const h = hash & 3;
  const u = h < 2 ? x : z;
  const v = h < 2 ? z : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin(x, z) {
  const X = Math.floor(x) & 255;
  const Z = Math.floor(z) & 255;

  x -= Math.floor(x);
  z -= Math.floor(z);

  const u = fade(x);
  const v = fade(z);

  const aa = perm[perm[X] + Z];
  const ab = perm[perm[X] + Z + 1];
  const ba = perm[perm[X + 1] + Z];
  const bb = perm[perm[X + 1] + Z + 1];

  return lerp(
    lerp(grad(aa, x, z), grad(ba, x - 1, z), u),
    lerp(grad(ab, x, z - 1), grad(bb, x - 1, z - 1), u),
    v
  );
}

export function getHeight(x, z) {
  let total = 0;
  let frequency = 0.02;
  let amplitude = 15;
  let persistence = 0.5;
  let octaves = 2;

  for (let i = 0; i < octaves; i++) {
    total += perlin(x * frequency, z * frequency) * amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return Math.floor(total + 20);
}