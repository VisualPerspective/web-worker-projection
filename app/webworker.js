import { geoPath } from 'd3'
import { satellite } from 'satellite.js'
import { PathWriter } from 'canvasProxy.js'

let vectors, path, projection, useSVG
let commands = [], args = []

let fns = {
  'setup': function (options) {
    vectors = options.vectors
    useSVG = options.useSVG

    projection = satellite(
      options.distance,
      options.width,
      options.height
    )

    path = geoPath().projection(projection)
  },

  'projectPaths': function (options) {
    projection.rotate(options.rotate)

    if (useSVG) {
      var results = []
      for (let vector of vectors) {
        results.push(path(vector))
      }

      postMessage(['pathsProjected', { paths: results }])
    }
    else {
      let proxy = new PathWriter(
        options.commandArray,
        options.argumentArray
      )

      path.context(proxy)

      for (let vector of vectors) {
        path(vector)
        proxy.markEndOfPath()
      }

      postMessage(['pathsProjected', {
          commandArray: proxy.commandArray,
          argumentArray: proxy.argumentArray,
          endOfPaths: proxy.endOfPaths
        }],
        [options.commandArray.buffer, options.argumentArray.buffer]
      )
    }

  }
}

onmessage = function (e) {
  var fnName = e.data[0]
  var options = e.data[1]
  fns[fnName](options)
}
