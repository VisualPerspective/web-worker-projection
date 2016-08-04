function benchmark (
  useWorker,
  detail
) {
  var worker = new Worker('js/worker.js')

  d3.selectAll('svg').remove()
  var svg = d3.select('.right').append('svg')

  var width = svg.node().getBoundingClientRect().width
  var height = width

  svg.style('height', height + 'px')
    .attr('width', width)
    .attr('height', height)

  var latitude = 0, longitude = 0
  var workerProjecting = false
  var distance = 2.0
  var projection = satellite(distance, width, height)

  var path = d3.geoPath()
      .projection(projection);

  d3.json("data/vectors-" + detail + ".json", function(error, vectors) {
    if (error) throw error;

    var countries = topojson.feature(vectors, vectors.objects.countries)
    var rivers = topojson.feature(vectors, vectors.objects.rivers)
    var lakes = topojson.feature(vectors, vectors.objects.lakes)

    var projectedPaths = [[], []]

    worker.postMessage(['setup', {
      vectors: [countries, rivers, lakes],
      distance: distance,
      width: width,
      height: height
    }])

    var countryPath = svg.append("path")
        .datum(countries)
        .attr("d", path)
        .attr("class", "country");

    var riverPath = svg.append("path")
        .datum(rivers)
        .attr("d", path)
        .attr("class", "river");

    var lakePath = svg.append("path")
        .datum(lakes)
        .attr("d", path)
        .attr("class", "lake");

    var startTime = window.performance.now(),
        lastTime = window.performance.now(),
        frames = 0

    function render (time) {
      var frameTime = time - lastTime
      lastTime = time
      longitude -= frameTime / 20

      if ((time - startTime) > 5000) {
        console.log(frames)
        return
      }

      if (useWorker) {
        if (!workerProjecting) {
          frames++;
          workerProjecting = true

          worker.postMessage(['projectPaths', {
            'rotate': [longitude, latitude, 0]
          }])

          countryPath.attr('d', projectedPaths[0])
          riverPath.attr('d', projectedPaths[1])
          lakePath.attr('d', projectedPaths[2])
          window.requestAnimationFrame(render)
        }
        else {
          setTimeout(function () { render(window.performance.now()) }, 1)
        }
      }
      else {
        frames++;
        projection.rotate([longitude, latitude, 0])
        riverPath.attr('d', path)
        countryPath.attr('d', path)
        lakePath.attr('d', path)
        window.requestAnimationFrame(render)
      }

    }

    var fns = {
      'pathsProjected': function (options) {
        workerProjecting = false
        projectedPaths = options.paths
      }
    }

    worker.onmessage = function (e) {
      var fnName = e.data[0]
      var options = e.data[1]
      fns[fnName](options)
    }

    render(window.performance.now())
  });
}
