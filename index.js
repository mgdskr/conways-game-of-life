//state dimensions
const stateWidth = 100
const canvasSize = stateWidth * 5
const stateSize = stateWidth ** 2
const initialAliveNum = 10000 //stateSize / 2
const timeDelay = 500
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

const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height)
}

const renderCell = ({id}, ctx) => {
  const y = Math.ceil(id / stateWidth)
  const x = id - (y - 1) * stateWidth
  ctx.fillRect((x - 1) * cellWidth, (y - 1) * cellWidth, cellWidth, cellWidth)
}

const renderState = state => {
  clearCanvas(ctx)
  clearCanvas(onScreenCtx)

  state.forEach(cell => {
    if (cell.alive) {
      renderCell(cell, ctx)
    }
  })

  onScreenCtx.drawImage($canvas, 0, 0)
}

//render counter
const $counter = document.getElementById('counter')

const renderCounter = counterValue => {
  $counter.innerHTML = "Day " + counterValue
}

const killAllCells = (state) => {
  state.forEach(cell => cell.alive = false)
}

const generateAliveCells = (state, aliveQty) => {
  const aliveIds = []
  while (aliveQty) {
    const aliveId = Math.floor(Math.random() * stateSize + 1)
    if (!aliveIds.includes(aliveId)) {
      aliveIds.push(aliveId)
      aliveQty--
    }
  }
  aliveIds.forEach(aliveId => {
    state.find(cell => cell.id === aliveId).alive = true
  })
  console.log("initial state", state.filter(cell => cell.alive).length)
  return state
}


const updateStateOnce = state => {
    clearCanvas(ctx)
    clearCanvas(onScreenCtx)


  const getAliveNeighborsNum = (neighborsIds) => {
    //this code boost performance from 35-40 to 42-45 FPS comparing to reduce func
    let neighborsNum = 0
    let i = 0
    for (; i < 8; i++) {
      const neighborId = neighborsIds[i]
      const neighbor = state[neighborId - 1]
      neighborsNum += neighbor.alive === true ? 1 : 0
    }

    return neighborsNum

    //
    // return neighborsIds
    //   .reduce((acc, currNeighborId) => {
    //     // const neighbor = state.find(cell => cell.id === currNeighborId)
    //     const neighbor = state[currNeighborId - 1]
    //     const alive = neighbor.alive === true ? 1 : 0
    //     return acc + alive
    //   }, 0)
  }

  const newState = state.map(cell => {
    const aliveNeighborsNum = getAliveNeighborsNum(cell.neighborsIds)
    let alive = cell.alive

    if (aliveNeighborsNum === 3 && !alive) {
      alive = true
    } else if (aliveNeighborsNum < 2 && alive) {
      alive = false
    } else if (aliveNeighborsNum > 3 && alive) {
      alive = false
    }

    if (alive) {
      renderCell(cell, ctx)
    }

    return Object.assign({}, cell, {alive})
  })

  onScreenCtx.drawImage($canvas, 0, 0)

  return newState
}

let state
let allDead
let startTime
let counter
let gameIsRunning

const initializeGame = () => {
  console.log(initialDeadState.filter(cell => cell.alive).length)
  state = generateAliveCells(initialDeadState, initialAliveNum)
  allDead = false
  startTime = Date.now()
  counter = 1
  gameIsRunning = true
  console.log("initialized...")
}

const runGame = () => {
  // renderState(state)
  state = updateStateOnce(state)
  allDead = !state.find(cell => cell.alive)

  if (counter % 10 === 0) {
    const endTime = Date.now()
    const timeInSec = (endTime - startTime) / 1000
    startTime = Date.now()
    console.log('FPS = ', 10 / timeInSec)

    //10 cycles for x time 10_c/x_time = fps
  }
  renderCounter(++counter)

  if (!gameIsRunning) {
    console.log('gameIsRunning', gameIsRunning)
    clearInterval(intervalId)
  }

  if (allDead) {
    console.log('allDead', allDead)
    clearInterval(intervalId)
    clearCanvas(onScreenCtx)
  }
}

let intervalId

const handlerOnStartGame = () => {
  $btnStart.style.display = "none"
  $btnStop.style.display = "inline-block"
  $btnPause.style.display = "inline-block"
  $btnRestart.style.display = "inline-block"
  initializeGame()
  intervalId = setInterval(runGame, intervalId)
  console.log('started...')
}
const handlerOnStopGame = () => {
  $btnStop.style.display = "none"
  $btnPause.style.display = "none"
  $btnRestart.style.display = "none"
  $btnStart.style.display = "inline-block"
  // gameIsRunning = false
  clearInterval(intervalId)
  killAllCells(initialDeadState)
  console.log('stopped...')
}
const handlerOnPauseGame = () => {
  if (intervalId) {
    // gameIsRunning = false
    $btnPause.innerHTML = 'Unpause'
    clearInterval(intervalId)
    intervalId = null
    console.log("paused...")
  } else if (!intervalId) {
    $btnPause.innerHTML = 'Pause'
    intervalId = setInterval(runGame, timeDelay)
    console.log("unpaused...")
  }
}

const handlerOnRestartGame = () => {
  // gameIsRunning = false
  clearInterval(intervalId)
  killAllCells(initialDeadState)
  initializeGame()
  $btnStart.style.display = 'none'
  $btnStop.style.display = 'inline-block'
  intervalId = setInterval(runGame, timeDelay)
}

//controls
const $btnStart = document.getElementById('btnStart')
const $btnStop = document.getElementById('btnStop')
const $btnPause = document.getElementById('btnPause')
const $btnRestart = document.getElementById('btnRestart')

$btnStart.addEventListener('click', handlerOnStartGame)
$btnStop.addEventListener('click', handlerOnStopGame)
$btnPause.addEventListener('click', handlerOnPauseGame)
$btnRestart.addEventListener('click', handlerOnRestartGame)
