import type { Board, Direction, GameSnapshot, GameState, RandomSource, Tile, TileMove, TileSpawn } from "./types";

export const BOARD_SIZE = 4;
export const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;

const MOVE_ANIMATION_DURATION_MS = 140;

type MoveOptions = {
  random?: RandomSource;
  spawn?: boolean;
};

type LineTile = {
  tile: Tile;
  offset: number;
};

type LineMove = {
  tileId: string;
  value: number;
  fromOffset: number;
  toOffset: number;
  kind: TileMove["kind"];
};

type MovedLine = {
  line: Board;
  gained: number;
  moves: LineMove[];
};

type SpawnedBoard = {
  board: Board;
  spawn: TileSpawn | null;
};

let tileCounter = 0;
let animationCounter = 0;

function createTile(value: number, fresh = false, merged = false): Tile {
  tileCounter += 1;

  return {
    id: `tile-${tileCounter}`,
    value,
    fresh,
    merged,
  };
}

function cloneTile(tile: Tile): Tile {
  return {
    id: tile.id,
    value: tile.value,
  };
}

function clearFlags(board: Board): Board {
  return board.map((tile) => (tile ? cloneTile(tile) : null));
}

function cloneBoard(board: Board): Board {
  return board.map((tile) => (tile ? { ...tile } : null));
}

function emptyBoard(): Board {
  return Array.from({ length: BOARD_CELLS }, () => null);
}

function indexFor(direction: Direction, line: number, offset: number) {
  if (direction === "left") {
    return line * BOARD_SIZE + offset;
  }

  if (direction === "right") {
    return line * BOARD_SIZE + (BOARD_SIZE - 1 - offset);
  }

  if (direction === "up") {
    return offset * BOARD_SIZE + line;
  }

  return (BOARD_SIZE - 1 - offset) * BOARD_SIZE + line;
}

function getLine(board: Board, direction: Direction, line: number): Board {
  return Array.from({ length: BOARD_SIZE }, (_, offset) => board[indexFor(direction, line, offset)]);
}

function setLine(board: Board, direction: Direction, lineIndex: number, line: Board) {
  line.forEach((tile, offset) => {
    board[indexFor(direction, lineIndex, offset)] = tile;
  });
}

function moveLine(line: Board): MovedLine {
  const compacted = line.flatMap((tile, offset): LineTile[] => (tile === null ? [] : [{ tile, offset }]));
  const moved: Tile[] = [];
  const moves: LineMove[] = [];
  let gained = 0;

  for (let index = 0; index < compacted.length; index += 1) {
    const current = compacted[index];
    const next = compacted[index + 1];
    const toOffset = moved.length;

    if (next && current.tile.value === next.tile.value) {
      const value = current.tile.value * 2;
      moved.push(createTile(value, false, true));
      moves.push({ tileId: current.tile.id, value: current.tile.value, fromOffset: current.offset, toOffset, kind: "merge" });
      moves.push({ tileId: next.tile.id, value: next.tile.value, fromOffset: next.offset, toOffset, kind: "merge" });
      gained += value;
      index += 1;
    } else {
      moved.push(cloneTile(current.tile));
      moves.push({ tileId: current.tile.id, value: current.tile.value, fromOffset: current.offset, toOffset, kind: "move" });
    }
  }

  return {
    line: [...moved, ...Array.from({ length: BOARD_SIZE - moved.length }, () => null)],
    gained,
    moves,
  };
}

function valuesEqual(left: Board, right: Board) {
  return left.every((tile, index) => tile?.value === right[index]?.value);
}

function resolveStatus(board: Board) {
  if (hasWon(board)) {
    return "won";
  }

  return canMove(board) ? "playing" : "lost";
}

function addRandomTileForMove(board: Board, random: RandomSource = Math.random): SpawnedBoard {
  const emptyIndexes = board.flatMap((tile, index) => (tile === null ? [index] : []));

  if (emptyIndexes.length === 0) {
    return { board: cloneBoard(board), spawn: null };
  }

  const nextBoard = cloneBoard(board);
  const at = emptyIndexes[Math.floor(random() * emptyIndexes.length)];
  const value = random() < 0.9 ? 2 : 4;
  const tile = createTile(value, true);
  nextBoard[at] = tile;

  return {
    board: nextBoard,
    spawn: {
      tileId: tile.id,
      value,
      at,
    },
  };
}

