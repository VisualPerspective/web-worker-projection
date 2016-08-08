export const MOVE_TO = 0
export const LINE_TO = 1
export const ARC = 2
export const CLOSE_PATH = 3

// This can't be very large in Firefox due to:
// https://bugzilla.mozilla.org/show_bug.cgi?id=1240984
const BUFFER_SIZE = 100000
const MAX_ARGUMENTS = 5

export class PathWriter {
  constructor(commandBuffer, argumentBuffer) {
    this.commandArray = new Uint8Array(commandBuffer || BUFFER_SIZE)
    this.argumentArray = new Float64Array(argumentBuffer || (BUFFER_SIZE * MAX_ARGUMENTS))
    this.commandIndex = 0
    this.argumentIndex = 0
    this.endOfPaths = []
  }

  moveTo(x, y) {
    this.commandArray[this.commandIndex++] = MOVE_TO
    this.argumentArray[this.argumentIndex++] = x
    this.argumentArray[this.argumentIndex++] = y
  }

  lineTo(x, y) {
    this.commandArray[this.commandIndex++] = LINE_TO
    this.argumentArray[this.argumentIndex++] = x
    this.argumentArray[this.argumentIndex++] = y
  }

  arc(a, b, c, d, e) {
    this.commandArray[this.commandIndex++] = ARC
    this.argumentArray[this.argumentIndex++] = a
    this.argumentArray[this.argumentIndex++] = b
    this.argumentArray[this.argumentIndex++] = c
    this.argumentArray[this.argumentIndex++] = d
    this.argumentArray[this.argumentIndex++] = e
  }

  closePath() {
    this.commandArray[this.commandIndex++] = CLOSE_PATH
  }

  markEndOfPath() {
    this.endOfPaths.push(this.commandIndex - 1)
  }
}

export class PathReader {
  constructor(commandBuffer, argumentBuffer, endOfPaths) {
    this.commandArray = new Uint8Array(commandBuffer || BUFFER_SIZE)
    this.argumentArray = new Float64Array(argumentBuffer || BUFFER_SIZE)
    this.endOfPaths = endOfPaths || []
    this.commandIndex = 0
    this.argumentIndex = 0
  }

  renderPath(ctx) {
    let endOfPath = this.endOfPaths.shift()
    while (this.commandIndex <= endOfPath) {
      let command = this.commandArray[this.commandIndex++]
      switch (command) {
        case MOVE_TO:
          ctx.moveTo(
            this.argumentArray[this.argumentIndex++],
            this.argumentArray[this.argumentIndex++]
          )
          break;

        case LINE_TO:
          ctx.lineTo(
            this.argumentArray[this.argumentIndex++],
            this.argumentArray[this.argumentIndex++]
          )
          break;

        case ARC:
          ctx.arc(
            this.argumentArray[this.argumentIndex++],
            this.argumentArray[this.argumentIndex++],
            this.argumentArray[this.argumentIndex++],
            this.argumentArray[this.argumentIndex++],
            this.argumentArray[this.argumentIndex++]
          )

          break;

        case CLOSE_PATH:
          ctx.closePath()
          break;
      }
    }
  }
}
