import { PathReader } from '../canvasProxy.js'
import { WorkerClient } from 'workerClient.js'

export class WorkerCanvas {
  constructor (world) {
    this.world = world
    this.workerClient = new WorkerClient(this.world)
  }

  renderPaths () {
    if (!this.workerClient.projecting) {
      this.workerClient.requestCanvasPaths()
      this.world.animation.frames++
      let ctx = this.world.ctx

      ctx.clearRect(0, 0, this.world.width, this.world.height)

      ctx.fillStyle = '#78a'
      ctx.beginPath()
      this.world.path({ type: 'Sphere' })
      ctx.fill()
      ctx.lineWidth = 1.0
      ctx.strokeStyle = '#457'
      ctx.stroke()

      ctx.beginPath()
      this.workerClient.pathReader.front.renderPath(ctx)
      ctx.fillStyle = '#eee'
      ctx.fill()
      ctx.lineWidth = 1.0
      ctx.strokeStyle = '#457'
      ctx.stroke()

      ctx.beginPath()
      this.workerClient.pathReader.front.renderPath(ctx)
      ctx.lineWidth = 0.5
      ctx.strokeStyle = '#78a'
      ctx.stroke()

      ctx.beginPath()
      this.workerClient.pathReader.front.renderPath(ctx)
      ctx.fillStyle = '#78a'
      ctx.fill()

      window.requestAnimationFrame(() => { this.world.render() })
    }
    else {
      setTimeout(() => { this.world.render() }, 1)
    }
  }
}
