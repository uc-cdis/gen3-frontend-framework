import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActionIcon, Badge, Button, Paper, Text } from '@mantine/core';
import {
  IconBinaryTree2,
  IconBuildingBank,
  IconChartBar,
  IconDna2,
  IconFileDescription,
  IconPlus,
  IconMinus,
  IconReportMedical,
  IconTestPipe2,
  IconZoomReset,
  IconX,
} from '@tabler/icons-react';
import PropertiesTable from './PropertiesTable';
import { createNodesAndEdges, nodesBreadthFirst } from './graphViewDataUtils';
import { DataDictionary } from './types';

interface GraphViewProps {
  dictionary: DataDictionary;
  selectedId: string;
  onStructureChange?: (
    nodes: Array<{ id: string; title: string; category?: string; isActive: boolean }>,
  ) => void;
}

type GraphNode = {
  id: string;
  title?: string;
  category?: string;
  description?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  links?: Array<unknown>;
};

type GraphEdge = {
  source: GraphNode;
  target: GraphNode;
  required?: boolean;
};

type Connector = {
  id: string;
  path: string;
  isRequired: boolean;
};

type PopupPosition = {
  left: number;
  top: number;
};

type CategoryStyle = {
  border: string;
  soft: string;
  badge: string;
  icon: string;
  label: string;
};

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 112;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.85;
const ZOOM_STEP = 0.15;

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  administrative: {
    border: '#a78bfa',
    soft: 'rgba(167, 139, 250, 0.12)',
    badge: '#ede9fe',
    icon: '#8b5cf6',
    label: 'Administrative',
  },
  analysis: {
    border: '#f472b6',
    soft: 'rgba(244, 114, 182, 0.12)',
    badge: '#fce7f3',
    icon: '#ec4899',
    label: 'Analysis',
  },
  clinical: {
    border: '#38bdf8',
    soft: 'rgba(56, 189, 248, 0.12)',
    badge: '#e0f2fe',
    icon: '#0ea5e9',
    label: 'Clinical',
  },
  'experimental-methods': {
    border: '#f97316',
    soft: 'rgba(249, 115, 22, 0.12)',
    badge: '#ffedd5',
    icon: '#ea580c',
    label: 'Experimental Methods',
  },
  'data-file': {
    border: '#0f766e',
    soft: 'rgba(15, 118, 110, 0.14)',
    badge: '#dff7f4',
    icon: '#0f766e',
    label: 'Data File',
  },
  biospecimen: {
    border: '#34d399',
    soft: 'rgba(52, 211, 153, 0.12)',
    badge: '#d1fae5',
    icon: '#10b981',
    label: 'Biospecimen',
  },
  'medical-history': {
    border: '#38bdf8',
    soft: 'rgba(56, 189, 248, 0.12)',
    badge: '#e0f2fe',
    icon: '#0ea5e9',
    label: 'Medical History',
  },
  default: {
    border: '#94a3b8',
    soft: 'rgba(148, 163, 184, 0.12)',
    badge: '#e2e8f0',
    icon: '#64748b',
    label: 'Other',
  },
};

const normalizeCategory = (value?: string) =>
  (value ?? 'default').trim().toLowerCase().replace(/[_\s]+/g, '-');

const getCategoryStyle = (category?: string) =>
  CATEGORY_STYLES[normalizeCategory(category)] ?? CATEGORY_STYLES.default;

