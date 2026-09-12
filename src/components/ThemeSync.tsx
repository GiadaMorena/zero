"use client";

import { useEffect } from "react";

/**
 * ThemeSync — Global safe-area background fix
 *
 * Problem: On iOS with viewport-fit=cover, the status bar / Dynamic Island area
 * is transparent and shows whatever is behind it — which is the html/body
 * background. If that color doesn't match the active screen, a visible bar appears.
 *
 * Solution: This component lives at the root. Whenever the active screen changes,
 * it updates:
 *   1. document.documentElement (html) background → matches the screen
 *   2. document.body background → same
 *   3. <meta name="theme-color"> → tells iOS Safari what color to use for the
 *      browser chrome and status bar overlay
 *
 * No individual screen needs to be modified.
 * The screen's own background extends naturally all the way to the physical edge.
 */

interface ThemeSyncProps {
  /** The background color of the currently visible screen */
  screenBackground: string;
}

export function ThemeSync({ screenBackground }: ThemeSyncProps) {
  useEffect(() => {
    // 1. Sync html and body so overscroll bounce shows the right color
    document.documentElement.style.backgroundColor = screenBackground;
    document.body.style.backgroundColor = screenBackground;

    // 2. Sync <meta name="theme-color"> — controls iOS status bar tint
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = screenBackground;
  }, [screenBackground]);

  // Renders nothing — purely a side-effect component
  return null;
}
