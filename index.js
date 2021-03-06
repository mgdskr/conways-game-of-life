//state dimensions
const stateWidth = 100
let cellWidth = 10
let canvasSize = stateWidth * cellWidth

const stateSize = stateWidth ** 2
const initialAliveNum = stateSize / 2
let timeDelay = 0

const initialDeadState = Array.from({length: stateSize}, _ => false)


const generateNeighborsTable = stateSize => {
  return Array.from({length: stateSize}, (_, id) => {
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

      return newX + (newY - 1) * stateWidth - 1
    }

    return neighborsCoordinates.map(neighborCoos => convertXYToId(neighborCoos))

  })
}

const neighborsTable = generateNeighborsTable(stateSize)
console.log(neighborsTable[0], neighborsTable.length)

//render helpers
const $onScreenCanvas = document.getElementById('canvas')
$onScreenCanvas.width = canvasSize
$onScreenCanvas.height = canvasSize
const onScreenCtx = $onScreenCanvas.getContext('2d')
onScreenCtx.fillStyle = '#0f0'

const $canvas = document.createElement('canvas')
$canvas.width = canvasSize
$canvas.height = canvasSize
const ctx = $canvas.getContext('2d')

//grid
const $canvasGrid = document.getElementById('canvas-grid')
$canvasGrid.width = canvasSize
$canvasGrid.height = canvasSize
canvasGridCtx = $canvasGrid.getContext('2d')

const drawGrid = (ctx) => {

  //cellWidth
  ctx.strokeStyle = '#222'
  let linesNum = stateWidth + 1
  let x, y
  ctx.beginPath()
  for (let i = 0; i < linesNum; i++) {
    //vertical lines
    y = i * cellWidth
    ctx.moveTo(0, y)
    ctx.lineTo(canvasSize, y)

    //horizontal lines
    x = i * cellWidth
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasSize)
  }
  ctx.stroke()
}


const updateCanvasSize = (canvasSize) => {
  // $onScreenCanvas.width = canvasSize
  // $onScreenCanvas.height = canvasSize
  // $canvas.width = canvasSize
  // $canvas.height = canvasSize
}


const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, canvasSize, canvasSize)
}

const renderCell = (id, ctx) => {
  id = id + 1
  const y = Math.ceil(id / stateWidth)
  const x = id - (y - 1) * stateWidth
  ctx.fillRect((x - 1) * cellWidth, (y - 1 ) * cellWidth, cellWidth, cellWidth)
}

//render counter
const $counter = document.getElementById('counter')

const renderCounter = counterValue => {
  $counter.innerHTML = "Day " + counterValue
}

const killAllCells = (state) => {
  state.forEach(cell => false)
}

const generateAliveCells = (state, aliveQty) => {
  const aliveIds = []
  while (aliveQty) {
    const aliveId = Math.floor(Math.random() * stateSize)
    if (!aliveIds.includes(aliveId)) {
      aliveIds.push(aliveId)
      aliveQty--
    }
  }
  const newState = [...state]
  aliveIds.forEach(aliveId => newState[aliveId] = true)
  console.log("initial state", state.length, state.filter(cell => cell).length)
  return newState
}


