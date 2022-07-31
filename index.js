const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = 10;
const HEIGHT = 20;
const TILE_SIZE = 20;
const DEFAULT_SPEED = 1;

canvas.width = WIDTH * TILE_SIZE;
canvas.height = HEIGHT * TILE_SIZE;
canvas.style.backgroundColor = 'black';

// TODO:
// Keep track of lines
// Speed up
// Next piece

let speed = DEFAULT_SPEED;

const colors = [
  'tomato',
  'orange',
  'dodgerblue',
  'blueviolet',
  'magenta',
  'lime',
  'yellow',
];

const shapes = {
  L: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  J: [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  T: [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  I: [[1], [1], [1], [1]],
  S: [
    [0, 1],
    [1, 1],
    [1, 0],
  ],
  Z: [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
};

function getRandomNum(num) {
  return Math.floor(Math.random() * num);
}

const floor = createFloor();
const piece = createPiece(floor);
const bg = createBg();

function createTile({ color = 'black', isEmpty }) {
  const render = (x, y) => {
    if (!isEmpty) {
      ctx.fillStyle = color;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  };

  return { render, isEmpty };
}

function createFloor() {
  let tiles = createTiles();

  function createTiles() {
    return Array(HEIGHT)
      .fill([])
      .map(() => Array(WIDTH).fill(createTile({ isEmpty: true })));
  }

  const reset = () => {
    tiles = createTiles();
  };

  const isFilled = (x, y) => {
    return !tiles[y][x].isEmpty;
  };

  const render = () => {
    tiles.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        tile.render(colIdx, rowIdx);
      });
    });
  };

  const fillTile = (col, row, color) => {
    tiles[row][col] = createTile({
      isEmpty: false,
      color,
    });
  };

  const update = () => {
    for (const [rowIdx, row] of tiles.entries()) {
      if (row.every((tile) => !tile.isEmpty)) {
        tiles.splice(rowIdx, 1);
        tiles.unshift(
          Array(WIDTH)
            .fill(null)
            .map(() => createTile({ isEmpty: true }))
        );
      }
    }
  };

  return { render, update, fillTile, reset, isFilled };
}

