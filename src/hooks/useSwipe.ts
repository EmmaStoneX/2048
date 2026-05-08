"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";
import type { Direction } from "@/src/game/types";

type Point = {
  x: number;
  y: number;
  pointerId: number;
};

export function useSwipe(onSwipe: (direction: Direction) => void, minDistance = 28) {
  const start = useRef<Point | null>(null);

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
      start.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (Math.max(absX, absY) < minDistance) {
        return;
      }

      onSwipe(absX > absY ? (deltaX > 0 ? "right" : "left") : deltaY > 0 ? "down" : "up");
    },
    [minDistance, onSwipe],
  );

  const onPointerCancel = useCallback((event: PointerEvent<HTMLElement>) => {
    if (start.current?.pointerId === event.pointerId) {
      start.current = null;
    }
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
