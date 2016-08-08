import { PathReader } from '../canvasProxy.js'

export function renderPaths (world) {
  if (!world.pathReader) {
    world.pathReader = {
      front: new PathReader(),
      back: new PathReader()
    }

    requestCanvasPaths(world)
    window.requestAnimationFrame(() => { world.render() })
  }
  else if (!world.workerProjecting) {
    requestCanvasPaths(world)
    world.animation.frames++
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
    world.pathReader.front.renderPath(ctx)
    ctx.fillStyle = '#eee'
    ctx.fill()
    ctx.lineWidth = 1.0
    ctx.strokeStyle = '#457'
    ctx.stroke()

    ctx.beginPath()
    world.pathReader.front.renderPath(ctx)
    ctx.lineWidth = 0.5
    ctx.strokeStyle = '#78a'
    ctx.stroke()

    ctx.beginPath()
    world.pathReader.front.renderPath(ctx)
    ctx.fillStyle = '#78a'
    ctx.fill()

    window.requestAnimationFrame(() => { world.render() })
  }
  else {
    setTimeout(() => { world.render() }, 1)
  }
}


function requestCanvasPaths (world) {
  world.workerProjecting = true

  world.worker.postMessage(['projectPaths', {
    'rotate': [world.view.longitude, world.view.latitude, 0],
    'commandBuffer': world.pathReader.back.commandArray.buffer,
    'argumentBuffer': world.pathReader.back.argumentArray.buffer
  }], [
    world.pathReader.back.commandArray.buffer,
    world.pathReader.back.argumentArray.buffer
  ])
}
