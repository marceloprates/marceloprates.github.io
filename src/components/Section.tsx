// Section heading wrapper

interface SectionProps {
    id: string;
    title: string;
    gradient: string;
    children: React.ReactNode;
}

export function Section({ id, title, gradient, children }: SectionProps) {
    return (
        <div id={id} className="group">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 tracking-tight">
                <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {title}
                </span>
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none">
                {children}
            </div>
        </div>
    );
}
