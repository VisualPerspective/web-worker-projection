# WebWorker Geo Projection Test

[![Test](/demo.png?raw=true)](http://visualperspective.github.com/web-worker-projection/)
[Test](http://visualperspective.github.io/web-worker-projection) of D3 projection in a WebWorker.

While working on a [WebGL Globe Viewer](http://visualperspective.github.io/globe-viewer)
I wanted to add interactivity
and an easy API for adding vector data on top of the globe.
One interesting option is a D3-based SVG overlay, which
[works well](http://visualperspective.github.io/globe-viewer-svg-simple)
at lower detail levels, but runs into an issue with more detailed vectors:
WebGL and D3 both require significant time on the main browser thread,
so [frame rate declines](http://visualperspective.github.io/globe-viewer-svg-test).

So this is an experiment in moving D3 projection math into a WebWorker,
with the goal of reducing processing on the main thread. It's implemented
so that you can compare detail levels, SVG vs Canvas,
and number of WebWorkers.

For SVG, the WebWorkers compute "path" strings and pass them back to the main thread:
https://github.com/VisualPerspective/web-worker-projection/blob/master/app/webworker.js

For Canvas, a simple proxy is used to record operations in the
WebWorker, so they can be played back on the main thread:
https://github.com/VisualPerspective/web-worker-projection/blob/master/app/canvasProxy.js
(based on a method from https://blog.mozilla.org/research/2014/07/22/webgl-in-web-workers-today-and-faster-than-expected/)

In my testing, results are mixed:

Positives:
* A lot of processing is successfully moved off the main thread
* FPS on phones is significantly better

Negatives:
* Overall the code becomes more complex

To install, you'll need yarn and a recent version of Node. Run:
```
yarn
yarn make-vectors
yarn start
```

The benchmark should now be available at `http://localhost:3333`
