"use client";

import { useCallback, useRef } from "react";
import type { TouchEvent } from "react";
import type { Direction } from "@/src/game/types";

type Point = {
  x: number;
  y: number;
};

export function useSwipe(onSwipe: (direction: Direction) => void, minDistance = 32) {
  const start = useRef<Point | null>(null);

  const onTouchStart = useCallback((event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    start.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback((event: TouchEvent<HTMLElement>) => {
    if (start.current) {
      event.preventDefault();
    }
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      if (!start.current) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.current.x;
      const deltaY = touch.clientY - start.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      start.current = null;

      if (Math.max(absX, absY) < minDistance) {
        return;
      }

      if (absX > absY) {
        onSwipe(deltaX > 0 ? "right" : "left");
      } else {
        onSwipe(deltaY > 0 ? "down" : "up");
      }
    },
    [minDistance, onSwipe],
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