export function boardValues(board: Board) {
  return board.map((tile) => tile?.value ?? null);
}

export function createBoardFromValues(values: Array<number | null>): Board {
  return Array.from({ length: BOARD_CELLS }, (_, index) => {
    const value = values[index] ?? null;
    return value === null ? null : createTile(value);
  });
}

export function addRandomTile(board: Board, random: RandomSource = Math.random): Board {
  const emptyIndexes = board.flatMap((tile, index) => (tile === null ? [index] : []));

  if (emptyIndexes.length === 0) {
    return cloneBoard(board);
  }

  const nextBoard = clearFlags(board);
  const emptyIndex = emptyIndexes[Math.floor(random() * emptyIndexes.length)];
  const value = random() < 0.9 ? 2 : 4;
  nextBoard[emptyIndex] = createTile(value, true);

  return nextBoard;
}

export function createInitialState(bestScore = 0, random: RandomSource = Math.random): GameState {
  const board = addRandomTile(addRandomTile(emptyBoard(), random), random);

  return {
    board,
    score: 0,
    bestScore,
    previous: null,
    status: "playing",
    animation: null,
  };
}

export function move(state: GameState, direction: Direction, options: MoveOptions = {}): GameState {
  if (state.status === "lost") {
    return state;
  }

  const board = clearFlags(state.board);
  const movedBoard = emptyBoard();
  const moves: TileMove[] = [];
  let gained = 0;

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex += 1) {
    const movedLine = moveLine(getLine(board, direction, lineIndex));
    setLine(movedBoard, direction, lineIndex, movedLine.line);
    gained += movedLine.gained;
    moves.push(
      ...movedLine.moves.map((lineMove) => ({
        tileId: lineMove.tileId,
        value: lineMove.value,
        from: indexFor(direction, lineIndex, lineMove.fromOffset),
        to: indexFor(direction, lineIndex, lineMove.toOffset),
        kind: lineMove.kind,
      })),
    );
  }

  if (valuesEqual(board, movedBoard)) {
    return state;
  }

  const previous: GameSnapshot = {
    board,
    score: state.score,
    status: state.status,
  };

  const spawned = options.spawn === false ? { board: movedBoard, spawn: null } : addRandomTileForMove(movedBoard, options.random ?? Math.random);
  const score = state.score + gained;

  animationCounter += 1;

  return {
    board: spawned.board,
    score,
    bestScore: Math.max(state.bestScore, score),
    previous,
    status: resolveStatus(spawned.board),
    animation: {
      id: animationCounter,
      moves,
      spawns: spawned.spawn ? [spawned.spawn] : [],
      durationMs: MOVE_ANIMATION_DURATION_MS,
    },
  };
}

export function undo(state: GameState): GameState {
  if (!state.previous) {
    return state;
  }

  return {
    board: cloneBoard(state.previous.board),
    score: state.previous.score,
    bestScore: Math.max(state.bestScore, state.previous.score),
    previous: null,
    status: state.previous.status,
    animation: null,
  };
}

export function canMove(board: Board) {
  if (board.some((tile) => tile === null)) {
    return true;
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const value = board[row * BOARD_SIZE + column]?.value;
      const right = column < BOARD_SIZE - 1 ? board[row * BOARD_SIZE + column + 1]?.value : null;
      const down = row < BOARD_SIZE - 1 ? board[(row + 1) * BOARD_SIZE + column]?.value : null;

      if (value === right || value === down) {
        return true;
      }
    }
  }

  return false;
}

export function hasWon(board: Board) {
  return board.some((tile) => tile !== null && tile.value >= 2048);
}

export function calculateBestProgress(score: number, bestScore: number) {
  if (bestScore <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((score / bestScore) * 100));
}
