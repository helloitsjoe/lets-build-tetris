// TODO: Modules
// import {Colors} from './utils.js'

const canvas = document.getElementById('canvas');

canvas.style.backgroundColor = 'black';

const Colors = {
  BLACK: 'black',
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

// TODO: Increase as you level up
let movesPerSecond = 1;

const ctx = canvas.getContext('2d');

let piece = createPiece(ctx);
let floor = createFloor();
console.log(floor);

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
      if (elapsed - prev > 1000) {
        updateWorld(piece, floor)
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


function updateWorld(piece, floor) {
  // Update falling piece
  piece.update(floor)
  // If piece touches floor:
  //   add it to floor 
  //   get next shape from box
  //   add random shape to box
  // Update lines if piece clears a row
  // End game if piece touches the top of the screen
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

  return shapes.O
}

// randomize shapes

// keyboard commands
// turn left
// turn right
// pop down
function registerKeydown(fns) {
  const cb = (e) => {
    switch (e.key) {
      case 'ArrowRight': 
        fns.moveRight()
        break;
      case 'ArrowLeft': 
        fns.moveLeft()
        break;
      case 'ArrowDown': 
      case 'Space': 
        fns.drop()
        break;
    }
  }

  document.addEventListener('keydown',cb)
  return () => document.removeEventListener('keydown', cb);
}

function createTile(ctx, color, row, col) {
  const isEmpty = !color;
  const fill = color || 'rgba(255, 255, 255, 0)';

  const render = () => {
    ctx.fillStyle = fill;
    ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL)
  }

  return { render, isEmpty } 
}

function createPiece(ctx) {
  let pos = { x: WIDTH / 2, y: 0 }

  // TODO: Randomize
  const shape = getShape();
  const color = Colors.BLUE;

  const moveRight = () => {
    pos.x += 1;
  }

  const moveLeft = () => {
    pos.x -= 1;
  }

  const drop = () => {
    if (pos.y + 5 < HEIGHT) {
      pos.y += 5;
    }
  }

  const cleanup = registerKeydown({moveRight, moveLeft, drop});

  const render = () => {
    // console.log('pos', pos);
    ctx.fillStyle = color;
    ctx.fillRect(pos.x * PIXEL, pos.y * PIXEL, PIXEL, PIXEL)
    // shape.forEach((box) => {
    //   if (!!box) {
    //     ctx.fillRect(pos.x, pos.y, PIXEL, PIXEL)
    //   }
    // });
  }

  const update = (floor) => {
    // If !!floor[row][col] for any of the piece's boxes, stop the piece and move it to the floor array
    // TODO: Will have to block horizontal movement
    if (!floor[pos.y + 1]?.[pos.x].isEmpty) {
      floor[pos.y][pos.x] = createTile(ctx, color, pos.y, pos.x)
      reset()
    } else {
      pos.y += 1;
    }
  }

  const reset = () => {
    pos = { x: WIDTH / 2, y: 0 }
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
