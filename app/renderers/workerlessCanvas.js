export class WorkerlessCanvas {
  constructor (world) {
    this.world = world
    this.ready = Promise.resolve()
  }

  renderPaths () {
    this.world.animation.frames++
    this.world.handleResize()
    let ctx = this.world.ctx
    ctx.clearRect(0, 0, this.world.width, this.world.height)

    ctx.fillStyle = '#78a'
    ctx.beginPath()
    this.world.path({ type: 'Sphere' })
    ctx.fill()
    ctx.lineWidth = 1.0
    ctx.strokeStyle = '#78a'
    ctx.stroke()

    ctx.beginPath()
    this.world.path(this.world.features['countries'])
    ctx.fillStyle = '#eee'
    ctx.fill()
    ctx.lineWidth = 0.5
    ctx.strokeStyle = '#78a'
    ctx.stroke()

    ctx.beginPath()
    this.world.path(this.world.features['rivers'])
    ctx.lineWidth = 0.5
    ctx.strokeStyle = '#78a'
    ctx.stroke()

    ctx.beginPath()
    this.world.path(this.world.features['lakes'])
    ctx.fillStyle = '#78a'
    ctx.fill()

    window.requestAnimationFrame(() => { this.world.render() })
  }

  terminate() {}
}