const toLabel = (value?: string) => {
  if (!value) return 'Uncategorized';
  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const toGlyph = (category?: string) => {
  const markerClassName = 'h-[14px] w-[14px]';
  const markerByCategory: Record<string, React.ReactNode> = {
    administrative: <IconBuildingBank stroke={2.4} className={markerClassName} />,
    analysis: <IconChartBar stroke={2.4} className={markerClassName} />,
    clinical: <IconPlus stroke={2.8} className={markerClassName} />,
    'experimental-methods': <IconBinaryTree2 stroke={2.4} className={markerClassName} />,
    'data-file': <IconFileDescription stroke={2.4} className={markerClassName} />,
    biospecimen: <IconTestPipe2 stroke={2.4} className={markerClassName} />,
    'medical-history': <IconReportMedical stroke={2.4} className={markerClassName} />,
    default: <IconDna2 stroke={2.4} className={markerClassName} />,
  };

  return markerByCategory[normalizeCategory(category)] ?? markerByCategory.default;
};

const parseSelectedNodeId = (selectedId: string) => {
  if (!selectedId) return '';
  const [, nodeId] = selectedId.split('-');
  return nodeId ?? '';
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getPropertyStats = (node?: GraphNode) => {
  const total = Object.keys(node?.properties ?? {}).length;
  const required = node?.required?.length ?? 0;
  return {
    total,
    required,
    optional: Math.max(total - required, 0),
  };
};

const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatPropertyTypes = (row: Record<string, unknown>) => {
  if (Array.isArray(row.anyOf))
    return row.anyOf
      .map((item) => String((item as { type?: string }).type ?? ''))
      .filter(Boolean);
  if (Array.isArray(row.oneOf))
    return row.oneOf
      .map((item) => String((item as { type?: string }).type ?? ''))
      .filter(Boolean);
  if (Array.isArray(row.enum)) return row.enum.map((item) => String(item));
  return row.type ? [String(row.type)] : [];
};

const buildTsv = (
  properties: Record<string, Record<string, unknown>>,
  required: string[] = [],
) => {
  const rows = Object.entries(properties).map(([property, definition]) => {
    const description = String(
      definition.description ??
        (definition.term as { description?: string } | undefined)?.description ??
        'No Description',
    );
    const types = formatPropertyTypes(definition).join(', ');
    return [property, types, required.includes(property) ? 'Required' : 'No', description]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join('\t');
  });

  return ['Property\tType\tRequired\tDescription', ...rows].join('\n');
};

const GraphView = ({
  dictionary,
  selectedId,
  onStructureChange,
}: GraphViewProps) => {
  const selectedNodeFromTable = parseSelectedNodeId(selectedId);
  const [activeNodeId, setActiveNodeId] = useState(selectedNodeFromTable);
  const [legendOpen, setLegendOpen] = useState(false);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [fitScale, setFitScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const graph = useMemo(() => {
    const { nodes, edges } = createNodesAndEdges({ dictionary }, true, []) as {
      nodes: GraphNode[];
      edges: GraphEdge[];
    };
    const tree = nodesBreadthFirst(nodes as any, edges as any) as {
      treeLevel2Names: string[][];
    };
    const byId = nodes.reduce<Record<string, GraphNode>>((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});

    return {
      byId,
      edges,
      rows: tree.treeLevel2Names.map((row) =>
        row.map((id) => byId[id]).filter((node): node is GraphNode => Boolean(node)),
      ),
    };
  }, [dictionary]);

  const contentScale = clamp(fitScale * zoomLevel, MIN_ZOOM, MAX_ZOOM);
  const focusedNodeId = activeNodeId || selectedNodeFromTable;
  const hasFocusedNode = Boolean(focusedNodeId);
  const activeNode = focusedNodeId ? graph.byId[focusedNodeId] : undefined;
  const activeStats = getPropertyStats(activeNode);

  const categoryLegend = useMemo(() => {
    const seen = new Set<string>();
    return Object.values(graph.byId)
      .map((node) => normalizeCategory(node.category))
      .filter((category) => {
        if (seen.has(category)) return false;
        seen.add(category);
        return true;
      })
      .map((category) => ({
        key: category,
        style: getCategoryStyle(category),
      }));
  }, [graph.byId]);

  const activeNodeStyle = getCategoryStyle(activeNode?.category);
  const activeNodeProperties =
    (activeNode?.properties as Record<string, Record<string, unknown>>) ?? {};
  const activeNodeRequired = activeNode?.required ?? [];
  const activeNodeDescription = activeNode?.description ?? 'No Description';

  const selectedStructure = useMemo(() => {
    if (!activeNode) {
      return {
        nodes: [] as Array<{
          id: string;
          title: string;
          category?: string;
        }>,
        edgeIds: new Set<string>(),
      };
    }

    const parentMap = graph.edges.reduce<
      Record<string, Array<{ parentId: string; edgeId: string }>>
    >((acc, edge) => {
      if (!acc[edge.source.id]) acc[edge.source.id] = [];
      acc[edge.source.id].push({
        parentId: edge.target.id,
        edgeId: `${edge.source.id}-${edge.target.id}`,
      });
      return acc;
    }, {});

    const levelById = graph.rows.reduce<Record<string, number>>((acc, row, rowIndex) => {
      row.forEach((node) => {
        acc[node.id] = rowIndex;
      });
      return acc;
    }, {});

    const upstreamIds = new Set<string>();
    const upstreamEdgeIds = new Set<string>();

    const pickPrimaryParent = (nodeId: string) => {
      const parents = parentMap[nodeId] ?? [];
      if (parents.length === 0) return null;

      const currentLevel = levelById[nodeId] ?? Number.MAX_SAFE_INTEGER;
      const upstreamParents = parents.filter((parent) => {
        const parentLevel = levelById[parent.parentId] ?? Number.MAX_SAFE_INTEGER;
        return parentLevel < currentLevel;
      });
      if (upstreamParents.length === 0) return null;

      const sortedParents = [...upstreamParents].sort((left, right) => {
        const leftLevel = levelById[left.parentId] ?? Number.MAX_SAFE_INTEGER;
        const rightLevel = levelById[right.parentId] ?? Number.MAX_SAFE_INTEGER;

        const leftGap = currentLevel - leftLevel;
        const rightGap = currentLevel - rightLevel;
        if (leftGap !== rightGap) return leftGap - rightGap;

        if (leftLevel !== rightLevel) return leftLevel - rightLevel;

        const leftNode = graph.byId[left.parentId];
        const rightNode = graph.byId[right.parentId];
        return (leftNode?.title ?? left.parentId).localeCompare(
          rightNode?.title ?? right.parentId,
        );
      });

      return sortedParents[0];
    };

    let cursorId: string | null = activeNode.id;
    while (cursorId) {
      upstreamIds.add(cursorId);
      const nextParent = pickPrimaryParent(cursorId);
      if (!nextParent) break;
      upstreamEdgeIds.add(nextParent.edgeId);
      cursorId = nextParent.parentId;
    }

    const nodes = Array.from(upstreamIds)
      .map((id) => graph.byId[id])
      .filter((node): node is GraphNode => Boolean(node))
      .sort((left, right) => {
        const levelDiff = (levelById[left.id] ?? 0) - (levelById[right.id] ?? 0);
        if (levelDiff !== 0) return levelDiff;
        return (left.title ?? left.id).localeCompare(right.title ?? right.id);
      })
      .map((node) => ({
        id: node.id,
        title: node.title ?? node.id,
        category: node.category,
      }));

    return {
      nodes,
      edgeIds: upstreamEdgeIds,
    };
  }, [activeNode, graph.byId, graph.edges, graph.rows]);

  const selectedStructureNodeIds = useMemo(
    () => new Set(selectedStructure.nodes.map((node) => node.id)),
    [selectedStructure],
  );
  const selectedStructureEdgeIds = selectedStructure.edgeIds;

  useEffect(() => {
    if (selectedNodeFromTable) {
      setActiveNodeId(selectedNodeFromTable);
    }
  }, [selectedNodeFromTable]);

  useEffect(() => {
    const viewport = scrollRef.current;
    const layout = layoutRef.current;
    if (!viewport || !layout) return;

    const updateFitScale = () => {
      const nextFit = Math.min(
        1,
        (viewport.clientWidth - 64) / Math.max(layout.scrollWidth, 1),
        (viewport.clientHeight - 64) / Math.max(layout.scrollHeight, 1),
      );
      setFitScale(clamp(nextFit, MIN_ZOOM, 1));
    };

    updateFitScale();

    const resizeObserver = new ResizeObserver(updateFitScale);
    resizeObserver.observe(viewport);
    resizeObserver.observe(layout);
    window.addEventListener('resize', updateFitScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateFitScale);
    };
  }, [graph.rows]);

  useEffect(() => {
    const container = canvasRef.current;
    const layout = layoutRef.current;
    if (!container || !layout) return;

    const updateConnectors = () => {
      const layoutRect = layout.getBoundingClientRect();
      const nextConnectors = graph.edges
        .map((edge) => {
          const sourceElement = cardRefs.current[edge.source.id];
          const targetElement = cardRefs.current[edge.target.id];

          if (!sourceElement || !targetElement) return null;

          const sourceRect = sourceElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const startX =
            (sourceRect.left - layoutRect.left + sourceRect.width / 2) / contentScale;
          const startY = (sourceRect.bottom - layoutRect.top) / contentScale;
          const endX =
            (targetRect.left - layoutRect.left + targetRect.width / 2) / contentScale;
          const endY = (targetRect.top - layoutRect.top) / contentScale;
          const verticalGap = Math.max(endY - startY, 0);
          const controlOffset = Math.max(50, Math.min(160, verticalGap * 0.45));
          const horizontalOffset = Math.max(
            12,
            Math.min(42, Math.abs(endX - startX) * 0.18),
          );
          return {
            id: `${edge.source.id}-${edge.target.id}`,
            isRequired: edge.required !== false,
            path: `M ${startX} ${startY} C ${startX + horizontalOffset} ${startY + controlOffset}, ${endX - horizontalOffset} ${endY - controlOffset}, ${endX} ${endY}`,
          };
        })
        .filter((value): value is Connector => Boolean(value));

      setConnectors(nextConnectors);
    };

    updateConnectors();

    const resizeObserver = new ResizeObserver(updateConnectors);
    resizeObserver.observe(container);
    resizeObserver.observe(layout);
    Object.values(cardRefs.current).forEach((element) => {
      if (element) resizeObserver.observe(element);
    });

    const scrollElement = scrollRef.current;
    scrollElement?.addEventListener('scroll', updateConnectors, { passive: true });
    window.addEventListener('resize', updateConnectors);

    return () => {
      resizeObserver.disconnect();
      scrollElement?.removeEventListener('scroll', updateConnectors);
      window.removeEventListener('resize', updateConnectors);
    };
  }, [contentScale, graph.edges, graph.rows, selectedStructureEdgeIds]);

  useEffect(() => {
    const viewport = scrollRef.current;
    const layout = layoutRef.current;
    const activeCard = activeNodeId ? cardRefs.current[activeNodeId] : null;
    if (!viewport || !layout || !activeCard) {
      setPopupPosition(null);
      return;
    }

    const updatePopupPosition = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const cardRect = activeCard.getBoundingClientRect();
      const left = (cardRect.left - layoutRect.left + cardRect.width / 2) / contentScale;
      const top = (cardRect.bottom - layoutRect.top + 18) / contentScale;
      const maxLeft = (viewportRect.width - 420) / contentScale;

      setPopupPosition({
        left: clamp(left - 170, 16 / contentScale, Math.max(maxLeft, 16 / contentScale)),
        top: clamp(top, 24 / contentScale, (viewportRect.height - 240) / contentScale),
      });
    };

    updatePopupPosition();
    viewport.addEventListener('scroll', updatePopupPosition, { passive: true });
    window.addEventListener('resize', updatePopupPosition);

    return () => {
      viewport.removeEventListener('scroll', updatePopupPosition);
      window.removeEventListener('resize', updatePopupPosition);
    };
  }, [activeNodeId, contentScale]);

  useEffect(() => {
    onStructureChange?.(
      selectedStructure.nodes.map((node) => ({
        id: node.id,
        title: node.title,
        category: node.category,
        isActive: node.id === activeNode?.id,
      })),
    );
  }, [activeNode?.id, onStructureChange, selectedStructure]);

  return (
    <div className="relative h-full overflow-hidden bg-[#f7f8fb]">
      <div className="absolute inset-y-0 left-0 w-[1px] bg-slate-300/70" />
      <div className="absolute left-6 top-6 z-30 flex flex-col gap-3">
        <ActionIcon
          variant="filled"
          color="blue"
          radius="sm"
          size={46}
          onClick={() => setZoomLevel((value) => clamp(value + ZOOM_STEP, 0.6, 3))}
        >
          <IconPlus size={28} />
        </ActionIcon>
        <ActionIcon
          variant="filled"
          color="blue"
          radius="sm"
          size={46}
          onClick={() => setZoomLevel((value) => clamp(value - ZOOM_STEP, 0.6, 3))}
        >
          <IconMinus size={28} />
        </ActionIcon>
        <ActionIcon
          variant="filled"
          color="blue"
          radius="sm"
          size={46}
          onClick={() => setZoomLevel(1)}
        >
          <IconZoomReset size={24} />
        </ActionIcon>
      </div>
      <div className="absolute right-6 top-6 z-40">
        {!legendOpen ? (
          <ActionIcon
            variant="filled"
            color="blue"
            radius="xl"
            size={58}
            onClick={() => setLegendOpen(true)}
            aria-label="Open legend"
          >
            <span className="text-[34px] font-bold leading-none text-white">?</span>
          </ActionIcon>
        ) : (
          <Paper
            radius="md"
            className="w-[360px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              className="absolute right-4 top-4"
              onClick={() => setLegendOpen(false)}
              aria-label="Close legend"
            >
              <IconX size={24} />
            </ActionIcon>
            <div className="space-y-5 pr-8 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-10 bg-[#f28c28]" />
                <span>Required Link</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-10 bg-[#111827]" />
                <span>Optional Link</span>
              </div>
              {categoryLegend.map((entry) => (
                <div key={entry.key} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: entry.style.badge,
                      color: entry.style.icon,
                    }}
                  >
                    {toGlyph(entry.key)}
                  </span>
                  <span>{entry.style.label}</span>
                </div>
              ))}
            </div>
          </Paper>
        )}
      </div>
      <div className="h-full min-h-[860px]">
        <div ref={scrollRef} className="relative h-full overflow-auto">
          <div className="relative px-24 py-10">
            <div
              ref={canvasRef}
              className="relative min-h-[1400px] min-w-[1200px]"
              style={{
                width: layoutRef.current
                  ? layoutRef.current.scrollWidth * contentScale
                  : undefined,
                height: layoutRef.current
                  ? layoutRef.current.scrollHeight * contentScale + 80
                  : undefined,
              }}
            >
              <div
                ref={layoutRef}
                className="absolute left-0 top-0"
                style={{
                  transform: `scale(${contentScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <div className="relative inline-flex flex-col items-center gap-16 pb-20 pr-20">
                  <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                    {connectors.map((connector) => (
                      <path
                        key={connector.id}
                        d={connector.path}
                        fill="none"
                        stroke={connector.isRequired ? '#f28c28' : '#111827'}
                        strokeLinecap="round"
                        strokeWidth={2.2}
                        strokeOpacity={
                          hasFocusedNode
                            ? selectedStructureEdgeIds.has(connector.id)
                              ? 0.9
                              : 0.12
                            : 0.78
                        }
                      />
                    ))}
                  </svg>

                  {popupPosition && activeNode ? (
                    <div
                      className="absolute z-30 w-[340px]"
                      style={{
                        left: popupPosition.left,
                        top: popupPosition.top,
                      }}
                    >
                      <Paper
                        radius="lg"
                        className="relative border border-slate-400 bg-white px-8 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.14)]"
                      >
                        <div
                          className="absolute left-1/2 top-[-11px] h-5 w-5 -translate-x-1/2 rotate-45 border-l border-t border-slate-400 bg-white"
                          aria-hidden="true"
                        />
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          className="absolute right-4 top-4"
                          onClick={() => setActiveNodeId('')}
                        >
                          <IconX size={22} />
                        </ActionIcon>
                        <ul className="space-y-3 pr-10 text-[18px] text-slate-700">
                          <li>{activeStats.required} required properties</li>
                          <li>{activeStats.optional} optional properties</li>
                        </ul>
                        <Button
                          fullWidth
                          radius="md"
                          className="mt-6"
                          style={{ backgroundColor: '#4388c6' }}
                          onClick={() => setPropertiesOpen(true)}
                        >
                          Open properties
                        </Button>
                      </Paper>
                    </div>
                  ) : null}

                  {graph.rows.map((row, rowIndex) => (
                    <div
                      key={`row-${rowIndex}`}
                      className="relative z-10 flex items-center justify-center gap-10"
                    >
                      {row.map((node) => {
                        const isSelected =
                          node.id === activeNodeId || node.id === selectedNodeFromTable;
                        const isHighlighted = selectedStructureNodeIds.has(node.id);
                        const stats = getPropertyStats(node);
                        const style = getCategoryStyle(node.category);

                        return (
                          <button
                            key={node.id}
                            ref={(element) => {
                              cardRefs.current[node.id] = element;
                            }}
                            type="button"
                            onClick={() => setActiveNodeId(node.id)}
                            className="relative rounded-[10px] border-2 bg-white px-5 pb-5 pt-6 text-center shadow-sm transition-transform hover:-translate-y-0.5"
                            style={{
                              minHeight: DEFAULT_NODE_HEIGHT,
                              width: DEFAULT_NODE_WIDTH,
                              borderColor: style.border,
                              backgroundColor: '#ffffff',
                              opacity: hasFocusedNode ? (isHighlighted ? 1 : 0.22) : 1,
                              filter:
                                hasFocusedNode && !isHighlighted
                                  ? 'grayscale(0.18)'
                                  : 'none',
                              boxShadow: isSelected
                                ? `0 0 0 3px ${style.soft}, 0 12px 28px rgba(15,23,42,0.18)`
                                : '0 2px 8px rgba(15,23,42,0.08)',
                            }}
                          >
                            <span
                              className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-sm font-semibold"
                              style={{ backgroundColor: style.icon, color: 'white' }}
                            >
                              {toGlyph(node.category)}
                            </span>
                            <Text fw={700} size="md" className="leading-6 text-slate-900">
                              {node.title ?? node.id}
                            </Text>
                            <Text
                              size="xs"
                              className="mt-2 uppercase tracking-[0.14em] text-slate-500"
                            >
                              {toLabel(node.category)}
                            </Text>
                            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
                              <Badge
                                variant="light"
                                radius="sm"
                                style={{
                                  backgroundColor: style.badge,
                                  color: style.icon,
                                }}
                              >
                                {stats.required} Req
                              </Badge>
                              <Badge variant="light" radius="sm" color="gray">
                                {stats.optional} Opt
                              </Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {propertiesOpen && activeNode ? (
        <div className="absolute inset-0 z-50 bg-slate-900/35 p-5 backdrop-blur-[1px]">
          <div className="flex h-full min-h-0 overflow-hidden rounded-[26px] border border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <section className="flex min-w-0 flex-1 flex-col bg-white">
              <div className="flex items-center justify-between bg-[#545454] px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ backgroundColor: activeNodeStyle.icon, color: 'white' }}
                  >
                    {toGlyph(activeNode.category)}
                  </span>
                  <Text fw={700} className="text-[22px] capitalize text-white">
                    {toLabel(activeNode.category)}
                  </Text>
                </div>

                <div className="flex items-center gap-5">
                  <Button
                    radius="md"
                    size="md"
                    style={{ backgroundColor: '#3f8ccf' }}
                    onClick={() =>
                      triggerDownload(
                        JSON.stringify(activeNode, null, 2),
                        `${activeNode.id}.json`,
                        'application/json;charset=utf-8',
                      )
                    }
                  >
                    JSON
                  </Button>
                  <Button
                    radius="md"
                    size="md"
                    style={{ backgroundColor: '#3f8ccf' }}
                    onClick={() =>
                      triggerDownload(
                        buildTsv(activeNodeProperties, activeNodeRequired),
                        `${activeNode.id}.tsv`,
                        'text/tab-separated-values;charset=utf-8',
                      )
                    }
                  >
                    TSV
                  </Button>
                  <button
                    type="button"
                    className="flex items-center gap-3 text-[18px] font-medium text-white"
                    onClick={() => setPropertiesOpen(false)}
                  >
                    <span>Close</span>
                    <IconX size={24} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[280px_minmax(0,1fr)] border-b border-slate-300 bg-white">
                <div className="px-6 py-7 text-[22px] font-semibold text-slate-900">
                  {activeNode.title ?? activeNode.id}
                </div>
                <div className="px-6 py-7 text-[22px] text-slate-900">
                  {activeNodeDescription}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-white p-0">
                <div className="min-w-0 p-5">
                  <PropertiesTable
                    properties={activeNodeProperties as any}
                    required={activeNodeRequired}
                    category={activeNode.category ?? 'dictionary'}
                    subCategory={activeNode.id}
                    selectedProperty=""
                    appendRef={() => undefined}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GraphView;
