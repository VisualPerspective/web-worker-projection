import { createWorker } from 'workerClient.js'

export function renderPaths (world) {
  if (!world.workerProjecting) {
    world.animation.frames++
    world.workerProjecting = true

    world.worker.postMessage(['projectPaths', {
      'rotate': [world.view.longitude, world.view.latitude, 0]
    }])

    if (world.projectedPaths) {
      world.featureNames.forEach((name, i) => {
        world.paths[name].attr('d', world.projectedPaths[i])
      })
    }

    window.requestAnimationFrame(() => { world.render() })
  }
  else {
    setTimeout(() => { world.render() }, 1)
  }
}
