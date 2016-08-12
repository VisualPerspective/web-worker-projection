export class WorkerlessSVG {
  constructor (world) {
    this.world = world
  }

  renderPaths () {
    this.world.animation.frames++
    this.world.handleResize()
    this.world.sphere.attr('d', this.world.path)

    this.world.featureNames.forEach((name) => {
        this.world.paths[name].attr('d', this.world.path)
    })

    window.requestAnimationFrame(() => {
      this.world.render()
    })
  }

  terminate() {}
}
