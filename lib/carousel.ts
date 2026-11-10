export function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

export function shortestDistance(index: number, current: number, length: number): number {
  let distance = wrapIndex(index - current, length);
  if (distance > length / 2) distance -= length;
  return distance;
}
