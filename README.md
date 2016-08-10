# WebWorker Geo Projection Test

[![Test](/demo.png?raw=true =100x)](http://k9.github.com/web-worker-projection/)
[Test](http://k9.github.io/web-worker-projection) of D3 projection in a WebWorker.

While working on a [WebGL Globe Viewer](http://k9.github.io/globe-viewer)
I wanted to add interactivity
and an easy API for adding vector data on top of the globe.
One interesting option is a D3-based SVG overlay, which
[works well](http://k9.github.io/globe-viewer-svg-simple)
at lower detail levels, but runs into an issue with more detailed vectors:
WebGL and D3 both require significant time on the main browser thread,
so [frame rate declines](http://k9.github.io/globe-viewer-svg-test).

So this is an experiment in moving D3 projection math into a WebWorker,
with the goal of reducing processing on the main thread. Results are mixed:

Positives:
* A lot of processing is successfully moved off the main thread
* FPS on phones is significantly better

Negatives:
* FPS does not increase in most cases
* Firefox doesn't perform well due to https://bugzilla.mozilla.org/show_bug.cgi?id=1240984
* Overall the code becomes more complex
