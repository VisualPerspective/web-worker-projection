import _ from 'lodash'
import { PathReader } from '../canvasProxy.js'
import { WorkerClient } from 'workerClient.js'

export class WorkerCanvas {
  constructor (world, featureGroups) {
    this.world = world
    this.featureGroups = featureGroups
    this.workerClients = _.map(this.featureGroups, (group) => {
      return new WorkerClient(this.world, group)
    })
  }

  renderPaths () {
    if (!_.some(this.workerClients, 'projecting')) {
      this.world.animation.frames++
      _.each(this.workerClients, (client) => { client.requestCanvasPaths() })

      if (_.every(this.workerClients, 'projectedPaths')) {
        let ctx = this.world.ctx
        ctx.clearRect(0, 0, this.world.width, this.world.height)
	this.globe()

        _.each(this.workerClients, (client) => {
          _.each(client.projectedPaths, (name) => {
            this[name](client.pathReader)
	  })
	})
      }

      window.requestAnimationFrame(() => { this.world.render() })
    }
    else {
      setTimeout(() => { this.world.render() }, 1)
    }
  }

  globe() {
    let ctx = this.world.ctx
    ctx.fillStyle = '#78a'
    ctx.beginPath()
    this.world.path({ type: 'Sphere' })
    ctx.fill()
    ctx.lineWidth = 1.0
    ctx.strokeStyle = '#457'
    ctx.stroke()
  }

  countries(pathReader) {
    let ctx = this.world.ctx
    ctx.beginPath()
    pathReader.front.renderPath(ctx)
    ctx.fillStyle = '#eee'
    ctx.fill()
    ctx.lineWidth = 1.0
    ctx.strokeStyle = '#457'
    ctx.stroke()
  }

  lakes(pathReader) {
    let ctx = this.world.ctx
    ctx.beginPath()
    pathReader.front.renderPath(ctx)
    ctx.fillStyle = '#78a'
    ctx.fill()
  }

  rivers(pathReader) {
    let ctx = this.world.ctx
    ctx.beginPath()
    pathReader.front.renderPath(ctx)
    ctx.lineWidth = 0.5
    ctx.strokeStyle = '#78a'
    ctx.stroke()
  }
}
