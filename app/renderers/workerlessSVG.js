export function renderPaths (world) {
  world.timing.frames++
  world.projection.rotate([world.view.longitude, world.view.latitude, 0])
  world.featureNames.forEach((name) => {
      world.paths[name].attr('d', world.path)
  })

  window.requestAnimationFrame(() => {
    world.render()
  })
}
