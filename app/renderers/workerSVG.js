import _ from 'lodash'
import { WorkerClient } from 'workerClient.js'

export class WorkerSVG {
  constructor (world, featureGroups) {
    this.world = world
    this.featureGroups = featureGroups
    this.workerClients = _.map(this.featureGroups, (group) => {
      return new WorkerClient(this.world, group)
    })

    this.ready = new Promise((resolve) => { this.readyResolver = resolve })
    Promise.all(_.map(this.workerClients, 'ready')).then(() => {
      this.readyResolver()
    })
  }

  renderPaths () {
    if (!_.some(this.workerClients, 'projecting')) {
      this.world.animation.frames++
      this.world.handleResize()
      this.world.sphere.attr('d', this.world.path)

      _.each(this.workerClients, (client) => { client.requestSVGPaths() })

      if (_.every(this.workerClients, 'projectedPaths')) {
        let projectedPaths = {}
        _.each(this.workerClients, (client) => {
          _.each(client.projectedPaths, (path) => {
            projectedPaths[path.name] = path.data
          })
        })

        _.each(this.world.featureNames, (name) => {
          this.world.paths[name].attr('d', projectedPaths[name])
        })
      }

      window.requestAnimationFrame(() => { this.world.render() })
    }
    else {
      setTimeout(() => { this.world.render() }, 1)
    }
  }

  terminate() {
    _.each(this.workerClients, (client) => {
      client.worker.terminate()
    })
  }
}
