// TODO: Modules
// import {Colors} from './utils.js'

const canvas = document.getElementById('canvas');

canvas.style.backgroundColor = 'black';

const Colors = {
  BLUE: 'dodgerblue',
  RED: 'tomato',
  GREEN: 'lime',
  ORANGE: 'orange',
  YELLOW: 'goldenrod',
  BROWN: 'brown',
}

const WIDTH = 20;
const HEIGHT = 30;
const PIXEL = 20;
const DEFAULT_SPEED = 1;

// TODO: Increase as you level up
let movesPerSecond = DEFAULT_SPEED;

const ctx = canvas.getContext('2d');

let floor = createFloor();
let piece = createPiece(ctx, floor);

function createFloor() {
  return Array(HEIGHT).fill([])
    .map((_, row) => Array(WIDTH).fill(null)
      .map((_, col) => {
        const color = row === HEIGHT - 1 ? Colors.BROWN : null;
        return createTile(ctx, color, row, col)
      }))
}

const bg = {
  render: () => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, WIDTH * PIXEL, HEIGHT * PIXEL)
  }
}

const startLoop = () => {
  let id = null;
  let prev = 0;
  function loop() {
    id = requestAnimationFrame((elapsed) => {
      if (elapsed - prev > 1000 / movesPerSecond) {
        updateWorld(piece)
        prev = elapsed
      }
      drawWorld(piece, floor, bg)
      loop()
    });
  }
  loop()
  const getId = () => id;
  return getId
}


function updateWorld(piece) {
  piece.update()
  // Update lines if piece clears a row
  // TODO: End game if piece touches the top of the screen
}

function drawWorld(piece, floor, bg) {
  bg.render();
  piece.render();
  floor.forEach((row) => {
    row.forEach((tile) => {
      tile.render();
    })
  });
}

function getShape() {
  const shapes = {
    L: [[1, 0], [1, 0], [1, 1]], 
    J: [[0, 1], [0, 1], [1, 1]], 
    T: [[1, 0], [1, 1], [1, 0]], 
    S: [[1, 0], [1, 1], [0, 1]], 
    Z: [[0, 1], [1, 1], [1, 0]], 
    I: [[1], [1], [1], [1]], 
    O: [[1, 1],[1, 1]],
  }

  const shapeValues = Object.values(shapes);
  return shapeValues[Math.floor(Math.random() * shapeValues.length)]
}

function getRandomColor() {
  const colorValues = Object.values(Colors);
  return colorValues[Math.floor(Math.random() * colorValues.length)]
}

function registerKeys(fns) {
  const down = (e) => {
    switch (e.key) {
      case 'ArrowRight': 
        fns.moveRight()
        break;
      case 'ArrowLeft': 
        fns.moveLeft()
        break;
      case 'ArrowDown': 
        fns.drop()
        break;
      case ' ':
        fns.rotate()
        break;
    }
  }

  const up = (e) => {
    switch (e.key) {
      case 'ArrowDown': 
        fns.stopDrop()
        break;
    }
  }

  document.addEventListener('keydown', down)
  document.addEventListener('keyup', up)

  return () => {
    document.removeEventListener('keydown', down);
    document.removeEventListener('keyup', up);
  }
}

// function rotateShape(shape) {
//   const newShape = Array(shape[0].length).fill(0).map(() => Array(shape.length).fill(0))

//   shape.forEach((row, rowIdx) => {
//     row.forEach((box, boxIdx) => {
//       console.log('box', box);
//       newShape[boxIdx][rowIdx] = box
//     })
//   })

//   return newShape;
// }

function createTile(ctx, color, row, col) {
  const isEmpty = !color;
  const fillColor = color || 'rgba(255, 255, 255, 0)';

  const render = () => {
    ctx.fillStyle = fillColor;
    ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL)
  }

  return { render, isEmpty } 
}

function createPiece(ctx, floor) {
  let pos = { x: WIDTH / 2, y: 0 }
  let shape = getShape();
  let color = getRandomColor();

  function reset() {
    pos = { x: WIDTH / 2, y: 0 }
    shape = getShape();
    color = getRandomColor();
  }

  const moveRight = () => {
    // TODO: enable moving under ledges
    // Check wall
    if (pos.x + 1 >= WIDTH) return;
    // Check floor
    if (!floor[pos.y][pos.x + 1].isEmpty) return;

    pos.x += 1;
  }

  const moveLeft = () => {
    // TODO: enable moving under ledges
    // Check wall
    if (pos.x - 1 < 0) return;
    // Check floor
    if (!floor[pos.y][pos.x - 1].isEmpty) return;

    pos.x -= 1;
  }

  const drop = () => movesPerSecond = 60;
  const stopDrop = () => movesPerSecond = DEFAULT_SPEED;
  // TODO: Not working yet
  // const rotate = () => {
  //   console.log('shape before', shape);
  //   shape = rotateShape(shape);
  //   console.log('shape after', shape);
  // }

  const cleanup = registerKeys({moveRight, moveLeft, drop, stopDrop, rotate});

  const render = () => {
    ctx.fillStyle = color;
    // Single block for debugging: ctx.fillRect(pos.x * PIXEL, pos.y * PIXEL, PIXEL, PIXEL)
    shape.forEach((row, rowIdx) => {
      row.forEach((box, boxIdx) => {
        if (!!box) {
          const boxOriginX = pos.x + boxIdx;
          const boxOriginY = pos.y + rowIdx;
          ctx.fillRect(boxOriginX * PIXEL, boxOriginY * PIXEL, PIXEL, PIXEL)
        }
      })
    });
  }

  const update = () => {
    // Single box for debugging
    // if (!!box) {
    //   ctx.fillRect(pos.x * PIXEL, pos.y * PIXEL, PIXEL, PIXEL)
    // }
    // Can be optimized by just looking at last row
    let hitFloor = false;
    shape.forEach((row, rowIdx) => {
      row.forEach((box, boxIdx) => {
        const boxOriginX = pos.x + boxIdx;
        const boxOriginY = pos.y + rowIdx;

        if (box && !floor[boxOriginY + 1]?.[boxOriginX].isEmpty) {
          shape.forEach((row, rowIdx) => {
            row.forEach((box, boxIdx) => {
              const boxOriginX = pos.x + boxIdx;
              const boxOriginY = pos.y + rowIdx;

              if (box) {
                floor[boxOriginY][boxOriginX] = createTile(ctx, color, boxOriginY, boxOriginX)
                hitFloor = true;
              }
            })
          })
        }
      })
    });

    if (hitFloor) {
      reset()
    } else  {
      pos.y += 1;
    }
  }

  return { pos, render, update, cleanup, reset }
}

const playPauseButton = document.getElementById('playPause');
const resetButton = document.getElementById('reset');

let getId = startLoop();
playPauseButton.onclick = () => {
  if (!getId) {
    getId = startLoop();
  } else {
    const id = getId();
    cancelAnimationFrame(id)
    getId = null;
  }
}
resetButton.onclick = () => {
  bg.render();
  piece.reset();
  piece.render();
}
