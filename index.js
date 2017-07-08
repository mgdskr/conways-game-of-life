//state dimensions
const stateWidth = 100
let cellWidth = 10
let canvasSize = stateWidth * cellWidth

const stateSize = stateWidth ** 2
const initialAliveNum = stateSize / 2
let timeDelay = 100
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
// canvasGridCtx.fillStyle = '#0f0'

const drawGrid = (ctx) => {

  //cellWidth
  ctx.strokeStyle = '#222'
  let linesNum = stateWidth + 1
  let i = 0
  let x, y
  ctx.beginPath()
  for (; i < linesNum; i++) {
    //vertical lines
    y = i * cellWidth
    ctx.moveTo(0, y)
    ctx.lineTo(canvasSize, y)
    // ctx.stroke()

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

const renderCell = ({id}, ctx) => {
  const y = Math.ceil(id / stateWidth)
  const x = id - (y - 1) * stateWidth
  ctx.fillRect((x - 1) * cellWidth, (y - 1) * cellWidth, cellWidth, cellWidth)
}
//
// const renderState = state => {
//   clearCanvas(ctx)
//   clearCanvas(onScreenCtx)
//
//   state.forEach(cell => {
//     if (cell.alive) {
//       renderCell(cell, ctx)
//     }
//   })
//
//   onScreenCtx.drawImage($canvas, 0, 0)
// }

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
  drawGrid(canvasGridCtx)
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

  // if (!gameIsRunning) {
  //   console.log('gameIsRunning', gameIsRunning)
  //   clearInterval(intervalId)
  // }

  // if (allDead) {
  //   console.log('allDead', allDead)
  //   clearInterval(intervalId)
  //   clearCanvas(onScreenCtx)
  // }
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

const handlerOnKill = () => {
  console.log("killing")
  killAllCells(state)
}

const handlerOnZoomIn = () => {
  cellWidth++
  canvasSize = stateWidth * cellWidth
  // updateCanvasSize(canvasSize)

}

const handlerOnZoomOut = () => {
  cellWidth--
  canvasSize = stateWidth * cellWidth
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
  const cellId = newX + (newY - 1) * stateWidth
  console.log(newX, newY, cellId)
  let clickedCell = state.find(cell => cell.id === cellId)
  console.log(clickedCell)
  clickedCell.alive = !clickedCell.alive
  if (clickedCell.alive) {
    onScreenCtx.fillRect((newX - 1) * cellWidth, (newY - 1) * cellWidth, cellWidth, cellWidth)
    // renderCell(clickedCell, onScreenCtx)
  }
  else if (!clickedCell.alive) {
    onScreenCtx.fillStyle = '#000'
    onScreenCtx.fillRect((newX - 1) * cellWidth, (newY - 1) * cellWidth, cellWidth, cellWidth)
    onScreenCtx.fillStyle = '#0f0'
  }
  console.log(clickedCell.alive)

}

document.addEventListener('click', handlerOnToggleCell)


