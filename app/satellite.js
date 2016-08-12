import { geoSatellite } from 'd3-geo-projection'

export function satellite (distance) {
  return geoSatellite()
    .distance(distance)
    .clipAngle(Math.acos(1 / distance) * 180 / Math.PI - 1e-6)
    .precision(.1);
}

export function updateSatellite (projection, width, height, rotate) {
  projection
    .translate([width / 2, height / 2])
    .scale(width * 2 / 3)
    .rotate(rotate)
}
