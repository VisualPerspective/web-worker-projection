import _ from 'lodash'
import { PathReader } from 'canvasProxy.js'

export class WorkerClient {
  constructor (world, features) {
    this.world = world

    if (!this.useSVG) {
      this.pathReader = {
        front: new PathReader(),
        back: new PathReader()
      }
    }

    this.worker = new Worker('webworker.js')

    this.worker.onmessage = (e) => {
      var fnName = e.data[0]
      var options = e.data[1]
      this[fnName](options)
    }

    this.worker.postMessage(['setup', {
      vectors: _.map(features, (name) => {
        return { 'name': name, data: this.world.features[name] }
      }),
      distance: this.world.view.distance,
      width: this.world.width,
      height: this.world.height,
      useSVG: this.world.useSVG
    }])
  }

  pathsProjected (options) {
    this.projecting = false
    this.projectedPaths = options.paths

    if (!this.world.useSVG) {
      this.pathReader.back = this.pathReader.front
      this.pathReader.front = new PathReader(
        options.commandBuffer,
        options.argumentBuffer,
        options.endOfPaths
      )
    }
  }

  requestCanvasPaths () {
    this.projecting = true

    this.worker.postMessage(['projectPaths', {
      'rotate': [this.world.view.longitude, this.world.view.latitude, 0],
      'commandBuffer': this.pathReader.back.commandArray.buffer,
      'argumentBuffer': this.pathReader.back.argumentArray.buffer
    }], [
      this.pathReader.back.commandArray.buffer,
      this.pathReader.back.argumentArray.buffer
    ])
  }

  requestSVGPaths () {
    this.projecting = true

    this.worker.postMessage(['projectPaths', {
      'rotate': [this.world.view.longitude, this.world.view.latitude, 0]
    }])
  }
}
