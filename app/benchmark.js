import { select, selectAll, geoJson, geoPath } from 'd3'
import { feature } from 'topojson'
import { satellite } from 'satellite.js'

import { PathReader } from 'canvasProxy.js'
import { Animation } from 'animation.js'

import { WorkerlessSVG } from 'renderers/workerlessSVG.js'
import { WorkerSVG } from 'renderers/workerSVG.js'
import { WorkerlessCanvas } from 'renderers/workerlessCanvas.js'
import { WorkerCanvas } from 'renderers/workerCanvas.js'

export default class Benchmark {
  constructor (useWorker, useSVG, detail, vectors, reportResults, reportInvalid) {
    this.useWorker = useWorker
    this.useSVG = useSVG
    this.detail = detail
    this.vectors = vectors
    this.reportResults = reportResults
    this.reportInvalid = reportInvalid

    this.featureNames = ['countries', 'rivers', 'lakes']
    this.features = {}
    this.paths = {}
    this.pathReader
    this.projectedPaths

    this.view = { latitude: 0, longitude: 0, distance: 3.0 }
    this.useSVG ? this.initSVG() : this.initCanvas()
    this.setupFeatures()

    this.animation = new Animation()

    this.renderer = this.choosePathRenderer()

    // just abandon test on resize
    window.addEventListener('resize', () => {
      document.querySelector('canvas, svg').style.display = 'none'
      this.invalid = true
    })

    this.render()
  }

  choosePathRenderer() {
    return this.useSVG ?
      (this.useWorker ? new WorkerSVG(this) : new WorkerlessSVG(this)) :
      (this.useWorker ? new WorkerCanvas(this) : new WorkerlessCanvas(this))
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
    this.animation.tick((elapsed) => {
      this.view.longitude += elapsed / 20
    },
    (totalElapsed) => {
      if (this.invalid) {
        this.reportInvalid()
      }
      else if (totalElapsed > 5000) {
        this.reportResults({
          'totalTime': totalElapsed,
          'frames': this.animation.frames,
          'mainThreadTime': this.animation.mainThread,
          'method': this.useSVG ? 'svg' : 'canvas',
          'useWorker': this.useWorker,
          'detail': this.detail
        })
      }
      else {
        this.renderer.renderPaths(this)
      }
    })
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

