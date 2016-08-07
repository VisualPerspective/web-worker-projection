import { PathReader } from 'canvasProxy.js'

export function createWorker (world) {
  var fns = {
    'pathsProjected': (options) => {
      world.workerProjecting = false

      if (world.useSVG) {
        world.projectedPaths = options.paths
      }
      else {
        world.pathReader = new PathReader(
          options.commandArray,
          options.argumentArray,
          options.endOfPaths
        )
      }
    }
  }

  let worker = new Worker('webworker.js')

  worker.onmessage = (e) => {
    var fnName = e.data[0]
    var options = e.data[1]
    fns[fnName](options)
  }

  worker.postMessage(['setup', {
    vectors: [
      world.features['countries'],
      world.features['rivers'],
      world.features['lakes']
    ],
    distance: world.view.distance,
    width: world.width,
    height: world.height,
    useSVG: world.useSVG
  }])

  return worker
}
