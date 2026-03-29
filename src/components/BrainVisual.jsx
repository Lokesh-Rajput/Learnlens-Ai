import React, { useEffect, useRef } from "react";

/* ── Neural Brain Visual ─────────────────────────────────────
   A futuristic, animated 3D-style brain made entirely from
   SVG + CSS. Orange glowing nodes, pulsing synaptic connections,
   and floating data particles — no external dependencies.
─────────────────────────────────────────────────────────────── */

const nodes = [
  // Core cluster
  { id: 0, cx: 260, cy: 160, r: 7,  delay: 0 },
  { id: 1, cx: 200, cy: 200, r: 5,  delay: 0.4 },
  { id: 2, cx: 320, cy: 195, r: 6,  delay: 0.8 },
  { id: 3, cx: 180, cy: 270, r: 8,  delay: 0.2 },
  { id: 4, cx: 340, cy: 260, r: 5,  delay: 1.0 },
  { id: 5, cx: 260, cy: 300, r: 6,  delay: 0.6 },
  { id: 6, cx: 140, cy: 230, r: 4,  delay: 1.2 },
  { id: 7, cx: 380, cy: 225, r: 5,  delay: 0.3 },
  // Outer ring
  { id: 8,  cx: 120, cy: 170, r: 4, delay: 0.9 },
  { id: 9,  cx: 400, cy: 170, r: 4, delay: 0.5 },
  { id: 10, cx: 100, cy: 300, r: 3, delay: 1.4 },
  { id: 11, cx: 420, cy: 300, r: 4, delay: 0.7 },
  { id: 12, cx: 200, cy: 360, r: 5, delay: 1.1 },
  { id: 13, cx: 320, cy: 360, r: 4, delay: 0.2 },
  { id: 14, cx: 260, cy: 100, r: 5, delay: 1.3 },
  { id: 15, cx: 160, cy: 320, r: 3, delay: 0.8 },
  { id: 16, cx: 360, cy: 320, r: 3, delay: 0.4 },
  // Distant satellites
  { id: 17, cx:  80, cy: 230, r: 3, delay: 1.5 },
  { id: 18, cx: 445, cy: 240, r: 3, delay: 0.1 },
  { id: 19, cx: 260, cy: 420, r: 4, delay: 1.0 },
  { id: 20, cx: 155, cy: 140, r: 3, delay: 0.6 },
  { id: 21, cx: 365, cy: 140, r: 3, delay: 0.9 },
];

const edges = [
  [0,1],[0,2],[0,14],[1,3],[1,6],[2,4],[2,7],
  [3,5],[3,6],[4,5],[4,7],[5,12],[5,13],
  [6,8],[6,10],[7,9],[7,11],[8,17],[8,20],
  [9,18],[9,21],[10,15],[11,16],[12,15],[12,19],
  [13,16],[13,19],[14,20],[14,21],[0,5],[1,5],[2,5],
  [3,15],[4,16],[6,17],[7,18],
];

// Pulse animation along an edge (traveling dot)
const PulseEdge = ({ x1, y1, x2, y2, delay, dur }) => (
  <circle r="2.5" fill="#ff8c38" opacity="0.9">
    <animateMotion
      dur={`${dur}s`}
      repeatCount="indefinite"
      begin={`${delay}s`}
      path={`M${x1},${y1} L${x2},${y2}`}
    />
    <animate attributeName="opacity" values="0;1;0" dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} />
  </circle>
);

