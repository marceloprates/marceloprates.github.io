import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically load the heavy client file with SSR disabled.
const P5SketchClient = dynamic(() => import('./P5Sketch.client'), { ssr: false, loading: () => <div className="w-full h-24 rounded-xl bg-gray-100/50 dark:bg-zinc-900/30" /> });

export default function P5Sketch() {
    return <P5SketchClient />;
}
