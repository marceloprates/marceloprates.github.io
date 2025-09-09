import React from 'react';

type Edge = {
    from: string;
    to: string;
    papers: number; // number of co-authored papers between from->to
};

interface ErdosPathProps {
    className?: string;
    edges?: Edge[];
    distance?: number;
    href?: string;
}

// layout helpers
const NODE_RADIUS = 18;
const H_MARGIN = 70; // extra margin to prevent left label clipping
const BASE_HEIGHT = 160;
const ARROW_SPREAD = 12; // vertical pixels between parallel arrows

function getOffsets(n: number, spread = ARROW_SPREAD) {
    // symmetric offsets like [0], [-s, s], [-2s, 0, 2s], ...
    if (n <= 1) return [0];
    const arr: number[] = [];
    const mid = (n - 1) / 2;
    for (let i = 0; i < n; i++) {
        arr.push((i - mid) * spread);
    }
    return arr;
}

export default function ErdosPath({
    className,
    edges = [
        { from: 'Marcelo O. R. Prates', to: 'Moshe Y. Vardi', papers: 2 },
        { from: 'Moshe Y. Vardi', to: 'Joel H. Spencer', papers: 1 },
        { from: 'Joel H. Spencer', to: 'Paul Erdős', papers: 9 },
    ],
    distance = 3,
    href = 'https://www.csauthors.net/distance/marcelo-o-r-prates/paul-erdos',
}: ErdosPathProps) {
    // derive ordered unique nodes from the path
    const nodeNames: string[] = React.useMemo(() => {
        if (!edges.length) return [];
        const names = [edges[0].from, ...edges.map((e) => e.to)];
        // ensure contiguous path order (already is), but dedupe if any accidental repeats
        return names.filter((n, i) => names.indexOf(n) === i);
    }, [edges]);

    const spacing = 150; // tighter horizontal spacing between nodes
    const width = H_MARGIN * 2 + Math.max(0, nodeNames.length - 1) * spacing;
    // height grows a bit with the maximum number of parallel arrows, to give room for curves
    const maxPapers = edges.reduce((m, e) => Math.max(m, e.papers || 1), 1);
    const height = BASE_HEIGHT + Math.max(0, maxPapers - 1) * 4;

    // map node -> position
    const positions = new Map<string, { x: number; y: number }>();
    nodeNames.forEach((name, i) => {
        positions.set(name, { x: H_MARGIN + i * spacing, y: height / 2 });
    });

    return (
        <figure
            className={
                'group rounded-xl p-4 md:p-5 bg-white/70 dark:bg-white/5 shadow-inner backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10 ' +
                (className ?? '')
            }
            aria-label={`Erdős path diagram, distance ${distance}`}
        >
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline"
                aria-label="Open detailed Erdős number path"
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto"
                    role="img"
                    aria-label={`Graph of co-authorship path with ${distance} hops`}
                >
                    {/* single gradient spanning from first to last node, matching node colors */}
                    {nodeNames.length >= 2 && (
                        <defs>
                            {(() => {
                                const first = nodeNames[0];
                                const last = nodeNames[nodeNames.length - 1];
                                const firstPos = positions.get(first)!;
                                const lastPos = positions.get(last)!;
                                const x1 = firstPos.x + NODE_RADIUS + 2;
                                const x2 = lastPos.x - NODE_RADIUS - 2;
                                const gradId = 'erdos-path-grad';
                                const span = Math.max(1, x2 - x1);
                                const stops = nodeNames.map((name, i) => {
                                    const p = positions.get(name)!;
                                    // Use center for intermediates, edge offsets for ends
                                    const x = i === 0 ? x1 : i === nodeNames.length - 1 ? x2 : p.x;
                                    const offset = Math.min(100, Math.max(0, ((x - x1) / span) * 100));
                                    // Tailwind hex: emerald-500, indigo-500, fuchsia-500
                                    const color = i === 0 ? '#10b981' : i === nodeNames.length - 1 ? '#d946ef' : '#6366f1';
                                    return { offset, color };
                                });
                                return (
                                    <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={x1} y1={height / 2} x2={x2} y2={height / 2}>
                                        {stops.map((s, i) => (
                                            <stop key={i} offset={`${s.offset}%`} stopColor={s.color} />
                                        ))}
                                    </linearGradient>
                                );
                            })()}
                        </defs>
                    )}
                    {/* edges with multiple arrows (one per paper) */}
                    {edges.map((e, idx) => {
                        const from = positions.get(e.from)!;
                        const to = positions.get(e.to)!;
                        const startX = from.x + NODE_RADIUS + 2;
                        const endX = to.x - NODE_RADIUS - 2;
                        const y = from.y;
                        const m = Math.max(1, e.papers || 1);
                        const offsets = getOffsets(m);
                        const gradientId = 'erdos-path-grad';
                        return (
                            <g key={`${e.from}-${e.to}-${idx}`}>
                                {offsets.map((off, k) => {
                                    const cx = (startX + endX) / 2;
                                    const cy = y + off;
                                    const d = `M ${startX} ${y} Q ${cx} ${cy} ${endX} ${y}`;
                                    return (
                                        <path
                                            key={k}
                                            d={d}
                                            fill="none"
                                            stroke={`url(#${gradientId})`}
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            opacity={0.9}
                                        />
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* nodes */}
                    {nodeNames.map((name, i) => {
                        const p = positions.get(name)!;
                        const isStart = i === 0;
                        const isEnd = i === nodeNames.length - 1;
                        return (
                            <g key={name} transform={`translate(${p.x}, ${p.y})`}>
                                {/* node circle */}
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={NODE_RADIUS}
                                    className="fill-white/90 dark:fill-white/10 stroke-black/10 dark:stroke-white/20"
                                    strokeWidth={1}
                                />
                                {/* node accent ring */}
                                <circle cx={0} cy={0} r={NODE_RADIUS - 4} className={`fill-none ${isStart ? 'stroke-emerald-500' : isEnd ? 'stroke-fuchsia-500' : 'stroke-indigo-500'}`} strokeWidth={2} />
                                {/* label */}
                                <text
                                    x={0}
                                    y={NODE_RADIUS + 18}
                                    textAnchor="middle"
                                    className="fill-gray-800 dark:fill-gray-100 text-[10px] md:text-xs"
                                >
                                    {name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </a>
        </figure>
    );
}
