import {
  select,
  selectAll,
  geoJson,
  geoPath
} from 'd3'

import { feature } from 'topojson'

import { satellite } from './satellite.js'

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

    this.featureNames = ['countries', 'rivers', 'lakes']
    this.features = {}
    this.paths = {}
    this.projectedPaths = []
    this.workerProjecting = false

    this.setupFeatures()
    if (this.useWorker) { this.createWorker() }
    this.render()
  }

  setupFeatures () {
    this.featureNames.forEach((name) => {
      this.features[name] = feature(this.vectors, this.vectors.objects[name])

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
      this.continueRender()
    }

    if (this.timing.start !== this.timing.last) {
      this.timing.mainThread += (window.performance.now() - time)
    }
  }

  continueRender() {
    if (this.useSVG) {
      this.useWorker ? this.workerSVG() : this.workerlessSVG()
    }
    else {
      this.useWorker ? this.workerCanvas() : this.workerlessCanvas()
    }
  }

  workerlessSVG() {
    this.timing.frames++
    this.projection.rotate([this.view.longitude, this.view.latitude, 0])
    this.featureNames.forEach((name) => {
        this.paths[name].attr('d', this.path)
    })

    window.requestAnimationFrame(() => { this.render() })
  }

  workerSVG() {
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

  workerlessCanvas() {
    this.timing.frames++
    this.projection.rotate([this.view.longitude, this.view.latitude, 0])

    let ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)

    // globe
    ctx.fillStyle = '#78a'
    ctx.beginPath()
    this.path({ type: 'Sphere' })
    ctx.fill()

    // countries
    ctx.beginPath()
    this.path(this.features['countries'])
    ctx.fillStyle = '#eee'
    ctx.fill()
    ctx.lineWidth = 1.0
    ctx.strokeStyle = '#fff'
    ctx.stroke()

    // lakes
    ctx.beginPath()
    this.path(this.features['lakes'])
    ctx.fillStyle = '#88f'
    ctx.fill()

    // rivers
    ctx.beginPath()
    this.path(this.features['rivers'])
    ctx.lineWidth = 0.5
    ctx.strokeStyle = '#88f'
    ctx.stroke()

    window.requestAnimationFrame(() => { this.render() })
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

