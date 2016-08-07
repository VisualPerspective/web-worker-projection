import { PathReader } from '../canvasProxy.js'

const BUFFER_SIZE = 1000000

export function renderPaths (world) {
  if (!world.pathReader) {
    world.pathReader = new PathReader(
      new Uint8Array(BUFFER_SIZE),
      new Float64Array(BUFFER_SIZE),
      []
    )

    requestCanvasPaths(world)
    window.requestAnimationFrame(() => { world.render() })
  }
  else if (!world.workerProjecting) {
    world.timing.frames++
    let ctx = world.ctx

    ctx.clearRect(0, 0, world.width, world.height)

    ctx.fillStyle = '#78a'
    ctx.beginPath()
    world.path({ type: 'Sphere' })
    ctx.fill()

    ctx.beginPath()
    world.pathReader.renderPath(ctx)
    ctx.fillStyle = '#eee'
    ctx.fill()
    ctx.lineWidth = 1.0
    ctx.strokeStyle = '#fff'
    ctx.stroke()

    ctx.beginPath()
    world.pathReader.renderPath(ctx)
    ctx.lineWidth = 0.5
    ctx.strokeStyle = '#88f'
    ctx.stroke()

    ctx.beginPath()
    world.pathReader.renderPath(ctx)
    ctx.fillStyle = '#88f'
    ctx.fill()

    requestCanvasPaths(world)
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
    'commandArray': world.pathReader.commandArray,
    'argumentArray': world.pathReader.argumentArray
  }], [
    world.pathReader.commandArray.buffer,
    world.pathReader.argumentArray.buffer
  ])
}