export default function BrainVisual() {
  return (
    <div className="brain-wrap">
      {/* Outer glow ring */}
      <div className="brain-glow-ring brain-glow-ring-1" />
      <div className="brain-glow-ring brain-glow-ring-2" />

      <svg
        viewBox="60 80 410 370"
        className="brain-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Orange node gradient */}
          <radialGradient id="nodeGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffb347" stopOpacity="1" />
            <stop offset="60%" stopColor="#ff6a00" stopOpacity="1" />
            <stop offset="100%" stopColor="#cc4400" stopOpacity="1" />
          </radialGradient>

          {/* Dim outer node gradient */}
          <radialGradient id="nodeDim" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff9040" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#882200" stopOpacity="0.7" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow for core nodes */}
          <filter id="glowStrong" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Edge gradient */}
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#ff8c38" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ff6a00" stopOpacity="0.15" />
          </linearGradient>

          {/* Brain silhouette mask */}
          <radialGradient id="brainBg" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ff5500" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background brain aura */}
        <ellipse cx="265" cy="250" rx="200" ry="175" fill="url(#brainBg)" />

        {/* ── Edges ── */}
        <g>
          {edges.map(([a, b], i) => {
            const n1 = nodes[a], n2 = nodes[b];
            return (
              <line
                key={i}
                x1={n1.cx} y1={n1.cy}
                x2={n2.cx} y2={n2.cy}
                stroke="url(#edgeGrad)"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}
        </g>

        {/* ── Traveling pulse dots along select edges ── */}
        <g filter="url(#glow)">
          {edges.filter((_, i) => i % 3 === 0).map(([a, b], i) => {
            const n1 = nodes[a], n2 = nodes[b];
            const dur = 1.8 + (i % 5) * 0.4;
            const delay = (i * 0.37) % 3;
            return (
              <PulseEdge
                key={i}
                x1={n1.cx} y1={n1.cy}
                x2={n2.cx} y2={n2.cy}
                dur={dur}
                delay={delay}
              />
            );
          })}
        </g>

        {/* ── Nodes ── */}
        <g filter="url(#glow)">
          {nodes.map((n) => {
            const isCore = n.r >= 6;
            return (
              <g key={n.id}>
                {/* Outer pulse ring */}
                <circle
                  cx={n.cx} cy={n.cy}
                  r={n.r + 4}
                  fill="none"
                  stroke="#ff6a00"
                  strokeWidth="1"
                  opacity="0"
                >
                  <animate
                    attributeName="r"
                    values={`${n.r + 2};${n.r + 12};${n.r + 2}`}
                    dur={`${2.5 + n.delay}s`}
                    repeatCount="indefinite"
                    begin={`${n.delay}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur={`${2.5 + n.delay}s`}
                    repeatCount="indefinite"
                    begin={`${n.delay}s`}
                  />
                </circle>

                {/* Node body */}
                <circle
                  cx={n.cx} cy={n.cy} r={n.r}
                  fill={isCore ? "url(#nodeGrad)" : "url(#nodeDim)"}
                  filter={isCore ? "url(#glowStrong)" : "url(#glow)"}
                >
                  <animate
                    attributeName="r"
                    values={`${n.r};${n.r * 1.2};${n.r}`}
                    dur={`${3 + n.delay * 0.5}s`}
                    repeatCount="indefinite"
                    begin={`${n.delay}s`}
                  />
                </circle>

                {/* Highlight specular dot */}
                <circle
                  cx={n.cx - n.r * 0.3}
                  cy={n.cy - n.r * 0.3}
                  r={n.r * 0.3}
                  fill="rgba(255,230,180,0.7)"
                />
              </g>
            );
          })}
        </g>

        {/* ── Floating data labels ── */}
        {[
          { x: 320, y: 120, text: "SYNAPSE", delay: 0 },
          { x: 110, y: 200, text: "CORTEX", delay: 1 },
          { x: 370, y: 350, text: "NEURON", delay: 0.5 },
          { x: 150, y: 380, text: "MEMORY", delay: 1.5 },
        ].map((label, i) => (
          <text
            key={i}
            x={label.x} y={label.y}
            fontSize="8"
            fontFamily="'Inter', monospace"
            fontWeight="700"
            letterSpacing="0.12em"
            fill="#ff8c38"
            opacity="0"
          >
            {label.text}
            <animate
              attributeName="opacity"
              values="0;0.5;0"
              dur="4s"
              repeatCount="indefinite"
              begin={`${label.delay}s`}
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-4; 0,0"
              dur="4s"
              repeatCount="indefinite"
              begin={`${label.delay}s`}
            />
          </text>
        ))}

        {/* ── Scan line effect ── */}
        <rect x="60" y="80" width="410" height="2" fill="#ff6a00" opacity="0">
          <animate attributeName="y" values="80;450;80" dur="5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.12;0" dur="5s" repeatCount="indefinite" />
        </rect>
      </svg>

      {/* Corner HUD decorations */}
      <div className="brain-hud brain-hud-tl">
        <span className="brain-hud-line" />
        <span className="brain-hud-dot" />
      </div>
      <div className="brain-hud brain-hud-tr">
        <span className="brain-hud-dot" />
        <span className="brain-hud-line" />
      </div>
      <div className="brain-hud brain-hud-br">
        <span className="brain-hud-line brain-hud-line-vert" />
        <span className="brain-hud-dot" />
      </div>

      {/* Status label */}
      <div className="brain-status">
        <span className="brain-status-dot" />
        NEURAL MAPPING ACTIVE
      </div>
    </div>
  );
}
