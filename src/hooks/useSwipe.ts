"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";
import type { Direction } from "@/src/game/types";

type Point = {
  x: number;
  y: number;
  pointerId: number;
};

type UseSwipeOptions = {
  minDistance?: number;
};

export function useSwipe(onSwipe: (direction: Direction) => void, options: UseSwipeOptions = {}) {
  const { minDistance = 28 } = options;
  const start = useRef<Point | null>(null);

  const resetStart = useCallback((target: HTMLElement, pointerId: number) => {
    start.current = null;

    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  }, []);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (start.current?.pointerId === event.pointerId) {
      event.preventDefault();
    }
  }, []);

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!start.current || start.current.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - start.current.x;
      const deltaY = event.clientY - start.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      resetStart(event.currentTarget, event.pointerId);

      if (Math.max(absX, absY) < minDistance) {
        return;
      }

      onSwipe(absX > absY ? (deltaX > 0 ? "right" : "left") : deltaY > 0 ? "down" : "up");
    },
    [minDistance, onSwipe, resetStart],
  );

  const onPointerCancel = useCallback((event: PointerEvent<HTMLElement>) => {
    if (start.current?.pointerId === event.pointerId) {
      resetStart(event.currentTarget, event.pointerId);
    }
  }, [resetStart]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
