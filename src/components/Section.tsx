// Section heading wrapper

interface SectionProps {
    id: string;
    title: string;
    gradient: string;
    children: React.ReactNode;
    /**
     * Heading level for the section title. Defaults to 'h3' to match
     * the home page hierarchy (page <h1> -> about <h2> -> section <h3>).
     * Pages with their own <h1> should pass as="h2" so the chain is
     * <h1> -> <h2> instead of <h1> -> <h3>.
     */
    as?: 'h2' | 'h3';
}

export function Section({ id, title, gradient, children, as = 'h3' }: SectionProps) {
    const Heading = as;
    return (
        <div id={id} className="group">
            <Heading className="text-2xl md:text-3xl font-semibold mb-4 tracking-tight">
                <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {title}
                </span>
            </Heading>
            <div className="prose prose-slate dark:prose-invert max-w-none">
                {children}
            </div>
        </div>
    );
}
