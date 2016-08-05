import { json } from 'd3'

import Benchmark from './benchmark'

window.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('runBenchmark')
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    benchmark(
      this.elements['useWorker'].checked,
      document.querySelector('input[name="detail"]:checked').value
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
     new Benchmark(useWorker, detail, vectors, reportResults)
  })
}

