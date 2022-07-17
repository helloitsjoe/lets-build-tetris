const canvas = document.getElementById('canvas');

const WIDTH = 10;
const HEIGHT = 20;
const PIXEL = 20;
const DEFAULT_SPEED = 1;

canvas.width = WIDTH * PIXEL;
canvas.height = HEIGHT * PIXEL;
canvas.style.backgroundColor = 'black';

const colors = {
  L: 'dodgerblue',
  J: 'tomato',
  T: 'lime',
  S: 'orange',
  Z: 'yellow',
  I: 'violet',
  O: 'blueviolet',
}

// TODO: Make sure shapes rotate in the right direction
// Hardcode all rotations to start
const shapes = {
  L: [[[1, 0], [1, 0], [1, 1]], [[1, 1, 1], [1, 0, 0]], [[1, 1], [0, 1], [0, 1]], [[0, 0, 1], [1, 1, 1]] ], 
  J: [[[0, 1], [0, 1], [1, 1]], [[1, 0, 0], [1, 1, 1]], [[1, 1], [1, 0], [1, 0]], [[1, 1, 1], [0, 0, 1]]], 
  T: [[[1, 0], [1, 1], [1, 0]], [[0, 1, 0], [1,1, 1]], [[0, 1], [1, 1], [0, 1]], [[1, 1, 1], [0, 1, 0]]], 
  S: [[[1, 0], [1, 1], [0, 1]], [[0, 1, 1], [1, 1, 0]]], 
  Z: [[[0, 1], [1, 1], [1, 0]], [[1, 1, 0], [0, 1, 1]]], 
  I: [[[1], [1], [1], [1]], [[1, 1, 1, 1]]], 
  O: [[[1, 1],[1, 1]]],
}

// TODO: Increase as you level up
let movesPerSecond = DEFAULT_SPEED;

const ctx = canvas.getContext('2d');

let floor = createFloor();
let piece = createPiece(ctx, floor.tiles);

function getRandomKey(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)]
}

function createFloor() {
  const createRow = (row) =>
    Array(WIDTH).fill(null)
      .map((_, col) => {
        // const color = row === HEIGHT - 1 ? Colors.BROWN : null;
        return createTile(ctx, null)
      })

  const tiles = Array(HEIGHT).fill([])
    .map((_, row) => createRow())

  const checkTop = () => tiles[0].some((tile) => !tile.isEmpty)

  const add = (tile, row, col) => {
    tiles[row][col] = tile;
  }

  const clearRows = () => {
    tiles.forEach((row, i) => {
      if (row.every((t) => !t.isEmpty)) {
        tiles.splice(i, 1)
        tiles.unshift(createRow())
      }
    });
  }

  return {tiles, checkTop, add, update: clearRows}
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
        if (floor.checkTop()) {
          cancelAnimationFrame(id);
          alert('Game Over!')
          resetGame();
        }
        prev = elapsed
      }
      drawWorld(piece, floor.tiles, bg)
      loop()
    });
  }

  loop()
  const getId = () => id;
  return getId
}


function updateWorld(piece) {
  piece.update()
  floor.update();
}

function drawWorld(piece, floorTiles, bg) {
  bg.render();
  piece.render();
  floorTiles.forEach((row, rowIdx) => {
    row.forEach((tile, colIdx) => {
      // TODO: consistent row/col
      tile.render(rowIdx, colIdx);
    })
  });
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
      case 'ArrowUp':
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
    fns.stopDrop();
    document.removeEventListener('keydown', down);
    document.removeEventListener('keyup', up);
  }
}

function createTile(ctx, color) {
  const isEmpty = !color;
  const fillColor = color || 'rgba(255, 255, 255, 0)';

  const render = (row, col) => {
    ctx.fillStyle = fillColor;
    ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL)
  }

  return { render, isEmpty} 
}

function createPiece(ctx, floorTiles) {
  let random = getRandomKey(shapes);
  let pos = { x: WIDTH / 2, y: 0 }
  console.log('random', random);
  let shape = shapes[random]
  let color = colors[random]
  let rotation = 0;
  let endGame = false;

  function reset() {
    random = getRandomKey(shapes);
    pos = { x: WIDTH / 2, y: 0 }
    shape = shapes[random];
    color = colors[random]
    rotation = 0;
  }

  const moveRight = () => {
    // TODO: enable moving under ledges, block sideways
    // Check wall
    if (pos.x + shape[rotation][0].length >= WIDTH) return;
    // Check floor
    if (!floorTiles[pos.y][pos.x + 1].isEmpty) return;

    pos.x += 1;
  }

  const moveLeft = () => {
    // TODO: enable moving under ledges, block sideways
    // Check wall
    if (pos.x - 1 < 0) return;
    // Check floor
    if (!floorTiles[pos.y][pos.x - 1].isEmpty) return;

    pos.x -= 1;
  }

  const drop = () => movesPerSecond = 60;
  const stopDrop = () => movesPerSecond = DEFAULT_SPEED;
  const rotate = () => rotation = (rotation + 1) % shape.length;

  const cleanup = registerKeys({moveRight, moveLeft, drop, stopDrop, rotate});

  const render = () => {
    ctx.fillStyle = color;
    shape[rotation].forEach((row, rowIdx) => {
      row.forEach((box, boxIdx) => {
        if (!!box) {
          const boxOriginX = pos.x + boxIdx;
          const boxOriginY = pos.y + rowIdx;
          ctx.fillRect(boxOriginX * PIXEL, boxOriginY * PIXEL, PIXEL, PIXEL)
        }
      })
    });
  }

  const _checkHitFloor = () => {
    // Can be optimized by just looking at last row
    let hitFloor = false;
    shape[rotation].forEach((row, rowIdx) => {
      row.forEach((box, boxIdx) => {
        const boxOriginX = pos.x + boxIdx;
        const boxOriginY = pos.y + rowIdx;

        if (box && !floorTiles[boxOriginY + 1]?.[boxOriginX].isEmpty) {
          shape[rotation].forEach((row, rowIdx) => {
            row.forEach((box, boxIdx) => {
              const boxOriginX = pos.x + boxIdx;
              const boxOriginY = pos.y + rowIdx;
              if (box) {
                floor.add(createTile(ctx, color), boxOriginY, boxOriginX)
                hitFloor = true;
              }
            })
          })
        }
      })
    });

    return hitFloor;
  }

  const update = () => {
    const hitFloor = _checkHitFloor();

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

function resetGame() {
  bg.render();
  piece.cleanup();
  floor = createFloor();
  piece = createPiece(ctx, floor.tiles);
  piece.render();
}

resetButton.onclick = resetGame
