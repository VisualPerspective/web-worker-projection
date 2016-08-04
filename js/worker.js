importScripts(
  '../node_modules/d3-selection/build/d3-selection.js',
  '../node_modules/d3-dispatch/build/d3-dispatch.js',
  '../node_modules/d3-array/build/d3-array.js',
  '../node_modules/d3-collection/build/d3-collection.js',
  '../node_modules/d3-request/build/d3-request.js',
  '../node_modules/d3-geo/build/d3-geo.js',
  '../node_modules/d3-geo-projection/build/d3-geo-projection.js',
  'satellite.js'
)

var vectors
var distance = 2.0
var projection

var fns = {
  'setup': function (options) {
    vectors = options.vectors

    projection = satellite(
      options.distance,
      options.width,
      options.height
    )

    path = d3.geoPath().projection(projection)
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
