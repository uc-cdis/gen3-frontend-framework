import React, { useMemo, useRef, useState, useCallback } from 'react';
import { formatDataForGraph } from './graphViewDataUtils';
import { DataDictionary } from './types';

interface GraphViewType {
  categories: string;
  dictionary: DataDictionary;
  selectedId: string;
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  administrative: '#9b51e0',
  biospecimen: '#27AE60',
  clinical: '#FF7F15',
  data_file: '#7EC500',
  index_file: '#26D9B1',
  notation: '#e05252',
  data_observations: '#26D9B1',
  medical_history: '#3283c8',
  case: '#9b51e0',
  experiment: '#FF7F15',
  analysis: '#26D9B1',
};
const DEFAULT_NODE_COLOR = '#9b51e0';
const REQUIRED_EDGE_COLOR = '#e98b2d';
const OPTIONAL_EDGE_COLOR = '#555555';
const NODE_RADIUS = 8;
const CHAR_WIDTH = 7.5;
const LABEL_PAD = 10;
// Vertical gap between stacked terminal points on the same parent
const TERM_STEP = 7;
const INITIAL_SCALE = 0.85;
const INITIAL_TRANSLATE = { x: 80, y: 60 };

  //TODO list
  //position labels
  //line strait up and down
  //positioning of nodes
  //positioning of lines
  //icones
  //icon images
  //line color
  //lines that curve back in last row
  //hover upstreem only emphasis

const GraphView = ({ dictionary }: GraphViewType) => {
  const dataAndLinks = useMemo(
    () => formatDataForGraph(dictionary),
    [dictionary],
  );

  const [scale, setScale] = useState(INITIAL_SCALE);
  const [translate, setTranslate] = useState(INITIAL_TRANSLATE);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const realNodes = useMemo(
    () => dataAndLinks.data.filter((n) => n.category && n.name),
    [dataAndLinks.data],
  );

  const posMap = useMemo(
    () =>
      Object.fromEntries(
        dataAndLinks.data.map((n) => [
          n.id,
          { x: n.x, y: n.y, name: n.name, category: n.category },
        ]),
      ),
    [dataAndLinks.data],
  );

  const parentTerminalX = useCallback(
    (tgtId: string) => {
      const tgt = posMap[tgtId];
      if (!tgt) return 0;
      return (
        tgt.x +
        NODE_RADIUS +
        6 +
        (tgt.name?.length ?? 0) * CHAR_WIDTH +
        LABEL_PAD
      );
    },
    [posMap],
  );

  // For each edge, compute a terminal y near the parent.
  // All siblings of the SAME category share one termY (their markers overlap
  // into a single point). Different categories get distinct termY offsets,
  // centred around parentY with TERM_STEP spacing.
  const terminalYMap = useMemo(() => {
    const byTarget: Record<string, string[]> = {};
    dataAndLinks.rawEdges?.forEach((e) => {
      (byTarget[e.target] ??= []).push(e.source);
    });
    const result: Record<string, number> = {};
    Object.entries(byTarget).forEach(([tgtId, srcIds]) => {
      const tgt = posMap[tgtId];
      if (!tgt) return;
      // Collect unique categories, sorted alphabetically for a stable order
      const cats = [
        ...new Set(srcIds.map((id) => posMap[id]?.category ?? '')),
      ].sort();
      const n = cats.length;
      srcIds.forEach((srcId) => {
        const cat = posMap[srcId]?.category ?? '';
        const catIdx = cats.indexOf(cat);
        result[`${srcId}=>${tgtId}`] =
          tgt.y + (catIdx - (n - 1) / 2) * TERM_STEP;
      });
    });
    return result;
  }, [dataAndLinks.rawEdges, posMap]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsPanning(true);
      panStart.current = {
        x: e.clientX - translate.x,
        y: e.clientY - translate.y,
      };
      e.preventDefault();
    },
    [translate],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setTranslate({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    },
    [isPanning],
  );

  const stopPanning = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.max(0.2, Math.min(3, s * (1 - e.deltaY * 0.001))));
  }, []);

  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.2, +(s - 0.1).toFixed(2)));
  const reset = () => {
    setScale(INITIAL_SCALE);
    setTranslate(INITIAL_TRANSLATE);
  };

  const btnClass =
    'w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 text-gray-600 select-none text-base font-bold shadow-sm';

  return (
    <div
      role="application"
      aria-label="Data dictionary graph view"
      tabIndex={0}
      className="relative w-full h-full min-h-[800px] overflow-hidden bg-base-lighter"
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopPanning}
      onMouseLeave={stopPanning}
      onWheel={handleWheel}
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <button onClick={reset} className={btnClass} title="Reset view">
          ⤢
        </button>
        <button onClick={zoomIn} className={btnClass} title="Zoom in">
          +
        </button>
        <button onClick={zoomOut} className={btnClass} title="Zoom out">
          −
        </button>
      </div>

      <svg
        aria-hidden="true"
        className="w-full h-full"
      >
        <g transform={`translate(${translate.x},${translate.y}) scale(${scale})`}>
          {/* ── Edges ─────────────────────────────────────────────────────────
              Each edge is a 5-segment orthogonal elbow:
                child.x,child.y → H midX → V termY → H termX
              termY is unique per sibling (centred around parentY with TERM_STEP
              spacing), so terminal markers stack visibly instead of overlapping.
              The vertical segments naturally share the same midX channel, forming
              the visual trunk seen in the reference.
          ────────────────────────────────────────────────────────────────── */}
          {dataAndLinks.rawEdges?.map((edge, i) => {
            const src = posMap[edge.source];
            const tgt = posMap[edge.target];
            if (!src || !tgt) return null;

            const termX = parentTerminalX(edge.target);
            const termY =
              terminalYMap[`${edge.source}=>${edge.target}`] ?? tgt.y;
            const color = edge.required ? REQUIRED_EDGE_COLOR : OPTIONAL_EDGE_COLOR;

            const midX = (src.x + termX) / 2;
            const dy = termY - src.y;
            const signY = dy >= 0 ? 1 : -1;
            const r = Math.min(
              10,
              Math.abs(dy) / 2,
              Math.abs(src.x - midX),
              Math.abs(midX - termX),
            );

            const d =
              dy === 0
                ? `M ${src.x},${src.y} H ${termX}`
                : [
                    `M ${src.x},${src.y}`,
                    `H ${midX + r}`,
                    `Q ${midX},${src.y} ${midX},${src.y + signY * r}`,
                    `V ${termY - signY * r}`,
                    `Q ${midX},${termY} ${midX - r},${termY}`,
                    `H ${termX}`,
                  ].join(' ');

            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeOpacity={0.85}
                />
                {/* Dot at child circle */}
                <circle
                  cx={src.x}
                  cy={src.y}
                  r={3}
                  fill={color}
                  opacity={0.85}
                />
                {/* Square marker at staggered terminal point */}
                <rect
                  x={termX - 3}
                  y={termY - 3}
                  width={6}
                  height={6}
                  fill={color}
                  opacity={0.85}
                />
              </g>
            );
          })}

          {/* Nodes rendered on top */}
          {realNodes.map((node) => {
            const color =
              CATEGORY_COLOR_MAP[node.category ?? ''] ?? DEFAULT_NODE_COLOR;
            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <circle
                  r={NODE_RADIUS}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                />
                <text
                  x={NODE_RADIUS + 6}
                  y={4}
                  fontSize={13}
                  fill="#333333"
                  style={{ userSelect: 'none' }}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default GraphView;
