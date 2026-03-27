export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clamp01(value) {
  return clamp(value, 0, 1);
}

export function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

export function smoothstep(min, max, value) {
  if (min === max) {
    return value < min ? 0 : 1;
  }

  const t = clamp01((value - min) / (max - min));
  return t * t * (3 - 2 * t);
}

export function toBlockCoord(value) {
  return Math.floor(value + 0.5);
}
