import React, { useRef, useState, useEffect } from "react";
import "./ConceptOrbit.css";

const CX = 250, CY = 235;

// Three orbital rings, each tilted differently to fake 3D
const RINGS = [
  { n: 4, R: 148, tilt: 18, speed: 0.32,  nodeR: 11, color: "#ff6a00",  labels: ["DSA","OS","DBMS","ML"] },
  { n: 3, R: 130, tilt: 70, speed: -0.24, nodeR: 9,  color: "#ffb347",  labels: ["Physics","Calculus","Networks"] },
  { n: 3, R: 112, tilt: 44, speed: 0.48,  nodeR: 8,  color: "#ff8c38",  labels: ["AI","Algebra","Chemistry"] },
];

function calcNodes(time) {
  const all = [];
  RINGS.forEach((ring, ri) => {
    const tiltRad = (ring.tilt * Math.PI) / 180;
    for (let i = 0; i < ring.n; i++) {
      const base = (2 * Math.PI * i) / ring.n;
      const t = base + time * ring.speed;
      const x = CX + ring.R * Math.cos(t);
      const y = CY + ring.R * Math.sin(tiltRad) * Math.sin(t);
      const z = Math.cos(t); // -1=back, +1=front
      const scale   = 0.55 + 0.45 * (z + 1) / 2;
      const opacity = 0.35 + 0.65 * (z + 1) / 2;
      all.push({ x, y, z, scale, opacity, label: ring.labels[i], color: ring.color, R: ring.nodeR });
    }
  });
  all.sort((a, b) => a.z - b.z); // back → front
  return all;
}

