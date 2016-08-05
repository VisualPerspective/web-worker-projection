# WebWorker SVG Projection Test

[Benchmark](http://k9.github.io/web-worker-projection) of D3 projection in a WebWorker.

While working on a [WebGL Globe Viewer](http://k9.github.io/globe-viewer)
I wanted to add interactivity
and an easy API for adding vector data on top of the globe.
One interesting option is a D3-based SVG overlay, which
[works well](http://k9.github.com/globe-viewer-svg-simple)
at lower detail levels, but runs into an issue with more detailed vectors:
WebGL and D3 both require significant time on the main browser thread,
so frame rate declines.

So this is an experiment in moving D3 projection math into a WebWorker,
with the goal of reducing processing on the main thread. Overall it's a
success: it doesn't increase frame rate, but does leave a lot of room for
other processing on the main thread. I'm still not sure if I'll integrate
this approach, or go with another method, but it's promising.

**Note:** actually spinning the globe as in the benchmark could be handled
using [interpolation](https://bl.ocks.org/mbostock/4183330) and transitions, which would give better performance.
But I want the globe to track the user's cursor without latency, and syncing WebGL
state with D3 transitions seems difficult, which is why I'm testing a brute-force
approach.
