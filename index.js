//state dimensions
const stateWidth = 100
const canvasSize = stateWidth * 5
const stateSize = stateWidth ** 2
const initialAliveNum = stateSize / 2
const initialDeadState = Array.from({length: stateSize}, (_, id) => {
    const cellId = id + 1

    const y = Math.ceil(cellId / stateWidth)
    const x = cellId - (y - 1) * stateWidth

    const north = {x, y: y - 1}
    const south = {x, y: y + 1}
    const east = {x: x + 1, y}
    const west = {x: x - 1, y}
    const northEast = {x: x + 1, y: y - 1}
    const northWest = {x: x - 1, y: y - 1}
    const southEast = {x: x + 1, y: y + 1}
    const southWest = {x: x - 1, y: y + 1}

    const neighborsCoordinates = [north, south, east, west, northEast, northWest, southEast, southWest]

    const convertXYToId = ({x, y}) => {
      const checkCoordinates = coo => {
        if (coo === 0) {
          coo = stateWidth
        } else if (coo === stateWidth + 1) {
          coo = 1
        }

        return coo
      }

      const [newX, newY] = [x, y].map(coo => checkCoordinates(coo))

      return newX + (newY - 1) * stateWidth
    }

    const neighborsIds = neighborsCoordinates.map(neighborCoos => convertXYToId(neighborCoos))

    return {id: cellId, alive: false, neighborsIds}
  }
)

//render helpers
const $onScreenCanvas = document.getElementById('canvas')
$onScreenCanvas.width = canvasSize
$onScreenCanvas.height = canvasSize
const onScreenCtx = $onScreenCanvas.getContext('2d')

const $canvas = document.createElement('canvas')
$canvas.width = canvasSize
$canvas.height = canvasSize
const ctx = $canvas.getContext('2d')
const cellWidth = $canvas.width / stateWidth

const renderCell = ({id, alive}) => {
  if (alive) {
    const y = Math.ceil(id / stateWidth)
    const x = id - (y - 1) * stateWidth
    ctx.fillRect((x - 1) * cellWidth, (y - 1) * cellWidth, cellWidth, cellWidth)
  }
}

const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height)
}

const renderState = state => {
  clearCanvas(ctx)
  clearCanvas(onScreenCtx)

  state.forEach(cell => renderCell(cell))

  onScreenCtx.drawImage($canvas, 0, 0)
}

//render counter
const $counter = document.getElementById('counter')

const renderCounter = counterValue => {
  $counter.innerHTML = counterValue
}


const generateAliveCells = (state, aliveQty) => {
  const newState = [...state]
  const aliveIds = []
  while (aliveQty) {
    const aliveId = Math.floor(Math.random() * stateSize + 1)
    if (!aliveIds.includes(aliveId)) {
      aliveIds.push(aliveId)
      aliveQty--
    }
  }
  aliveIds.forEach(aliveId => {
    newState.find(cell => cell.id === aliveId).alive = true
  })

  return newState
}


const updateStateOnce = state => {
  const getAliveNeighborsNum = (neighborsIds) => {
    // let neighborsNum = 0
    // let i = 0
    // for (; i < 8; i++) {
    //   const neighborId = neighborsIds[i]
    //   const neighbor = state[neighborId - 1]
    //   neighborsNum += neighbor.alive === true ? 1 : 0
    // }
    //
    // return neighborsNum

    return neighborsIds
      .reduce((acc, currNeighborId) => {
        // const neighbor = state.find(cell => cell.id === currNeighborId)
        const neighbor = state[currNeighborId - 1]
        const alive = neighbor.alive === true ? 1 : 0
        return acc + alive
      }, 0)
  }

  return state.map(cell => {
    const aliveNeighborsNum = getAliveNeighborsNum(cell.neighborsIds)
    let alive = cell.alive

    if (aliveNeighborsNum === 3 && !alive) {
      alive = true
    } else if (aliveNeighborsNum < 2 && alive) {
      alive = false
    } else if (aliveNeighborsNum > 3 && alive) {
      alive = false
    }

    return Object.assign({}, cell, {alive})
  })
}

let state = generateAliveCells(initialDeadState, initialAliveNum)
let allDead = false
let counter = 1
const runGame = () => {
  renderState(state)
  // console.log("updated..")
  state = updateStateOnce(state)
  allDead = !state.find(cell => cell.alive)
  renderCounter(++counter)

  if (allDead) {
    console.log('allDead', allDead)
    clearInterval(intervalId)
    clearCanvas(onScreenCtx)
  }
}

const intervalId = setInterval(runGame, 0)
