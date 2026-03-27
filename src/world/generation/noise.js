import { SEED } from "../../config/worldConfig";

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

for (let i = 0; i < 256; i++) {
  p[i] = i;
}

for (let i = 255; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [p[i], p[j]] = [p[j], p[i]];
}

for (let i = 0; i < 512; i++) {
  perm[i] = p[i & 255];
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
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

export function sample2D(
  x,
  z,
  frequency = 1,
  offsetX = 0,
  offsetZ = 0
) {
  return perlin((x + offsetX) * frequency, (z + offsetZ) * frequency);
}

export function sampleNormalized2D(
  x,
  z,
  frequency = 1,
  offsetX = 0,
  offsetZ = 0
) {
  return clamp01(sample2D(x, z, frequency, offsetX, offsetZ) * 0.5 + 0.5);
}

export function sampleFractal2D(
  x,
  z,
  {
    frequency = 0.01,
    octaves = 3,
    persistence = 0.5,
    lacunarity = 2,
    offsetX = 0,
    offsetZ = 0
  } = {}
) {
  let total = 0;
  let amplitude = 1;
  let totalAmplitude = 0;
  let currentFrequency = frequency;

  for (let i = 0; i < octaves; i++) {
    total += sample2D(x, z, currentFrequency, offsetX, offsetZ) * amplitude;
    totalAmplitude += amplitude;
    amplitude *= persistence;
    currentFrequency *= lacunarity;
  }

  return totalAmplitude === 0 ? 0 : total / totalAmplitude;
}

export function sampleFractalNormalized2D(x, z, config) {
  return clamp01(sampleFractal2D(x, z, config) * 0.5 + 0.5);
}

export function sampleRidged2D(
  x,
  z,
  {
    frequency = 0.01,
    octaves = 4,
    gain = 0.5,
    lacunarity = 2,
    offsetX = 0,
    offsetZ = 0
  } = {}
) {
  let total = 0;
  let amplitude = 1;
  let totalAmplitude = 0;
  let currentFrequency = frequency;

  for (let i = 0; i < octaves; i++) {
    const signal = 1 - Math.abs(
      sample2D(x, z, currentFrequency, offsetX, offsetZ)
    );

    total += signal * amplitude;
    totalAmplitude += amplitude;
    amplitude *= gain;
    currentFrequency *= lacunarity;
  }

  return totalAmplitude === 0 ? 0 : clamp01(total / totalAmplitude);
}

export function getHeight(x, z) {
  const total = sampleFractal2D(x, z, {
    frequency: 0.02,
    octaves: 2,
    persistence: 0.5,
    lacunarity: 2
  });

  return Math.floor(total * 15 + 20);
}
