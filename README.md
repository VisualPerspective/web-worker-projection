# WebWorker Geo Projection Test

[![Benchmark](/demo.png?raw=true =100x)](http://k9.github.com/web-worker-projection/)
[Benchmark](http://k9.github.io/web-worker-projection) of D3 projection in a WebWorker.

While working on a [WebGL Globe Viewer](http://k9.github.io/globe-viewer)
I wanted to add interactivity
and an easy API for adding vector data on top of the globe.
One interesting option is a D3-based SVG overlay, which
[works well](http://k9.github.io/globe-viewer-svg-simple)
at lower detail levels, but runs into an issue with more detailed vectors:
WebGL and D3 both require significant time on the main browser thread,
so [frame rate declines](http://k9.github.io/globe-viewer-svg-test).

So this is an experiment in moving D3 projection math into a WebWorker,
with the goal of reducing processing on the main thread. Overall it's a
success: while it doesn't increase frame rate, it does leave a lot of room for
other processing on the main thread. I'm still not sure if I'll integrate
this approach, or go with another method, but it's promising.

