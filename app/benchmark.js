import {
  select,
  selectAll,
  geoJson,
  geoPath
} from 'd3'

import { feature } from 'topojson'

import { satellite } from './satellite.js'

export default class Benchmark {
  constructor (useWorker, detail, vectors, reportResults) {
    this.useWorker = useWorker
    this.detail = detail
    this.vectors = vectors
    this.reportResults = reportResults

    this.initSVG()

    this.view = { latitude: 0, longitude: 0, distance: 2.0 }
    this.timing = { start: 0, last: 0, mainThread: 0, frames: 0 }

    this.projection = satellite(this.view.distance, this.width, this.height)
    this.path = geoPath().projection(this.projection)
    this.featureNames = ['countries', 'rivers', 'lakes']
    this.features = {}
    this.paths = {}
    this.projectedPaths = []
    this.workerProjecting = false

    this.svg.append("path").datum({ type: "Sphere" })
      .attr("class", "globe").attr("d", this.path)

    this.setupFeatures()
    if (this.useWorker) { this.createWorker() }
    this.render()
  }

  setupFeatures () {
    this.featureNames.forEach((name) => {
      this.features[name] = feature(this.vectors, this.vectors.objects[name])
      this.paths[name] = this.svg.append("path")
        .datum(this.features[name])
        .attr("d", this.path)
        .attr("class", name)
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
        'useWorker': this.useWorker,
        'detail': this.detail
      })
    }
    else {
      this.useWorker ? this.workerRender() : this.workerlessRender()
    }

    if (this.timing.start !== this.timing.last) {
      this.timing.mainThread += (window.performance.now() - time)
    }
  }

  workerlessRender() {
    this.timing.frames++
    this.projection.rotate([this.view.longitude, this.view.latitude, 0])
    this.featureNames.forEach((name) => {
      this.paths[name].attr('d', this.path)
    })

    window.requestAnimationFrame(() => { this.render() })
  }

  workerRender() {
    if (!this.workerProjecting) {
      this.timing.frames++
      this.workerProjecting = true

      this.worker.postMessage(['projectPaths', {
        'rotate': [this.view.longitude, this.view.latitude, 0]
      }])

      this.featureNames.forEach((name, i) => {
        this.paths[name].attr('d', this.projectedPaths[i])
      })

      window.requestAnimationFrame(() => { this.render() })
    }
    else {
      setTimeout(() => { this.render() }, 1)
    }
  }

  createWorker() {
    var fns = {
      'pathsProjected': (options) => {
        this.workerProjecting = false
        this.projectedPaths = options.paths
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
      height: this.height
    }])
  }

  initSVG () {
    selectAll('svg').remove()

    this.svg = select('.right').append('svg')
    var size = this.svg.node().getBoundingClientRect().width

    this.width = size
    this.height = size

    this.svg.style('height', size + 'px')
      .attr('width', size)
      .attr('height', size)
  }
}