const updateStateOnce = state => {
  // clearCanvas(ctx)
  // clearCanvas(onScreenCtx)
  ctx.rect(0, 0, canvasSize, canvasSize)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.fillStyle = '#0f0'
  // drawGrid()


  const getAliveNeighborsNum = (neighborsIds) => {
    //this code boost performance from 35-40 to 42-45 FPS comparing to reduce func
    let neighborsNum = 0
    let i = 0
    for (; i < 8; i++) {
      const neighborId = neighborsIds[i]
      const neighbor = state[neighborId]
      neighborsNum += neighbor === true ? 1 : 0
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

  const newState = state.map((cell, idx) => {
    // console.log(idx)
    // const neighborsIds = neighborsTable[idx]
    //
    // if (!neighborsIds) {
    //   clearInterval(intervalId)
    //   console.log(cell, idx)
    // }
    const aliveNeighborsNum = getAliveNeighborsNum(neighborsTable[idx])

    if (aliveNeighborsNum === 3 && !cell) {
      cell = true
    } else if (aliveNeighborsNum < 2 && cell) {
      cell = false
    } else if (aliveNeighborsNum > 3 && cell) {
      cell = false
    }

    if (cell) {
      renderCell(idx, ctx)
    }

    return cell
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
  console.log(initialDeadState.filter(cell => cell).length)
  state = generateAliveCells(initialDeadState, initialAliveNum)
  allDead = false
  startTime = Date.now()
  counter = 1
  gameIsRunning = true
  drawGrid(canvasGridCtx)
  console.log("initialized...")
}

const runGame = () => {
  // renderState(state)
  state = updateStateOnce(state)
  allDead = !state.find(cell => cell)

  if (counter % 10 === 0) {
    const endTime = Date.now()
    const timeInSec = (endTime - startTime) / 1000
    startTime = Date.now()
    console.log('FPS = ', 10 / timeInSec)

    //10 cycles for x time 10_c/x_time = fps
  }
  renderCounter(++counter)
}

let intervalId

const handlerOnStartGame = () => {
  $btnStart.style.display = "none"
  $btnStop.style.display = "inline-block"
  $btnPause.style.display = "inline-block"
  $btnRestart.style.display = "inline-block"
  $btnKill.style.display = "inline-block"
  initializeGame()
  intervalId = setInterval(runGame, timeDelay)
  console.log('started...')
}

const handlerOnStopGame = () => {
  $btnStop.style.display = "none"
  $btnPause.style.display = "none"
  $btnRestart.style.display = "none"
  $btnStart.style.display = "inline-block"
  // gameIsRunning = false
  clearInterval(intervalId)
  // killAllCells(initialDeadState)
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
  // killAllCells(initialDeadState)
  initializeGame()
  $btnStart.style.display = 'none'
  $btnStop.style.display = 'inline-block'
  intervalId = setInterval(runGame, timeDelay)
}

const handlerOnKill = () => {
  console.log("killing")
  // killAllCells(state)
  state = [...initialDeadState]
  // clearCanvas(onScreenCtx)
  ctx.rect(0, 0, canvasSize, canvasSize)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.fillStyle = '#0f0'
  onScreenCtx.drawImage($canvas, 0, 0)
}


const handlerOnZoomIn = () => {
  cellWidth++
  canvasSize = stateWidth * cellWidth
  // clearCanvas(canvasGridCtx)
  drawGrid(canvasGridCtx)
  // updateCanvasSize(canvasSize)

}

const handlerOnZoomOut = () => {
  cellWidth--
  canvasSize = stateWidth * cellWidth
  // clearCanvas(canvasGridCtx)
  drawGrid(canvasGridCtx)
  // updateCanvasSize(canvasSize)
}

const handlerOnSpeedUp = () => {
  handlerOnPauseGame()
  timeDelay -= 10
  handlerOnPauseGame()
}

const handlerOnSpeedDown = () => {
  handlerOnPauseGame()
  timeDelay += 10
  handlerOnPauseGame()
}

//controls
const $btnStart = document.getElementById('btnStart')
const $btnStop = document.getElementById('btnStop')
const $btnPause = document.getElementById('btnPause')
const $btnRestart = document.getElementById('btnRestart')
const $btnKill = document.getElementById('btnKill')
const $btnZoomIn = document.getElementById('btnZoomIn')
const $btnZoomOut = document.getElementById('btnZoomOut')
const $btnSpeedUp = document.getElementById('btnSpeedUp')
const $btnSpeedDown = document.getElementById('btnSpeedDown')

$btnStart.addEventListener('click', handlerOnStartGame)
$btnStop.addEventListener('click', handlerOnStopGame)
$btnPause.addEventListener('click', handlerOnPauseGame)
$btnRestart.addEventListener('click', handlerOnRestartGame)
$btnKill.addEventListener('click', handlerOnKill)
$btnZoomIn.addEventListener('click', handlerOnZoomIn)
$btnZoomOut.addEventListener('click', handlerOnZoomOut)
$btnSpeedUp.addEventListener('click', handlerOnSpeedUp)
$btnSpeedDown.addEventListener('click', handlerOnSpeedDown)


const handlerOnToggleCell = (e) => {
  const $onScreenCanvasRect = $onScreenCanvas.getBoundingClientRect()
  const left = $onScreenCanvasRect.left
  const top = $onScreenCanvasRect.top
  const right = $onScreenCanvasRect.right
  const bottom = $onScreenCanvasRect.bottom
  const clientX = e.clientX
  const clientY = e.clientY

  if (clientX < left || clientX > right || clientY < top || clientY > bottom) {
    console.log(clientX, left, right, clientY, top, bottom)
    return
  }
  // console.log("clicked", left, top, right, bottom, clientY, clientX)
  const x = clientX - left
  const y = clientY - top
  const newX = Math.ceil(x / cellWidth)
  const newY = Math.ceil(y / cellWidth)
  const cellId = newX + (newY - 1) * stateWidth - 1 //TODO fix this
  console.log(newX, newY, cellId)
  console.log(state[cellId])
  state[cellId] = !state[cellId]
  console.log(state[cellId])
  if (state[cellId]) {
    onScreenCtx.fillRect((newX - 1) * cellWidth, (newY - 1) * cellWidth, cellWidth, cellWidth)
    // renderCell(clickedCell, onScreenCtx)
  }
  else if (!state[cellId]) {
    onScreenCtx.fillStyle = '#000'
    onScreenCtx.fillRect((newX - 1) * cellWidth, (newY - 1) * cellWidth, cellWidth, cellWidth)
    onScreenCtx.fillStyle = '#0f0'
  }

}

document.addEventListener('click', handlerOnToggleCell)