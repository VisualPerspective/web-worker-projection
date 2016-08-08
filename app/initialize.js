import { json } from 'd3'

import Benchmark from './benchmark'

window.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('runBenchmark')
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    benchmark(
      this.elements['useWorker'].checked,
      document.querySelector('input[name="method"]:checked').value == 'svg',
      document.querySelector('input[name="detail"]:checked').value
    )

    document.querySelector('fieldset').disabled = true
  })

  document.getElementById('go').click()
})

function reportInvalid () {
  document.querySelector('fieldset').disabled = false
}

function reportResults (results) {
  var fps = results.frames / (results.totalTime / 1000)
  var mainThreadUtilization = results.mainThreadTime / results.totalTime * 100
  document.getElementById('results').innerHTML += '<tr>' +
    '<td>' + results.detail + '</td>' +
    '<td>' + results.method + '</td>' +
    '<td>' + results.useWorker + '</td>' +
    '<td class="number">' + fps.toFixed(1) + '</td>' +
    '<td class="number">' + mainThreadUtilization.toFixed(1) + '%</td>' +
  '</tr>'

  document.querySelector('fieldset').disabled = false
}

function benchmark (useWorker, useSVG, detail) {
  json("data/vectors-" + detail + ".json", function (error, vectors) {
     new Benchmark(
      useWorker, useSVG, detail, vectors,
      reportResults, reportInvalid
    )
  })
}

