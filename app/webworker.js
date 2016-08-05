import { geoPath } from 'd3'
import { satellite } from 'satellite.js'

var vectors, path, projection

var fns = {
  'setup': function (options) {
    vectors = options.vectors

    projection = satellite(
      options.distance,
      options.width,
      options.height
    )

    path = geoPath().projection(projection)
  },

  'projectPaths': function (options) {
    projection.rotate(options.rotate)

    var results = []
    for (var i = 0; i < vectors.length; i++) {
      results.push(path(vectors[i]))
    }

    postMessage(['pathsProjected', { paths: results }])
  }
}

onmessage = function (e) {
  var fnName = e.data[0]
  var options = e.data[1]
  fns[fnName](options)
}
