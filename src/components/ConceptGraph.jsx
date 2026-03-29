import React, { useMemo } from "react";
import "./ConceptGraph.css";

export default function ConceptGraph({ graphData, conceptScores, rootCause, weakConcepts, learningPath }) {
  const layout = useMemo(() => computeLayout(graphData), [graphData]);
  if (!graphData || graphData.length === 0) return null;

  const svgWidth = layout.width;
  const svgHeight = layout.height;

  function getNodeColor(conceptId) {
    const score = conceptScores?.[conceptId];
    if (score === undefined) return "#4b5563";
    if (score >= 80) return "#30D158";
    if (score >= 50) return "#FF9F0A";
    return "#FF453A";
  }
  function getNodeGlow(conceptId) {
    const score = conceptScores?.[conceptId];
    if (score === undefined) return "none";
    if (score >= 80) return "url(#glow-green)";
    if (score >= 50) return "url(#glow-orange)";
    return "url(#glow-red)";
  }
  const isRootCause = (id) => rootCause?.concept === id;
  const isOnLearningPath = (id) => learningPath?.some(p => p.concept === id);
  const isWeak = (id) => weakConcepts?.includes(id);

  return (
    <div className="cg-container">
      <div className="cg-legend">
        <span className="cg-legend-item"><span className="cg-dot" style={{ background: "#30D158", boxShadow: "0 0 6px #30D158" }} />Strong (≥80%)</span>
        <span className="cg-legend-item"><span className="cg-dot" style={{ background: "#FF9F0A", boxShadow: "0 0 6px #FF9F0A66" }} />Moderate (50–79%)</span>
        <span className="cg-legend-item"><span className="cg-dot" style={{ background: "#FF453A", boxShadow: "0 0 6px #FF453A66" }} />Weak (&lt;50%)</span>
        <span className="cg-legend-item"><span className="cg-dot" style={{ background: "#BF5AF2", boxShadow: "0 0 8px #BF5AF299" }} />Root Cause</span>
      </div>
      <div className="cg-scroll">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="cg-svg">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.1)" />
            </marker>
            <marker id="arrowhead-path" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#BF5AF2" />
            </marker>
            {/* Glow filters */}
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.19  0 0 0 0 0.82  0 0 0 0 0.35  0 0 0 1 0" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 1  0 0 0 0 0.27  0 0 0 0 0.23  0 0 0 1.2 0" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 1  0 0 0 0 0.62  0 0 0 0 0.04  0 0 0 0.8 0" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.75  0 0 0 0 0.35  0 0 0 0 0.95  0 0 0 1.5 0" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {graphData.map(node => node.prerequisites.map(prereqId => {
            const from = layout.positions[prereqId];
            const to = layout.positions[node.id];
            if (!from || !to) return null;
            const isPathEdge = isOnLearningPath(prereqId) && isOnLearningPath(node.id);
            const midY = (from.y + to.y) / 2;
            return (
              <path key={`${prereqId}-${node.id}`}
                d={`M ${from.x} ${from.y + 22} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 22}`}
                fill="none"
                stroke={isPathEdge ? "#BF5AF2" : "rgba(255,255,255,0.07)"}
                strokeWidth={isPathEdge ? 2 : 1.5}
                markerEnd={isPathEdge ? "url(#arrowhead-path)" : "url(#arrowhead)"}
                className={isPathEdge ? "cg-edge-path" : ""}
                strokeDasharray={isPathEdge ? "6 3" : "none"}
              />
            );
          }))}

          {/* Nodes */}
          {graphData.map(node => {
            const pos = layout.positions[node.id];
            if (!pos) return null;
            const color = getNodeColor(node.id);
            const isRoot = isRootCause(node.id);
            const score = conceptScores?.[node.id];
            const filter = isRoot ? "url(#glow-purple)" : getNodeGlow(node.id);

            return (
              <g key={node.id} className="cg-node-group" filter={filter}>
                {/* Pulse ring for root cause */}
                {isRoot && <circle cx={pos.x} cy={pos.y} r="32" fill="none" stroke="#BF5AF2" strokeWidth="1" className="cg-pulse-ring" opacity="0.6" />}
                {/* Weak node outer glow ring */}
                {isWeak(node.id) && !isRoot && (
                  <circle cx={pos.x} cy={pos.y} r="28" fill="none" stroke={color} strokeWidth="1" opacity="0.4" className="cg-pulse-ring" />
                )}
                {/* Main circle */}
                <circle cx={pos.x} cy={pos.y} r="22"
                  fill={isRoot ? "rgba(191,90,242,0.15)" : `${color}15`}
                  stroke={isRoot ? "#BF5AF2" : color}
                  strokeWidth={isWeak(node.id) || isRoot ? 2 : 1.5}
                />
                {/* Score */}
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill={isRoot ? "#BF5AF2" : color} fontSize="11" fontWeight="800" fontFamily="Inter, sans-serif">
                  {score !== undefined ? `${score}%` : "—"}
                </text>
                {/* Label */}
                <text x={pos.x} y={pos.y + 36} textAnchor="middle"
                  fill={isRoot ? "#BF5AF2" : "rgba(255,255,255,0.5)"} fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
                  {node.name.length > 14 ? node.name.slice(0, 13) + "…" : node.name}
                </text>
                {isRoot && (
                  <text x={pos.x} y={pos.y + 48} textAnchor="middle"
                    fill="#BF5AF2" fontSize="8" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
                    ROOT CAUSE
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function computeLayout(graphData) {
  if (!graphData || graphData.length === 0) return { positions: {}, width: 0, height: 0 };
  const layers = {};
  function getLayer(nodeId) {
    if (layers[nodeId] !== undefined) return layers[nodeId];
    const node = graphData.find(n => n.id === nodeId);
    if (!node || node.prerequisites.length === 0) { layers[nodeId] = 0; return 0; }
    const maxPrereqLayer = Math.max(...node.prerequisites.map(p => getLayer(p)));
    layers[nodeId] = maxPrereqLayer + 1;
    return layers[nodeId];
  }
  graphData.forEach(n => getLayer(n.id));
  const layerGroups = {};
  Object.entries(layers).forEach(([id, layer]) => { if (!layerGroups[layer]) layerGroups[layer] = []; layerGroups[layer].push(id); });
  const numLayers = Math.max(...Object.keys(layerGroups).map(Number)) + 1;
  const nodeSpacingX = 140;
  const layerSpacingY = 110;
  const paddingX = 90;
  const paddingY = 70;
  const maxNodesInLayer = Math.max(...Object.values(layerGroups).map(g => g.length));
  const width = Math.max(maxNodesInLayer * nodeSpacingX + paddingX * 2, 420);
  const height = numLayers * layerSpacingY + paddingY * 2;
  const positions = {};
  Object.entries(layerGroups).forEach(([layer, nodes]) => {
    const y = Number(layer) * layerSpacingY + paddingY;
    const totalWidth = (nodes.length - 1) * nodeSpacingX;
    const startX = (width - totalWidth) / 2;
    nodes.forEach((nodeId, i) => { positions[nodeId] = { x: startX + i * nodeSpacingX, y }; });
  });
  return { positions, width, height };
}