function createPiece(floor) {
  let pos = { x: WIDTH / 2, y: 0 };
  let randomIdx = getRandomNum(7);
  let color = colors[randomIdx];
  let shape = Object.values(shapes)[randomIdx];

  const reset = () => {
    pos = { x: WIDTH / 2, y: 0 };
    randomIdx = getRandomNum(7);
    color = colors[randomIdx];
    shape = Object.values(shapes)[randomIdx];
    stopMoveDown();
  };

  const isOffscreenBottom = () => pos.y + shape.length >= HEIGHT;
  const isOffscreenLeft = () => pos.x <= 0;
  const isOffscreenRight = () => pos.x + shape[0].length >= WIDTH;

  const render = () => {
    ctx.fillStyle = color;
    shape.forEach((row, rowIdx) => {
      row.forEach((col, colIdx) => {
        if (col) {
          ctx.fillRect(
            (pos.x + colIdx) * TILE_SIZE,
            (pos.y + rowIdx) * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          );
        }
      });
    });
  };

  const transferToFloor = () => {
    shape.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        if (!tile) return;

        const xPositionPlusOffset = pos.x + colIdx;
        const yPositionPlusOffset = pos.y + rowIdx;
        // transfer to floor
        floor.fillTile(xPositionPlusOffset, yPositionPlusOffset, color);
      });
    });
    reset();
  };

  const update = () => {
    if (isOffscreenBottom()) {
      transferToFloor();
      return;
    }

    for (const [rowIdx, row] of shape.entries()) {
      for (const [colIdx, tile] of row.entries()) {
        if (tile && floor.isFilled(pos.x + colIdx, pos.y + rowIdx + 1)) {
          if (pos.y === 0) {
            window.alert('Game over!');
            resetGame();
            return;
          }

          transferToFloor();
          return;
        }
      }
    }

    pos.y += 1;
  };

  const moveLeft = () => {
    if (isOffscreenLeft()) {
      return;
    }

    for (const [rowIdx, row] of shape.entries()) {
      for (const [colIdx, tile] of row.entries()) {
        if (tile && floor.isFilled(pos.x + colIdx - 1, pos.y + rowIdx)) {
          return;
        }
      }
    }

    pos.x -= 1;
  };

  const moveRight = () => {
    if (isOffscreenRight()) {
      return;
    }

    for (const [rowIdx, row] of shape.entries()) {
      for (const [colIdx, tile] of row.entries()) {
        if (tile && floor.isFilled(pos.x + colIdx + 1, pos.y + rowIdx)) {
          return;
        }
      }
    }

    pos.x += 1;
  };

  const moveDown = () => {
    speed = 50;
  };

  const stopMoveDown = () => {
    speed = DEFAULT_SPEED;
  };

  const rotate = () => {
    const newShape = Array(shape[0].length)
      .fill(null)
      .map(() => []);

    for (const row of shape) {
      for (const [colIdx, col] of row.entries()) {
        newShape[colIdx].unshift(col);
      }
    }

    const prevX = pos.x;
    const prevY = pos.y;
    const prevShape = shape;

    shape = newShape;

    if (isOffscreenBottom()) {
      pos.y = HEIGHT - shape.length;
    }

    if (isOffscreenLeft()) {
      pos.x = 0;
    }

    if (isOffscreenRight()) {
      pos.x = WIDTH - shape[0].length;
    }

    for (const [rowIdx, row] of shape.entries()) {
      for (const [colIdx, tile] of row.entries()) {
        if (tile && floor.isFilled(pos.x + colIdx, pos.y + rowIdx)) {
          shape = prevShape;
          pos.x = prevX;
          pos.y = prevY;
          return;
        }
      }
    }
  };

  const moveFns = { moveLeft, moveRight, moveDown, stopMoveDown, rotate };

  // Don't need to deregister unless we start creating more pieces
  registerKeys(moveFns);

  return { render, update, reset };
}

function createBg() {
  const render = () => {
    ctx.clearRect(0, 0, WIDTH * TILE_SIZE, HEIGHT * TILE_SIZE);
  };
  return { render };
}

function updateWorld() {
  // Updating positions of entities
  piece.update();
  floor.update();
}

function renderWorld() {
  // Drawing things
  bg.render();
  floor.render();
  piece.render();
}

function registerKeys(fns) {
  const keyDown = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        fns.moveLeft();
        break;
      case 'ArrowRight':
        fns.moveRight();
        break;
      case 'ArrowDown':
        fns.moveDown();
        break;
      case 'ArrowUp':
        fns.rotate();
        break;
    }
  };

  const keyUp = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        fns.stopMoveDown();
        break;
    }
  };

  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  return () => {
    document.removeEventListener('keydown', keyDown);
    document.removeEventListener('keyup', keyUp);
  };
}

let start = 0;
let animId = null;

const loop = (elapsed) => {
  const secondHasPassed = elapsed - start >= 1000 / speed;
  if (secondHasPassed) {
    start = elapsed;
    updateWorld();
  }
  renderWorld();
  animId = requestAnimationFrame(loop);
};

function resetGame() {
  bg.render();
  floor.reset();
  piece.reset();
  if (!animId) {
    animId = requestAnimationFrame(loop);
  }
}

function playPause() {
  if (animId) {
    console.log('cancelling...');
    cancelAnimationFrame(animId);
    animId = null;
  } else {
    console.log('restarting...');
    animId = requestAnimationFrame(loop);
  }
}

const playPauseButton = document.getElementById('play-pause');
const resetButton = document.getElementById('reset');

playPauseButton.addEventListener('click', playPause);
resetButton.addEventListener('click', resetGame);

requestAnimationFrame(loop);