export default function ConceptOrbit() {
  const wrapRef   = useRef(null);
  const rafRef    = useRef(null);
  const mTarget   = useRef({ x: 0, y: 0 });
  const mCurrent  = useRef({ x: 0, y: 0 });
  const startTime = useRef(Date.now());
  const [state, setState] = useState({ nodes: calcNodes(0), mouse: { x: 0, y: 0 } });

  useEffect(() => {
    const tick = () => {
      mCurrent.current.x += (mTarget.current.x - mCurrent.current.x) * 0.06;
      mCurrent.current.y += (mTarget.current.y - mCurrent.current.y) * 0.06;
      const t = (Date.now() - startTime.current) / 1000;
      setState({ nodes: calcNodes(t), mouse: { ...mCurrent.current } });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onMove = (e) => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    mTarget.current = {
      x: ((e.clientX - r.left)  / r.width  - 0.5) * 2,
      y: ((e.clientY - r.top)   / r.height - 0.5) * 2,
    };
  };

  const { nodes, mouse } = state;

  const tilt = {
    transform: `perspective(900px) rotateX(${-mouse.y * 9}deg) rotateY(${mouse.x * 9}deg)`,
    transition: "transform 0.1s ease-out",
  };

  return (
    <div ref={wrapRef} className="co-wrap" onMouseMove={onMove}
      onMouseLeave={() => { mTarget.current = { x: 0, y: 0 }; }}>

      <div className="co-inner" style={tilt}>
        <svg viewBox="0 0 500 470" className="co-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="coreBg" cx="35%" cy="30%" r="70%">
              <stop offset="0%"   stopColor="#ffb347"/>
              <stop offset="50%"  stopColor="#ff6a00"/>
              <stop offset="100%" stopColor="#7a2800"/>
            </radialGradient>
            <radialGradient id="nodeGrd" cx="33%" cy="28%" r="72%">
              <stop offset="0%"   stopColor="#ff9848"/>
              <stop offset="100%" stopColor="#bb3c00"/>
            </radialGradient>
            <radialGradient id="sceneBg" cx="50%" cy="50%" r="52%">
              <stop offset="0%"   stopColor="rgba(255,106,0,0.07)"/>
              <stop offset="100%" stopColor="transparent"/>
            </radialGradient>
            <filter id="bigGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="10" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="nGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="tGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2"/>
            </filter>
          </defs>

          {/* Scene ambient glow */}
          <circle cx={CX} cy={CY} r="195" fill="url(#sceneBg)"/>

          {/* Faint dot grid */}
          {[...Array(25)].map((_, i) => (
            <circle key={i} cx={40 + (i % 5) * 100} cy={30 + Math.floor(i / 5) * 85}
              r="1.3" fill="#ff6a00" opacity="0.055"/>
          ))}

          {/* Ring guide tracks */}
          {RINGS.map((ring, ri) => {
            const ry = ring.R * Math.sin((ring.tilt * Math.PI) / 180);
            return (
              <ellipse key={ri} cx={CX} cy={CY} rx={ring.R} ry={ry}
                fill="none" stroke={ring.color} strokeWidth="0.7"
                strokeDasharray="5,7" opacity="0.16"/>
            );
          })}

          {/* Connection lines – center → each node */}
          {nodes.map((n, i) => (
            <line key={`l${i}`} x1={CX} y1={CY} x2={n.x} y2={n.y}
              stroke={n.color} strokeWidth="0.7" opacity={n.opacity * 0.35}/>
          ))}

          {/* Depth-sorted nodes */}
          {nodes.map((n, i) => {
            const r = n.R * n.scale;
            return (
              <g key={`n${i}`}>
                {/* Halo */}
                <circle cx={n.x} cy={n.y} r={r + 9}
                  fill={n.color} opacity={n.opacity * 0.1}/>
                {/* Body */}
                <circle cx={n.x} cy={n.y} r={r}
                  fill="url(#nodeGrd)" opacity={n.opacity} filter="url(#nGlow)"/>
                {/* Specular dot */}
                <circle cx={n.x - r*0.3} cy={n.y - r*0.32} r={r*0.28}
                  fill="rgba(255,225,170,0.65)" opacity={n.opacity}/>
                {/* Label – show only when node is in front half */}
                {n.z > -0.15 && (
                  <>
                    {/* Shadow text for readability */}
                    <text x={n.x} y={n.y - r - 6} textAnchor="middle"
                      fontSize="8.5" fontWeight="700"
                      fontFamily="'Inter', monospace" letterSpacing="0.09em"
                      fill="#000" opacity={n.opacity * 0.5}
                      style={{filter:"blur(3px)"}}>
                      {n.label}
                    </text>
                    <text x={n.x} y={n.y - r - 6} textAnchor="middle"
                      fontSize="8.5" fontWeight="700"
                      fontFamily="'Inter', monospace" letterSpacing="0.09em"
                      fill={n.color} opacity={n.opacity * 0.95}>
                      {n.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* ── CENTRAL CORE ── */}
          {/* Outer pulse ring 1 */}
          <circle cx={CX} cy={CY} r="44" fill="rgba(255,106,0,0.07)">
            <animate attributeName="r"       values="44;64;44" dur="3.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3.2s" repeatCount="indefinite"/>
          </circle>
          {/* Outer pulse ring 2 */}
          <circle cx={CX} cy={CY} r="35" fill="rgba(255,140,56,0.1)">
            <animate attributeName="r"       values="35;50;35" dur="3.2s" begin="0.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3.2s" begin="0.6s" repeatCount="indefinite"/>
          </circle>
          {/* Core sphere */}
          <circle cx={CX} cy={CY} r="32" fill="url(#coreBg)" filter="url(#bigGlow)"/>
          {/* Core inner highlight */}
          <circle cx={CX-12} cy={CY-12} r="11" fill="rgba(255,230,150,0.32)"/>
          {/* Core tiny grid lines */}
          <line x1={CX-20} y1={CY} x2={CX+20} y2={CY} stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          <line x1={CX} y1={CY-20} x2={CX} y2={CY+20} stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
          {/* Core label */}
          <text x={CX} y={CY-6} textAnchor="middle"
            fontSize="7.5" fontWeight="900"
            fontFamily="'Inter', monospace" letterSpacing="0.12em" fill="white" opacity="0.95">
            ROOT
          </text>
          <text x={CX} y={CY+6} textAnchor="middle"
            fontSize="7.5" fontWeight="900"
            fontFamily="'Inter', monospace" letterSpacing="0.12em" fill="rgba(255,255,255,0.72)">
            CAUSE
          </text>

          {/* ── Traveling data pulses along 4 spokes ── */}
          {[[CX,CY,CX+148,CY+46],[CX,CY,CX-130,CY+55],[CX,CY,CX+112,CY-50],[CX,CY,CX-148,CY-46]].map(([x1,y1,x2,y2],i)=>(
            <circle key={`p${i}`} r="2.5" fill="#ff8c38" opacity="0.85">
              <animateMotion dur={`${1.8+i*0.4}s`} repeatCount="indefinite" begin={`${i*0.5}s`}
                path={`M${x1},${y1} L${x2},${y2}`}/>
              <animate attributeName="opacity" values="0;1;0" dur={`${1.8+i*0.4}s`}
                repeatCount="indefinite" begin={`${i*0.5}s`}/>
            </circle>
          ))}

          {/* Scan sweep line */}
          <rect x="55" y="30" width="2" height="410" fill="#ff6a00" opacity="0">
            <animate attributeName="x"       values="55;445;55"   dur="5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0.07;0"    dur="5s" repeatCount="indefinite"/>
          </rect>

          {/* Bottom status text */}
          <text x={CX} y="452" textAnchor="middle"
            fontSize="8.5" fontWeight="700"
            fontFamily="'Inter', monospace" letterSpacing="0.2em"
            fill="#ff6a00" opacity="0.38">
            CONCEPT DEPENDENCY ANALYSIS
            <animate attributeName="opacity" values="0.38;0.65;0.38" dur="3s" repeatCount="indefinite"/>
          </text>

          {/* Corner HUD tick marks */}
          {[[60,45],[440,45],[60,420],[440,420]].map(([x,y],i)=>(
            <g key={`h${i}`}>
              <line x1={x-(i%2===0?8:0)} y1={y} x2={x+(i%2===0?0:8)} y2={y}
                stroke="#ff6a00" strokeWidth="1.5" opacity="0.4"/>
              <line x1={x} y1={y-(i<2?8:0)} x2={x} y2={y+(i<2?0:8)}
                stroke="#ff6a00" strokeWidth="1.5" opacity="0.4"/>
            </g>
          ))}
        </svg>
      </div>

      {/* Ambient glow orb */}
      <div className="co-ambient"/>

      {/* Status pill */}
      <div className="co-status">
        <span className="co-dot"/>
        CONCEPT GRAPH ACTIVE
      </div>
    </div>
  );
}
