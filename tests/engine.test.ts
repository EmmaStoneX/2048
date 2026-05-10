import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  boardValues,
  calculateBestProgress,
  canMove,
  createBoardFromValues,
  createInitialState,
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
    animation: null,
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
    assert.equal(next.animation, null);
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

  it("records move animation paths", () => {
    const state = makeState([
      null, 2, null, null,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);
    const tile = state.board[1];

    const next = move(state, "left", { spawn: false });

    if (next.animation === null || tile === null) {
      assert.fail("Expected a move animation");
    }

    assert.deepEqual(next.animation.moves, [
      { tileId: tile.id, value: 2, from: 1, to: 0, kind: "move" },
    ]);
    assert.deepEqual(next.animation.spawns, []);
  });

  it("records merge animation paths", () => {
    const state = makeState([
      2, 2, null, null,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);
    const first = state.board[0];
    const second = state.board[1];

    const next = move(state, "left", { spawn: false });

    if (next.animation === null || first === null || second === null) {
      assert.fail("Expected a merge animation");
    }

    assert.deepEqual(next.animation.moves, [
      { tileId: first.id, value: 2, from: 0, to: 0, kind: "merge" },
      { tileId: second.id, value: 2, from: 1, to: 0, kind: "merge" },
    ]);
    assert.equal(next.board[0]?.merged, true);
  });

  it("records spawned tile animation data", () => {
    const state = makeState([
      null, 2, null, null,
      null, null, null, null,
      null, null, null, null,
      null, null, null, null,
    ]);

    const next = move(state, "left", { random: () => 0 });

    if (next.animation === null) {
      assert.fail("Expected spawn animation data");
    }

    assert.deepEqual(next.animation.spawns, [
      { tileId: next.board[1]?.id, value: 2, at: 1 },
    ]);
    assert.equal(next.board[1]?.fresh, true);
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
    assert.equal(restored.animation, null);
  });

  it("starts without animation data", () => {
    const state = createInitialState(0, () => 0);

    assert.equal(state.animation, null);
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

  it("changes from won to lost when no moves remain after continuing", () => {
    const state = makeState([
      null, 2, 4, 8,
      16, 32, 64, 128,
      256, 512, 1024, 2048,
      4, 8, 16, 32,
    ]);
    state.status = "won";

    const next = move(state, "left", { random: () => 0 });

    assert.equal(next.status, "lost");
    assert.equal(canMove(next.board), false);
  });

  it("calculates best score progress", () => {
    assert.equal(calculateBestProgress(50, 200), 25);
    assert.equal(calculateBestProgress(300, 200), 100);
    assert.equal(calculateBestProgress(50, 0), 0);
  });
});
