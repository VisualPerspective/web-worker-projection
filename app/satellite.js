import { geoSatellite } from 'd3-geo-projection'

export function satellite (
  distance,
  width,
  height
) {
  return geoSatellite()
    .distance(distance)
    .translate([width / 2, height / 2])
    .scale(width * 0.8)
    .clipAngle(Math.acos(1 / distance) * 180 / Math.PI - 1e-6)
    .precision(.1);
}
