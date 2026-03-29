import React, { useRef, useState, useEffect } from "react";
import "./StudentCharacter.css";

export default function StudentCharacter() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const tick = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.06;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.06;
      setPos({ x: currentRef.current.x, y: currentRef.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onMove = (e) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    targetRef.current = {
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    };
  };

  const t = (sx, sy) => ({
    transform: `translate(${pos.x * sx}px, ${pos.y * (sy ?? sx)}px)`,
    willChange: "transform",
  });

  const tilt = {
    transform: `perspective(1000px) rotateX(${-pos.y * 5}deg) rotateY(${pos.x * 5}deg)`,
    transition: "transform 0.1s ease-out",
  };

  return (
    <div
      ref={containerRef}
      className="sc-wrap"
      onMouseMove={onMove}
      onMouseLeave={() => { targetRef.current = { x: 0, y: 0 }; }}
    >
      <div className="sc-inner" style={tilt}>
        <svg viewBox="0 0 480 560" className="sc-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* ── Skin ── */}
            <radialGradient id="skin" cx="42%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#FFE9D0" />
              <stop offset="55%" stopColor="#FFCFA0" />
              <stop offset="100%" stopColor="#FFBA80" />
            </radialGradient>
            <radialGradient id="skinShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB870" stopOpacity="0" />
              <stop offset="100%" stopColor="#E8904A" stopOpacity="0.3" />
            </radialGradient>

            {/* ── Iris ── */}
            <radialGradient id="iris" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#FF9A3C" />
              <stop offset="45%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#8B2E00" />
            </radialGradient>
            <radialGradient id="iris2" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#FF9A3C" />
              <stop offset="45%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#8B2E00" />
            </radialGradient>

            {/* ── Hair ── */}
            <radialGradient id="hair" cx="45%" cy="20%" r="80%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#111111" />
            </radialGradient>
            <radialGradient id="hairShine" cx="35%" cy="15%" r="55%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* ── Hoodie ── */}
            <linearGradient id="hoodie" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1e1e" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
            <linearGradient id="hoodieShine" x1="20%" y1="0%" x2="60%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* ── Backpack ── */}
            <linearGradient id="bag" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8830" />
              <stop offset="100%" stopColor="#CC4400" />
            </linearGradient>

            {/* ── Glow / shadow ── */}
            <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow3" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="9" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="drop" x="-20%" y="-10%" width="140%" height="150%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000" floodOpacity="0.45"/>
            </filter>
            <filter id="blush">
              <feGaussianBlur stdDeviation="7"/>
            </filter>
          </defs>

          {/* ═══════════════════════════════
              LAYER 1 — far background
          ═══════════════════════════════ */}
          <g style={t(-15, -11)}>
            {/* Floating sparkles */}
            {[{x:52,y:90},{x:418,y:105},{x:60,y:415},{x:428,y:390}].map((p,i)=>(
              <g key={i} transform={`translate(${p.x},${p.y})`}>
                <polygon points="0,-9 2.5,-3 9,-3 4,2 6,9 0,5 -6,9 -4,2 -9,-3 -2.5,-3"
                  fill="#ff6a00" opacity="0.35">
                  <animateTransform attributeName="transform" type="rotate"
                    values={`0;360`} dur={`${5+i*2}s`} repeatCount="indefinite"/>
                </polygon>
              </g>
            ))}
            {/* Formula hints */}
            <text x="36" y="108" fontSize="12" fontFamily="monospace" fill="#ff6a00" opacity="0.16" letterSpacing="2">∑ f(x)</text>
            <text x="376" y="170" fontSize="11" fontFamily="monospace" fill="#ffb347" opacity="0.14">E=mc²</text>
            <text x="48" y="440" fontSize="11" fontFamily="monospace" fill="#ff6a00" opacity="0.13">∫ dx</text>
          </g>

          {/* ═══════════════════════════════
              LAYER 2 — floating accessories
          ═══════════════════════════════ */}
          <g style={t(-8, -6)}>
            {/* Graduation cap */}
            <g transform="translate(368,82)">
              <rect x="-28" y="0" width="56" height="9" rx="3" fill="#1a1a1a"/>
              <rect x="-18" y="-22" width="36" height="22" rx="4" fill="#111"/>
              <line x1="28" y1="5" x2="42" y2="24" stroke="#ff6a00" strokeWidth="2.5"/>
              <circle cx="42" cy="27" r="5" fill="#ff6a00" filter="url(#softGlow)">
                <animate attributeName="r" values="5;6.5;5" dur="3s" repeatCount="indefinite"/>
              </circle>
            </g>
            {/* Stars */}
            <circle cx="76" cy="188" r="3" fill="#ff6a00" opacity="0.4" filter="url(#softGlow)">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="410" cy="320" r="2.5" fill="#ffb347" opacity="0.35" filter="url(#softGlow)">
              <animate attributeName="opacity" values="0.35;0.7;0.35" dur="3.5s" repeatCount="indefinite"/>
            </circle>
          </g>

          {/* ═══════════════════════════════
              LAYER 3 — MAIN CHARACTER
          ═══════════════════════════════ */}
          <g style={t(2, 2)} filter="url(#drop)">

            {/* ── BACKPACK (behind body) ── */}
            <g transform="translate(-6, 0)">
              <rect x="148" y="222" width="74" height="106" rx="14" fill="url(#bag)"/>
              {/* Highlight */}
              <rect x="156" y="230" width="28" height="56" rx="8" fill="rgba(255,255,255,0.12)"/>
              {/* Front pocket */}
              <rect x="156" y="272" width="58" height="44" rx="10" fill="#bb3c00"/>
              <rect x="165" y="280" width="40" height="2" rx="1" fill="rgba(255,255,255,0.18)"/>
              <rect x="165" y="287" width="30" height="2" rx="1" fill="rgba(255,255,255,0.12)"/>
              {/* Zipper line */}
              <path d="M156,272 L214,272" stroke="#ff9040" strokeWidth="1.5" strokeDasharray="3,2.5"/>
              {/* Straps */}
              <path d="M174,220 Q165,246 168,296" stroke="#aa3600" strokeWidth="12" strokeLinecap="round" fill="none"/>
              <path d="M200,218 Q194,246 196,296" stroke="#aa3600" strokeWidth="12" strokeLinecap="round" fill="none"/>
              <path d="M174,221 Q187,210 200,221" stroke="#cc4c00" strokeWidth="8" fill="none" strokeLinecap="round"/>
              {/* Keychain tag */}
              <rect x="160" y="323" width="18" height="12" rx="4" fill="#ff6a00" opacity="0.85"/>
              <text x="169" y="332" textAnchor="middle" fontSize="7" fontWeight="900" fill="white" fontFamily="'Inter',sans-serif">AI</text>
            </g>

            {/* ── BODY / HOODIE ── */}
            {/* Main torso */}
            <path d="M188,214 Q168,228 162,260 L154,358 Q153,376 174,380 L322,380 Q343,376 342,358 L334,260 Q328,228 308,214 Q284,232 240,232 Q200,232 188,214Z"
              fill="url(#hoodie)"/>
            {/* Hoodie shine */}
            <path d="M188,214 Q168,228 162,260 L154,358 Q153,376 174,380 L322,380 Q343,376 342,358 L334,260 Q328,228 308,214 Q284,232 240,232 Q200,232 188,214Z"
              fill="url(#hoodieShine)"/>
            {/* Shoulder seams */}
            <path d="M188,214 Q166,220 162,236" stroke="#ff6a00" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7"/>
            <path d="M308,214 Q330,220 334,236" stroke="#ff6a00" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7"/>
            {/* Hood at neck */}
            <path d="M204,218 Q240,208 282,218 Q268,236 240,240 Q212,236 204,218Z" fill="#181818"/>
            {/* Center seam */}
            <line x1="240" y1="242" x2="240" y2="380" stroke="#1d1d1d" strokeWidth="1.5" opacity="0.6"/>
            {/* Kangaroo pocket */}
            <path d="M208,305 Q240,296 272,305 Q274,342 240,348 Q206,342 208,305Z"
              fill="#161616" stroke="#ff6a00" strokeWidth="1.5" strokeOpacity="0.4"/>
            {/* Orange accent lines on sleeves */}
            <path d="M160,340 L155,356" stroke="#ff6a00" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
            <path d="M320,340 L325,356" stroke="#ff6a00" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>

            {/* ── ARMS ── */}
            {/* Left arm */}
            <path d="M166,248 Q136,282 132,320 Q129,340 144,350"
              stroke="#141414" strokeWidth="40" strokeLinecap="round" fill="none"/>
            <path d="M166,248 Q136,282 132,320 Q129,340 144,350"
              stroke="#1b1b1b" strokeWidth="32" strokeLinecap="round" fill="none"/>
            {/* Left cuff orange ring */}
            <circle cx="144" cy="352" r="20" fill="#1a1a1a" stroke="#ff6a00" strokeWidth="2" strokeOpacity="0.5"/>
            {/* Left hand */}
            <circle cx="144" cy="352" r="18" fill="url(#skin)"/>

            {/* Right arm */}
            <path d="M314,248 Q344,282 348,320 Q351,340 336,350"
              stroke="#141414" strokeWidth="40" strokeLinecap="round" fill="none"/>
            <path d="M314,248 Q344,282 348,320 Q351,340 336,350"
              stroke="#1b1b1b" strokeWidth="32" strokeLinecap="round" fill="none"/>
            <circle cx="336" cy="352" r="20" fill="#1a1a1a" stroke="#ff6a00" strokeWidth="2" strokeOpacity="0.5"/>
            <circle cx="336" cy="352" r="18" fill="url(#skin)"/>

            {/* ── HEAD ── */}
            {/* Head base */}
            <ellipse cx="240" cy="142" rx="82" ry="88" fill="url(#skin)"/>
            {/* Chin shadow */}
            <ellipse cx="240" cy="220" rx="58" ry="18" fill="url(#skinShadow)"/>

            {/* ── HAIR ── */}
            {/* Main hair mass */}
            <path d="M158,145 Q155,72 240,62 Q325,72 322,145 Q315,95 240,88 Q165,95 158,145Z"
              fill="url(#hair)"/>
            {/* Side hair left */}
            <ellipse cx="160" cy="168" rx="16" ry="32" fill="url(#hair)"/>
            {/* Side hair right */}
            <ellipse cx="320" cy="168" rx="16" ry="32" fill="url(#hair)"/>
            {/* Front tuft */}
            <path d="M200,72 Q240,52 255,76 Q245,68 230,78Z" fill="url(#hair)"/>
            <ellipse cx="240" cy="68" rx="20" ry="12" fill="url(#hair)"/>
            {/* Hair highlight */}
            <ellipse cx="216" cy="82" rx="38" ry="22" fill="url(#hairShine)"/>

            {/* ── HEADPHONES (Apple style, over hair) ── */}
            {/* left cup */}
            <ellipse cx="160" cy="152" rx="22" ry="26" fill="#101010"/>
            <ellipse cx="160" cy="152" rx="16" ry="20" fill="#ff6a00"/>
            <ellipse cx="160" cy="152" rx="9" ry="12" fill="#e05500"/>
            <ellipse cx="156" cy="148" rx="3" ry="4" fill="rgba(255,255,255,0.25)"/>
            {/* right cup */}
            <ellipse cx="320" cy="152" rx="22" ry="26" fill="#101010"/>
            <ellipse cx="320" cy="152" rx="16" ry="20" fill="#ff6a00"/>
            <ellipse cx="320" cy="152" rx="9" ry="12" fill="#e05500"/>
            <ellipse cx="316" cy="148" rx="3" ry="4" fill="rgba(255,255,255,0.25)"/>
            {/* Headband */}
            <path d="M160,126 Q240,55 320,126" stroke="#0d0d0d" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <path d="M160,126 Q240,55 320,126" stroke="#1a1a1a" strokeWidth="10" fill="none" strokeLinecap="round"/>
            {/* Orange highlight strip on headband */}
            <path d="M200,82 Q240,65 280,82" stroke="#ff6a00" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.55"/>

            {/* ── EYES (Apple anime style) ── */}
            {/* Left eye white */}
            <ellipse cx="210" cy="150" rx="24" ry="27" fill="white"/>
            {/* Left upper eyelid shadow */}
            <path d="M186,140 Q210,128 234,140 Q234,148 210,148 Q186,148 186,140Z"
              fill="rgba(200,160,100,0.18)"/>
            {/* Left iris */}
            <ellipse cx="210" cy="155" rx="16" ry="17" fill="url(#iris)"/>
            {/* Left pupil */}
            <ellipse cx="210" cy="157" rx="9" ry="10" fill="#0d0d0d"/>
            {/* Left eye main highlight */}
            <ellipse cx="204" cy="150" rx="5.5" ry="6" fill="white" opacity="0.95"/>
            {/* Left mini highlights */}
            <circle cx="216" cy="162" r="2.5" fill="white" opacity="0.6"/>
            <circle cx="203" cy="164" r="1.5" fill="rgba(255,200,100,0.5)"/>
            {/* Left upper eyelash line */}
            <path d="M186,140 Q210,127 234,140" stroke="#111" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            {/* Left lower lash */}
            <path d="M188,162 Q210,172 232,162" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>

            {/* Right eye white */}
            <ellipse cx="270" cy="150" rx="24" ry="27" fill="white"/>
            {/* Right upper eyelid shadow */}
            <path d="M246,140 Q270,128 294,140 Q294,148 270,148 Q246,148 246,140Z"
              fill="rgba(200,160,100,0.18)"/>
            {/* Right iris */}
            <ellipse cx="270" cy="155" rx="16" ry="17" fill="url(#iris2)"/>
            {/* Right pupil */}
            <ellipse cx="270" cy="157" rx="9" ry="10" fill="#0d0d0d"/>
            {/* Right eye main highlight */}
            <ellipse cx="264" cy="150" rx="5.5" ry="6" fill="white" opacity="0.95"/>
            <circle cx="276" cy="162" r="2.5" fill="white" opacity="0.6"/>
            <circle cx="263" cy="164" r="1.5" fill="rgba(255,200,100,0.5)"/>
            {/* Right upper lash */}
            <path d="M246,140 Q270,127 294,140" stroke="#111" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M248,162 Q270,172 292,162" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>

            {/* ── EYEBROWS ── */}
            <path d="M184,122 Q210,112 236,120" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none"/>
            <path d="M244,120 Q270,112 296,122" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none"/>

            {/* ── NOSE ── */}
            <path d="M235,170 Q231,184 240,188 Q249,184 245,170"
              stroke="#D4936A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

            {/* ── MOUTH ── */}
            <path d="M218,200 Q240,218 262,200"
              stroke="#C47050" strokeWidth="4" fill="none" strokeLinecap="round"/>
            {/* Lip gloss */}
            <path d="M224,200 Q240,208 256,200"
              stroke="rgba(255,180,130,0.35)" strokeWidth="6" fill="none" strokeLinecap="round"/>

            {/* ── BLUSH ── */}
            <ellipse cx="192" cy="180" rx="22" ry="13" fill="rgba(255,110,60,0.18)" filter="url(#blush)"/>
            <ellipse cx="288" cy="180" rx="22" ry="13" fill="rgba(255,110,60,0.18)" filter="url(#blush)"/>

            {/* ── LEGS / PANTS ── */}
            <rect x="200" y="373" width="46" height="100" rx="16" fill="#141414"/>
            <rect x="252" y="373" width="46" height="100" rx="16" fill="#141414"/>
            {/* Knee highlights */}
            <ellipse cx="223" cy="424" rx="19" ry="12" fill="#1d1d1d"/>
            <ellipse cx="275" cy="424" rx="19" ry="12" fill="#1d1d1d"/>

            {/* ── SHOES (clean chunky style) ── */}
            <rect x="188" y="462" width="72" height="28" rx="14" fill="#111"/>
            <rect x="184" y="456" width="60" height="20" rx="10" fill="#1c1c1c"/>
            <path d="M188,478 Q224,490 260,478" stroke="#ff6a00" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>

            <rect x="240" y="462" width="72" height="28" rx="14" fill="#111"/>
            <rect x="244" y="456" width="60" height="20" rx="10" fill="#1c1c1c"/>
            <path d="M240,478 Q276,490 312,478" stroke="#ff6a00" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
          </g>

          {/* ═══════════════════════════════
              LAYER 4 — near (book + pencil)
          ═══════════════════════════════ */}
          <g style={t(10, 8)}>
            {/* Book */}
            <g transform="translate(76,294) rotate(-18)">
              <rect x="0" y="0" width="72" height="90" rx="7" fill="#f5f5f5"/>
              <rect x="4" y="0" width="66" height="90" rx="6" fill="white"/>
              <rect x="-5" y="0" width="17" height="90" rx="5" fill="#ff6a00"/>
              <line x1="20" y1="16" x2="62" y2="16" stroke="#e0e0e0" strokeWidth="1.5"/>
              <line x1="20" y1="25" x2="58" y2="25" stroke="#e0e0e0" strokeWidth="1.5"/>
              <line x1="20" y1="34" x2="62" y2="34" stroke="#e0e0e0" strokeWidth="1.5"/>
              <line x1="20" y1="43" x2="52" y2="43" stroke="#e0e0e0" strokeWidth="1.5"/>
              <text x="22" y="72" fontSize="22" fontFamily="'Inter',sans-serif" fontWeight="900" fill="#ff6a00">A+</text>
            </g>
            {/* Pencil */}
            <g transform="translate(358,308) rotate(30)">
              <rect x="-5" y="0" width="10" height="60" rx="2.5" fill="#ffb347"/>
              <rect x="-5" y="0" width="10" height="8" rx="2.5" fill="#ff6a00"/>
              <polygon points="-5,60 5,60 0,76" fill="#FFCFA0"/>
              <rect x="-4" y="51" width="8" height="9" rx="1" fill="#d0d0d0"/>
            </g>
          </g>

          {/* ═══════════════════════════════
              LAYER 5 — front (A+ badge, Wi-Fi)
          ═══════════════════════════════ */}
          <g style={t(16, 13)}>
            {/* Grade badge */}
            <circle cx="392" cy="158" r="26" fill="#ff6a00" filter="url(#glow3)">
              <animate attributeName="r" values="26;28;26" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="392" cy="158" r="20" fill="#ff7a15"/>
            <text x="392" y="164" textAnchor="middle" fontSize="15" fontWeight="900" fill="white" fontFamily="'Inter',sans-serif">A+</text>

            {/* Wi-Fi icon */}
            <g transform="translate(78,200)" opacity="0.55">
              <path d="M0,24 Q22,4 44,24" stroke="#ff6a00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <path d="M8,33 Q22,17 36,33" stroke="#ff6a00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <circle cx="22" cy="40" r="3.5" fill="#ff6a00"/>
            </g>
          </g>

          {/* Ground ellipse shadow */}
          <ellipse cx="240" cy="516" rx="128" ry="16" fill="rgba(0,0,0,0.4)"/>
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="sc-ambient" style={t(-5, -4)} />

      {/* HUD corners */}
      <div className="sc-hud sc-hud-tl" /><div className="sc-hud sc-hud-tr" />
      <div className="sc-hud sc-hud-br" /><div className="sc-hud sc-hud-bl" />

      {/* Status */}
      <div className="sc-status">
        <span className="sc-status-dot" />
        STUDENT AI COMPANION
      </div>
    </div>
  );
}
