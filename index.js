// import {Colors} from './utils.js'

const canvas = document.getElementById('canvas');

console.log('canvas', canvas);

canvas.style.backgroundColor = 'black';

const Colors = {
  BLACK: 'black',
  BLUE: 'dodgerblue',
  RED: 'tomato',
  GREEN: 'lime',
  ORANGE: 'orange',
  YELLOW: 'goldenrod',
}

const WIDTH = 400;
const HEIGHT = 600;
const PIXEL = 20;

let movesPerSecond = 1;

// loop
// draw
// update

const ctx = canvas.getContext('2d');
console.log('ctx', ctx);

let piece = createPiece(ctx);
let floor = [];
const bg = {
  render: () => {
    console.log('rendering');
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
  }
}

const startLoop = () => {
  let id = null;
  let prev = 0;
  function loop() {
    id = requestAnimationFrame((elapsed) => {
      if (elapsed - prev > 1000) {
        update(piece, floor)
        draw(piece, floor, bg)
        prev = elapsed
      }
      loop()
    });
  }
  loop()
  const getId = () => id;
  return getId
}


function update(piece, floor) {
  // Update falling piece
  piece.update()
  // If piece touches floor:
  //   add it to floor 
  //   get next shape from box
  //   add random shape to box
  // Update lines if piece clears a row
  // End game if piece touches the top of the screen
}

function draw(piece, floor, bg) {
  bg.render();
  piece.render();
  floor.forEach((tile) => {
    tile.render();
  });
}

function getShape() {
  // TODO: create shapes
  const shapes = {
    L: '' , 
    T: '' , 
    S: '' , 
    Z: '' , 
    I: '' , 
    O: [['X', 'X'],['X', 'X']] , 
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

function createPiece(ctx) {
  let pos = { x: WIDTH / 2, y: 0 }
  // TODO: Randomize
  const shape = getShape();
  const color = Colors.BLUE;

  const moveRight = () => console.log('right!')
  const moveLeft = () => console.log('left!')
  const drop = () => console.log('drop!')

  const cleanup = registerKeydown({moveRight, moveLeft, drop});

  const render = () => {
    ctx.fillStyle = color;
    ctx.fillRect(pos.x, pos.y, PIXEL, PIXEL)
  }

  const update = () => {
    pos.y += (1 * PIXEL);
    console.log('pos.y', pos.y);
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
