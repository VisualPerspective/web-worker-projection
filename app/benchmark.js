import _ from 'lodash'
import { select, selectAll, geoJson, geoPath } from 'd3'
import { feature } from 'topojson'
import { satellite, updateSatellite } from 'satellite.js'

import { PathReader } from 'canvasProxy.js'
import { Animation } from 'animation.js'

import { WorkerlessSVG } from 'renderers/workerlessSVG.js'
import { WorkerSVG } from 'renderers/workerSVG.js'
import { WorkerlessCanvas } from 'renderers/workerlessCanvas.js'
import { WorkerCanvas } from 'renderers/workerCanvas.js'

export default class Benchmark {
  constructor (workers, useSVG, detail, vectors, reportResults, oneFrame) {
    this.workers = workers
    this.useSVG = useSVG
    this.detail = detail
    this.vectors = vectors
    this.reportResults = reportResults
    this.oneFrame = oneFrame

    this.featureNames = ['countries', 'rivers', 'lakes']
    this.features = {}
    this.paths = {}
    this.pathReader
    this.projectedPaths

    this.needsResize = true
    window.addEventListener('resize', () => { this.needsResize = true })

    this.view = { latitude: 0, longitude: 0, distance: 3.0 }
    this.useSVG ? this.initSVG() : this.initCanvas()
    this.useSVG ? this.resizeSVG() : this.resizeCanvas()
    this.setupFeatures()
    this.animation = new Animation()
    this.choosePathRenderer()
  }

  choosePathRenderer() {
    if (this.workers == 0) {
      this.renderer = this.useSVG ?
        new WorkerlessSVG(this) :
        new WorkerlessCanvas(this)
    }
    else {
      let featureGroups = [['countries', 'rivers', 'lakes']]
      if (this.workers == 2) {
        featureGroups = [['countries'], ['rivers', 'lakes']]
      }

      this.renderer = this.useSVG ?
        new WorkerSVG(this, featureGroups) :
        new WorkerCanvas(this, featureGroups)
    }

    this.renderer.ready.then(() => {
      this.render()
    })
  }

  setupFeatures () {
    this.featureNames.forEach((name) => {
      this.features[name] = feature(
        this.vectors, this.vectors.objects[name]
      )

      if (this.useSVG) {
        this.paths[name] = this.svg.append('path')
          .datum(this.features[name])
          .attr('class', name)
      }
    })
  }

  handleResize () {
    if (this.needsResize) {
      this.needsResize = false
      this.useSVG ? this.resizeSVG() : this.resizeCanvas()
    }
  }

  render () {
    this.animation.tick((elapsed) => {
      this.view.longitude += elapsed / 20
    },
    (totalElapsed) => {
      if (totalElapsed > 5000) {
        this.renderer.terminate()
        this.reportResults({
          'totalTime': totalElapsed,
          'frames': this.animation.frames,
          'mainThreadTime': this.animation.mainThread,
          'method': this.useSVG ? 'svg' : 'canvas',
          'workers': this.workers,
          'detail': this.detail
        })
      }
      else {
        updateSatellite(
          this.projection,
          this.width,
          this.height,
          [this.view.longitude, this.view.latitude, 0]
        )

        this.renderer.renderPaths(this)
      }
    })
  }

  initSVG() {
    selectAll('svg').remove()
    selectAll('canvas').remove()

    this.svg = select('.right').append('svg')
    this.projection = satellite(this.view.distance)
    this.path = geoPath().projection(this.projection)
    this.sphere = this.svg.append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'globe')
  }

  resizeSVG() {
    this.width = this.height = Math.floor(
      this.svg.node().getBoundingClientRect().width
    )

    this.svg.style('height', this.height + 'px')
      .attr('width', this.width)
      .attr('height', this.height)
  }

  initCanvas() {
    selectAll('svg').remove()
    selectAll('canvas').remove()

    this.canvas = select('.right').append('canvas')
    this.ctx = this.canvas.node().getContext('2d')
    this.projection = satellite(this.view.distance)
    this.path = geoPath().projection(this.projection).context(this.ctx)
  }

  resizeCanvas() {
    let devicePixelRatio = window.devicePixelRatio || 1

    this.width = this.height = Math.floor(
      this.canvas.node().getBoundingClientRect().width *
      devicePixelRatio
    )

    this.canvas.style('height', (this.height / devicePixelRatio) + 'px')
      .attr('width', this.width)
      .attr('height', this.height)
  }
}

