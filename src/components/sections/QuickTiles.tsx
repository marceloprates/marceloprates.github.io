import { tiles } from "@/data/tiles";
import { TileButton } from "@/components/TileButton";

/**
 * Bento-style quick-links tile grid.
 * Renders every entry in @/data/tiles as a TileButton. No props.
 */
export function QuickTiles() {
	return (
		<section aria-label="Quick links" className="mb-20">
			<div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[88px] gap-4">
				{tiles.map((tile) => (
					<TileButton key={tile.label} tile={tile} />
				))}
			</div>
		</section>
	);
}