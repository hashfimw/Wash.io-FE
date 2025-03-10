"use client";

import React from "react";

interface CSSWaveProps {
  opacity?: number;
  height?: number;
}

const CSSWave: React.FC<CSSWaveProps> = ({ opacity = 0.3, height = 100 }) => {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1, height: `${height}px` }}
    >
      <div
        className="w-[200%] h-full relative animate-wave"
        style={{
          animation: "moveWave 15s linear infinite",
        }}
      >
        <div className="absolute bottom-0 left-0 w-full h-full">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0"
          >
            <path
              d="M0,0 C300,30 600,60 900,50 C1200,40 1500,30 1800,40 L1800,120 L0,120 Z"
              className="fill-birtu"
              style={{ opacity: opacity }}
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes moveWave {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-wave {
          animation: moveWave 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CSSWave;
