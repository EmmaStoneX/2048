export type Direction = "up" | "down" | "left" | "right";

export type GameStatus = "playing" | "won" | "lost";

export type Tile = {
  id: string;
  value: number;
  fresh?: boolean;
  merged?: boolean;
};

export type Board = Array<Tile | null>;

export type GameSnapshot = {
  board: Board;
  score: number;
  status: GameStatus;
};

export type TileMove = {
  tileId: string;
  value: number;
  from: number;
  to: number;
  kind: "move" | "merge";
};

export type TileSpawn = {
  tileId: string;
  value: number;
  at: number;
};

export type MoveAnimation = {
  id: number;
  moves: TileMove[];
  spawns: TileSpawn[];
  durationMs: number;
};

export type GameState = GameSnapshot & {
  bestScore: number;
  previous: GameSnapshot | null;
  animation: MoveAnimation | null;
};

export type RandomSource = () => number;
