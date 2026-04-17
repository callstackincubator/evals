"use client";

import { useEffect, useState, type RefObject } from "react";

export function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);

      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      setWidth(entry?.contentRect.width ?? element.getBoundingClientRect().width);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return width;
}
