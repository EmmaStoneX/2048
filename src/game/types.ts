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

export type GameState = GameSnapshot & {
  bestScore: number;
  previous: GameSnapshot | null;
};

export type RandomSource = () => number;
