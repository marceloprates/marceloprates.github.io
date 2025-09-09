"use client";

import { useEffect, useRef } from 'react';
import type p5 from 'p5';

/**
 * Client-only heavy p5 implementation. This file is dynamically imported
 * from `P5Sketch.tsx` with `ssr: false` to avoid adding p5 to the server
 * bundle.
 */
export default function P5SketchClient() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const p5Ref = useRef<p5 | null>(null);

    useEffect(() => {
        let isMounted = true;
        let cleanup: (() => void) | null = null;

        (async () => {
            type P5Ctor = new (sketch: (p: p5) => void, node?: HTMLElement) => p5;
            const mod = (await import('p5')) as unknown as { default?: P5Ctor } | P5Ctor;
            const P5: P5Ctor = (mod as { default?: P5Ctor }).default ?? (mod as P5Ctor);

            const sketch = (p: p5) => {
                const palette = ['#f56767', '#ffc878', '#8aa2eb'];
                let t = 0;
                let textureGraphics: p5.Graphics | null = null;

                function drawNoiseBackground(n: number, g: p5.Graphics) {
                    const c = p.color(0, 0, 0, 5);
                    for (let i = 0; i < n; i++) {
                        const x = p.random(1) * p.width;
                        const y = p.random(1) * p.height;
                        const w = p.random(1, 4);
                        const h = p.random(1, 4);
                        g.noStroke();
                        g.fill(c);
                        g.ellipse(x, y, w, h);
                    }
                }

                function createOrResizeCanvas() {
                    const el = containerRef.current;
                    const w = Math.max(1, Math.floor((el?.clientWidth ?? 800)));
                    const h = Math.floor(0.25 * w);
                    if (p.width !== w || p.height !== h) {
                        if (p.width && p.height) p.resizeCanvas(w, h);
                        else p.createCanvas(w, h);
                        textureGraphics = p.createGraphics(w, h);
                        drawNoiseBackground(0.1 * (w * h), textureGraphics);
                    }
                }

                p.setup = () => {
                    createOrResizeCanvas();
                };

                p.windowResized = () => {
                    createOrResizeCanvas();
                };

                p.draw = () => {
                    p.randomSeed(42);
                    p.background(255);

                    t += p.TWO_PI / 200;
                    p.noFill();

                    const m = 40;
                    const n = 100;

                    const pass = (col: string, offset: number, mouseFactor: number) => {
                        p.push();
                        for (let k = 0; k < m; k++) {
                            const sw = 0.04 * p.width * Math.sin(p.TWO_PI * k / m);
                            p.strokeWeight(sw);
                            p.stroke(col);
                            p.beginShape();
                            for (let i = 0; i < n; i++) {
                                const x = offset + 0.9 * p.width * i / n + 0.01 * p.width * Math.cos(-t + 5 * p.TWO_PI * i / n);
                                const y0 = p.width + 0.05 * p.width + 0.9 * p.width * i / n - 0.01 * p.width * Math.cos(-t + 5 * p.TWO_PI * i / n);
                                const y = y0 - 0.1 * p.width * k - mouseFactor * (p.mouseX - 0.1 * p.width);

                                if (y < 0.05 * p.height) continue;
                                if (x > 0.9 * p.width || y > 0.9 * p.height) break;
                                p.curveVertex(x, y);
                            }
                            p.endShape();
                        }
                        p.pop();
                    };

                    pass(palette[0], 0.05 * p.width, 0.15);
                    pass(palette[1], 0.08 * p.width, 0.10);
                    pass(palette[2], 0.11 * p.width, 0.05);

                    if (textureGraphics) {
                        p.image(textureGraphics, 0, 0);
                    }
                };
            };

            if (!isMounted) return;
            const instance = new P5(sketch, containerRef.current as unknown as HTMLElement);
            p5Ref.current = instance as unknown as p5;

            cleanup = () => {
                try {
                    p5Ref.current?.remove?.();
                } catch { }
                p5Ref.current = null;
            };
        })();

        return () => {
            isMounted = false;
            cleanup?.();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            id="sketch-holder"
            className="w-full rounded-xl overflow-hidden bg-white/60 dark:bg-zinc-900/40 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm"
            aria-label="Generative p5.js sketch"
        />
    );
}
