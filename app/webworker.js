import _ from 'lodash'
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
      for (let i = 0; i < vectors.length; i++) {
        results.push(path(vectors[i]))
      }

      postMessage(['pathsProjected', { paths: results }])
    }
    else {
      let proxy = new PathWriter(
        options.commandBuffer,
        options.argumentBuffer
      )

      path.context(proxy)

      let results = _.map(vectors, (vector) => {
        path(vector.data)
        proxy.markEndOfPath()
        return vector.name
      })

      postMessage(['pathsProjected', {
          commandBuffer: proxy.commandArray.buffer,
          argumentBuffer: proxy.argumentArray.buffer,
          endOfPaths: proxy.endOfPaths,
          paths: results
        }],
        [proxy.commandArray.buffer, proxy.argumentArray.buffer]
      )
    }

  }
}

onmessage = function (e) {
  var fnName = e.data[0]
  var options = e.data[1]
  fns[fnName](options)
}
