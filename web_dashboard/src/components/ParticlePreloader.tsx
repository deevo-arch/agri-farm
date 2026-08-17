import React, { useState, useEffect, useRef } from "react";
import PixelTransition from "./PixelTransition";
import "./ParticlePreloader.css";

const PRELOADER_KEY = "hasSeenPreloader";
const HOVER_DURATION_MS = 2000; // 2 seconds

export default function ParticlePreloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 100
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Disable preloader for mobile phones (< 768px or mobile user-agent)
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setIsVisible(false);
      return;
    }

    // Check if preloader has already been seen in current session
    const hasSeen = sessionStorage.getItem(PRELOADER_KEY);
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const startHoverTimer = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / HOVER_DURATION_MS) * 100));
      setHoverProgress(pct);

      if (pct >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 30);

    hoverTimerRef.current = setTimeout(() => {
      dismissPreloader();
    }, HOVER_DURATION_MS);
  };

  const cancelHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setHoverProgress(0);
  };

  const dismissPreloader = () => {
    setIsFading(true);
    sessionStorage.setItem(PRELOADER_KEY, "true");
    setTimeout(() => {
      setIsVisible(false);
    }, 650);
  };

  if (!isVisible) return null;

  return (
    <div className={`particle-preloader-overlay ${isFading ? "fade-out" : ""}`}>
      <div className="preloader-pixel-card-wrapper">
        <PixelTransition
          gridSize={8}
          pixelColor="#2d8f4e"
          animationStepDuration={0.35}
          aspectRatio="55%"
          className="preloader-pixel-card"
          firstContent={
            <div
              className="preloader-content-box"
              onMouseEnter={startHoverTimer}
              onMouseLeave={cancelHoverTimer}
            >
              {/* UPLOADING COMPRESSED CAT IMAGE */}
              <div className="preloader-cat-wrapper">
                <img
                  src="/cat.webp"
                  alt="Surprised Cat Preloader"
                  className="preloader-cat-img"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Instructions & Progress Track */}
              <div className="preloader-instruction-bar">
                <p className="instruction-text">
                  {hoverProgress > 0
                    ? `Dissolving pixels in ${( (HOVER_DURATION_MS - (hoverProgress / 100) * HOVER_DURATION_MS) / 1000 ).toFixed(1)}s...`
                    : "Hover cat picture for 2 seconds to enter"}
                </p>
                <div className="preloader-progress-track">
                  <div
                    className="preloader-progress-fill"
                    style={{ width: `${hoverProgress}%` }}
                  />
                </div>
              </div>
            </div>
          }
          secondContent={
            <div className="preloader-revealed-screen">
              <span className="reveal-title">MEOW!</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
