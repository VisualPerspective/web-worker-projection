export class WorkerlessSVG {
  constructor (world) {
    this.world = world
  }

  renderPaths () {
    this.world.animation.frames++
    this.world.projection.rotate([this.world.view.longitude, this.world.view.latitude, 0])
    this.world.featureNames.forEach((name) => {
        this.world.paths[name].attr('d', this.world.path)
    })

    window.requestAnimationFrame(() => {
      this.world.render()
    })
  }

  terminate() {}
}
