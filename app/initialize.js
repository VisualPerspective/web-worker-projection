import {
  select,
  selectAll,
  json,
  geoJson,
  geoPath
} from 'd3'

import { feature } from 'topojson'

import { satellite } from './satellite.js'

window.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('runBenchmark')
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    benchmark(
      this.elements['useWorker'].checked,
      this.elements['detail'].value
    )

    document.querySelector('fieldset').disabled = true
  })

  document.getElementById('go').click()
})

function reportResults(results) {
  var fps = results.frames / (results.totalTime / 1000)
  var mainThreadUtilization = results.mainThreadTime / results.totalTime * 100
  document.getElementById('results').innerHTML += '<tr>' +
    '<td>' + results.detail + '</td>' +
    '<td>' + results.useWorker + '</td>' +
    '<td class="number">' + fps.toPrecision(3) + '</td>' +
    '<td class="number">' + mainThreadUtilization.toPrecision(2) + '%</td>' +
  '</tr>'

  document.querySelector('fieldset').disabled = false
}

function benchmark (useWorker, detail) {
  json("data/vectors-" + detail + ".json", function (error, vectors) {
    runBenchmark(useWorker, detail, vectors)
  })
}

function runBenchmark (useWorker, detail, vectors) {
  var svg = initSVG()
  var width = svg.attr('width')
  var height = svg.attr('height')
  var latitude = 0, longitude = 0
  var distance = 2.0
  var projection = satellite(distance, width, height)
  var path = geoPath().projection(projection)
  var featureNames = ['countries', 'rivers', 'lakes']
  var features = {}, paths = {}, projectedPaths = []
  var startTime, lastTime, mainThreadTime = 0, frames = 0
  var workerProjecting = false, worker

  svg.append("path").datum({ type: "Sphere" })
    .attr("class", "globe").attr("d", path)

  featureNames.forEach(function (name) {
    features[name] = feature(vectors, vectors.objects[name])
    paths[name] = svg.append("path")
      .datum(features[name])
      .attr("d", path)
      .attr("class", name)
  })

  if (useWorker) {
    worker = createWorker(features, distance, width, height)
  }

  render()

  function render () {
    var time = window.performance.now()
    if (!startTime) {
      startTime = lastTime = time
    }
    else {
      longitude += (time - lastTime) / 20
      lastTime = time
    }

    if ((time - startTime) > 5000) {
      reportResults({
        'totalTime': time - startTime,
        'frames': frames,
        'mainThreadTime': mainThreadTime,
        'useWorker': useWorker,
        'detail': detail
      })
    }
    else {
      useWorker ? workerRender() : workerlessRender()
    }

    if (startTime !== lastTime) {
      mainThreadTime += (window.performance.now() - time)
    }
  }

  function workerlessRender() {
    frames++
    projection.rotate([longitude, latitude, 0])
    featureNames.forEach(function (name) {
      paths[name].attr('d', path)
    })

    window.requestAnimationFrame(render)
  }

  function workerRender() {
    if (!workerProjecting) {
      frames++
      workerProjecting = true

      worker.postMessage(['projectPaths', {
        'rotate': [longitude, latitude, 0]
      }])

      featureNames.forEach(function (name, i) {
        paths[name].attr('d', projectedPaths[i])
      })

      window.requestAnimationFrame(render)
    }
    else {
      setTimeout(render, 1)
    }
  }

  function createWorker(features, distance, width, height) {
    var fns = {
      'pathsProjected': function (options) {
        workerProjecting = false
        projectedPaths = options.paths
      }
    }

    var worker = new Worker('webworker.js')

    worker.onmessage = function (e) {
      var fnName = e.data[0]
      var options = e.data[1]
      fns[fnName](options)
    }

    worker.postMessage(['setup', {
      vectors: [features['countries'], features['rivers'], features['lakes']],
      distance: distance,
      width: width,
      height: height
    }])

    return worker
  }
}

function initSVG () {
  selectAll('svg').remove()

  var svg = select('.right').append('svg')
  var size = svg.node().getBoundingClientRect().width

  svg.style('height', size + 'px')
    .attr('width', size)
    .attr('height', size)

  return svg
}
