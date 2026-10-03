export function trianglePoints(width: number, height: number): number[] {
  return [width / 2, 0, width, height, 0, height]
}

export function starPoints(outerRadius: number, innerRadius?: number, numPoints = 5): number[] {
  const inner = innerRadius ?? outerRadius * 0.4
  const pts: number[] = []
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : inner
    const angle = (Math.PI / numPoints) * i - Math.PI / 2
    pts.push(Math.cos(angle) * r, Math.sin(angle) * r)
  }
  return pts
}

export function diamondPoints(width: number, height: number): number[] {
  return [width / 2, 0, width, height / 2, width / 2, height, 0, height / 2]
}
