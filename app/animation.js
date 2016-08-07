export class Animation {
  constructor () {
    this.start
    this.frames = 0
    this.mainThread = 0
  }

  tick (afterInitial, always) {
    var time = window.performance.now()
    if (!this.start) {
      this.start = this.last = time
    }
    else {
      afterInitial(time - this.last)
      this.last = time
    }

    always(time - this.start)

    if (this.start !== this.last) {
      this.mainThread += (window.performance.now() - time)
    }
  }
}
