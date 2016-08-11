import { WorkerClient } from 'workerClient.js'

export class WorkerSVG {
  constructor (world) {
    this.world = world
    this.workerClient = new WorkerClient(this.world)
  }

  renderPaths () {
    if (!this.workerClient.projecting) {
      this.world.animation.frames++
      this.workerClient.requestSVGPaths()

      if (this.workerClient.projectedPaths) {
        this.world.featureNames.forEach((name, i) => {
          this.world.paths[name].attr('d', this.workerClient.projectedPaths[i])
        })
      }

      window.requestAnimationFrame(() => { this.world.render() })
    }
    else {
      setTimeout(() => { this.world.render() }, 1)
    }
  }
}
