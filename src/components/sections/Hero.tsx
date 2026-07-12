import { siteConfig } from "@/config/site";

/**
 * Home page hero. Displays the owner's name with a yellow highlighter
 * mark effect and a one-line bio paragraph.
 *
 * Strings come from siteConfig.owner. The highlighter styling
 * (skew + gradient + grain noise overlay) is intentionally preserved
 * verbatim from the original inline JSX.
 */
export function Hero({ years }: { years: number }) {
	const { owner } = siteConfig;
	return (
		<header className="mb-10 text-center">
			<h1 className="text-4xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white libre-baskerville">
				{">"} Hi, I&apos;m{" "}
				<span className="relative inline-block">
					<span
						className="bg-yellow-200 dark:bg-yellow-400/60 px-1 rounded-sm z-0 absolute inset-0 -skew-y-2 pointer-events-none"
						aria-hidden="true"
					>
						<span className="absolute inset-0 opacity-60 mix-blend-multiply bg-gradient-to-br from-transparent via-black/5 to-transparent" />
						<span className="absolute inset-0 opacity-90 mix-blend-multiply bg-[length:40px_40px] bg-[url('data:image/svg+xml;utf8,<svg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grain\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'1.0\' numOctaves=\'3\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23grain)\' opacity=\'0.35\'/></svg>')]" />
					</span>
					<span className="relative z-10 font-extrabold text-gray-900 dark:text-gray-900">
						{owner.shortName}!
					</span>
				</span>
			</h1>
			<p className="mx-auto max-w-3xl text-lg text-gray-700 dark:text-gray-300 text-justify">
				My name is {owner.name}, I&apos;m a {years}yo software developer and
				artist based in {owner.location}.
			</p>
		</header>
	);
}