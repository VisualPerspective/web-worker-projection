import { select, selectAll, geoJson, geoPath } from 'd3'
import { feature } from 'topojson'
import { satellite } from 'satellite.js'
import { PathReader } from 'canvasProxy.js'

import * as WorkerlessSVG from 'renderers/workerlessSVG.js'
import * as WorkerSVG from 'renderers/workerSVG.js'
import * as WorkerlessCanvas from 'renderers/workerlessCanvas.js'
import * as WorkerCanvas from 'renderers/workerCanvas.js'

export default class Benchmark {
  constructor (useWorker, useSVG, detail, vectors, reportResults) {
    this.useSVG = useSVG
    this.useWorker = useWorker
    this.detail = detail
    this.vectors = vectors
    this.reportResults = reportResults

    this.view = { latitude: 0, longitude: 0, distance: 2.0 }
    this.timing = { start: 0, last: 0, mainThread: 0, frames: 0 }

    this.useSVG ? this.initSVG() : this.initCanvas()
    this.renderPaths = this.choosePathRenderer().renderPaths

    this.featureNames = ['countries', 'rivers', 'lakes']
    this.features = {}
    this.paths = {}
    this.pathReader
    this.projectedPaths
    this.workerProjecting = false

    this.setupFeatures()
    if (this.useWorker) { this.createWorker() }
    this.render()
  }

  choosePathRenderer() {
    return this.useSVG ?
      (this.useWorker ? WorkerSVG : WorkerlessSVG) :
      (this.useWorker ? WorkerCanvas : WorkerlessCanvas)
  }

  setupFeatures () {
    this.featureNames.forEach((name) => {
      this.features[name] = feature(
        this.vectors, this.vectors.objects[name]
      )

      if (this.useSVG) {
        this.paths[name] = this.svg.append('path')
          .datum(this.features[name])
          .attr('d', this.path)
          .attr('class', name)
      }
    })
  }

  render () {
    var time = window.performance.now()
    if (!this.timing.start) {
      this.timing.start = this.timing.last = time
    }
    else {
      this.view.longitude += (time - this.timing.last) / 20
      this.timing.last = time
    }

    if ((time - this.timing.start) > 5000) {
      this.reportResults({
        'totalTime': time - this.timing.start,
        'frames': this.timing.frames,
        'mainThreadTime': this.timing.mainThread,
        'method': this.useSVG ? 'svg' : 'canvas',
        'useWorker': this.useWorker,
        'detail': this.detail
      })
    }
    else {
      this.renderPaths(this)
    }

    if (this.timing.start !== this.timing.last) {
      this.timing.mainThread += (window.performance.now() - time)
    }
  }

  createWorker() {
    var fns = {
      'pathsProjected': (options) => {
        this.projectedPaths = options.paths
        this.workerProjecting = false

        if (!this.useSVG) {
          this.pathReader = new PathReader(
            options.commandArray,
            options.argumentArray,
            options.endOfPaths
          )
        }
      }
    }

    this.worker = new Worker('webworker.js')

    this.worker.onmessage = (e) => {
      var fnName = e.data[0]
      var options = e.data[1]
      fns[fnName](options)
    }

    this.worker.postMessage(['setup', {
      vectors: [
        this.features['countries'],
        this.features['rivers'],
        this.features['lakes']
      ],
      distance: this.view.distance,
      width: this.width,
      height: this.height,
      useSVG: this.useSVG
    }])
  }

  initSVG() {
    selectAll('svg').remove()
    selectAll('canvas').remove()

    this.svg = select('.right').append('svg')
    this.width = this.height = this.svg.node().getBoundingClientRect().width

    this.svg.style('height', this.height + 'px')
      .attr('width', this.width)
      .attr('height', this.height)

    this.projection = satellite(this.view.distance, this.width, this.height)
    this.path = geoPath().projection(this.projection)

    this.svg.append('path').datum({ type: 'Sphere' })
      .attr('class', 'globe').attr('d', this.path)
  }

  initCanvas() {
    selectAll('svg').remove()
    selectAll('canvas').remove()

    this.canvas = select('.right').append('canvas')
    let devicePixelRatio = window.devicePixelRatio || 1

    this.width = this.height =
      this.canvas.node().getBoundingClientRect().width *
      devicePixelRatio

    this.canvas.style('height', (this.height / devicePixelRatio) + 'px')
      .attr('width', this.width)
      .attr('height', this.height)

    this.ctx = this.canvas.node().getContext('2d')
    this.projection = satellite(this.view.distance, this.width, this.height)
    this.path = geoPath().projection(this.projection).context(this.ctx)
  }
}

