import _ from 'lodash'
import { json } from 'd3'

import Benchmark from './benchmark'

let benchmarking = false

window.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('runBenchmark')
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    runBenchmark(false)
    document.querySelector('fieldset').disabled = true
  })

  document.getElementById('go').click()
})


// On resize, if there's no benchmark running, run a one-frame
// "benchmark" which will not return results
let resizer = _.debounce(() => { runBenchmark(true, true) }, 100)
window.addEventListener('resize', function () {
  if (!benchmarking) {
    resizer()
  }
})

function runBenchmark (oneFrame, forceNoWorkers) {
  console.log(oneFrame)
  benchmarking = true
  var form = document.getElementById('runBenchmark')
  benchmark(
    forceNoWorkers ?
      0 :
      parseInt(document.querySelector('input[name="workers"]:checked').value, 10),
    document.querySelector('input[name="method"]:checked').value == 'svg',
    document.querySelector('input[name="detail"]:checked').value,
    oneFrame
  )
}

function reportResults (results) {
  benchmarking = false
  if (results) {
    var fps = results.frames / (results.totalTime / 1000)
    var mainThreadUtilization = results.mainThreadTime / results.totalTime * 100
    document.getElementById('results').innerHTML += '<tr>' +
      '<td>' + results.detail + '</td>' +
      '<td>' + results.method + '</td>' +
      '<td>' + results.workers + '</td>' +
      '<td class="number">' + fps.toFixed(1) + '</td>' +
      '<td class="number">' + mainThreadUtilization.toFixed(1) + '%</td>' +
    '</tr>'
  }

  document.querySelector('fieldset').disabled = false
}

function benchmark (workers, useSVG, detail, oneFrame) {
  json("data/vectors-" + detail + ".json", function (error, vectors) {
     new Benchmark(workers, useSVG, detail, vectors, reportResults, oneFrame)
  })
}

