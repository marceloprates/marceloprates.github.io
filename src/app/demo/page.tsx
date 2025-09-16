import CubeViewer from "@/components/3d/CubeViewer";
import ModelCard from "@/components/3d/ModelCard";

export default function DemoPage() {
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6">3D Components Demo</h1>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">New 3D Model Card</h2>
                <p className="mb-6">
                    This new component combines the 3D model with an interactive card interface.
                    Hover over the card to see the tilt effect, and interact with the 3D model directly.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModelCard
                        objPath="/models/som4.obj"
                        title="SOM4 Model"
                        description=""
                    />
                </div>
            </section>
        </main>
    );
}