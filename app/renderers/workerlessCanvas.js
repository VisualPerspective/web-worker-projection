export function renderPaths (world) {
  world.animation.frames++
  world.projection.rotate([world.view.longitude, world.view.latitude, 0])

  let ctx = world.ctx
  ctx.clearRect(0, 0, world.width, world.height)

  ctx.fillStyle = '#78a'
  ctx.beginPath()
  world.path({ type: 'Sphere' })
  ctx.fill()
  ctx.lineWidth = 1.0
  ctx.strokeStyle = '#457'
  ctx.stroke()

  ctx.beginPath()
  world.path(world.features['countries'])
  ctx.fillStyle = '#eee'
  ctx.fill()
  ctx.lineWidth = 1.0
  ctx.strokeStyle = '#457'
  ctx.stroke()

  ctx.beginPath()
  world.path(world.features['rivers'])
  ctx.lineWidth = 0.5
  ctx.strokeStyle = '#78a'
  ctx.stroke()

  ctx.beginPath()
  world.path(world.features['lakes'])
  ctx.fillStyle = '#78a'
  ctx.fill()

  window.requestAnimationFrame(() => { world.render() })
}
