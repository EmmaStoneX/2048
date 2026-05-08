import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  boardValues,
  calculateBestProgress,
  canMove,
  createBoardFromValues,
  move,
  undo,
} from "../src/game/engine";
import type { GameState } from "../src/game/types";

function makeState(values: Array<number | null>, score = 0): GameState {
  return {
    board: createBoardFromValues(values),
    score,
    bestScore: score,
    previous: null,
    status: "playing",
  };
}

describe("2048 engine", () => {
  it("merges a row to the left once per pair", () => {
    const state = makeState([
      2, 2, 2, 2,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);

    const next = move(state, "left", { spawn: false });

    assert.deepEqual(boardValues(next.board), [
      4, 4, null, null,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);
    assert.equal(next.score, 8);
  });

  it("merges a row to the right", () => {
    const state = makeState([
      2, 2, 4, 4,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);

    const next = move(state, "right", { spawn: false });

    assert.deepEqual(boardValues(next.board), [
      null, null, 4, 8,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);
    assert.equal(next.score, 12);
  });

  it("merges a column upward", () => {
    const state = makeState([
      2, null, null, null,
      2, null, null, null,
      4, null, null, null,
      4, null, null, null,
    ]);

    const next = move(state, "up", { spawn: false });

    assert.deepEqual(boardValues(next.board), [
      4, null, null, null,
      8, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);
    assert.equal(next.score, 12);
  });

  it("does not spawn or save history when the board does not move", () => {
    const state = makeState([
      2, null, null, null,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);

    const next = move(state, "left");

    assert.equal(next, state);
    assert.equal(next.previous, null);
  });

  it("spawns a new tile only after a valid move", () => {
    const state = makeState([
      null, 2, null, null,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);

    const next = move(state, "left", { random: () => 0 });

    assert.equal(boardValues(next.board).filter(Boolean).length, 2);
    assert.notEqual(next.previous, null);
  });

  it("restores one previous state with undo", () => {
    const state = makeState([
      2, 2, null, null,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);

    const moved = move(state, "left", { spawn: false });
    const restored = undo(moved);

    assert.deepEqual(boardValues(restored.board), boardValues(state.board));
    assert.equal(restored.score, 0);
    assert.equal(restored.previous, null);
  });

  it("detects a lost board", () => {
    const board = createBoardFromValues([
      2, 4, 2, 4,
      4, 2, 4, 2,
      2, 4, 2, 4,
      4, 2, 4, 2,
    ]);

    assert.equal(canMove(board), false);
  });

  it("calculates best score progress", () => {
    assert.equal(calculateBestProgress(50, 200), 25);
    assert.equal(calculateBestProgress(300, 200), 100);
    assert.equal(calculateBestProgress(50, 0), 0);
  });
});
