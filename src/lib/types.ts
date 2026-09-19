/**
 * A loaded character definition.
 *
 * The identity fields (`id`, `name`, `level`, `class`, `color`) are the stable
 * contract this release relies on and validates. Everything else is carried through
 * provisionally: later changes own the semantics of abilities, combat metrics,
 * hit points, pools, and sections, so those are typed loosely for now.
 *
 * The shape maps cleanly to JSON so a future hosted API can return the same
 * thing the YAML provider does.
 */
export interface Character {
	/** Stable public identifier, stamped from the request id — never trusted from the file. */
	id: string;
	/** Required, non-empty. */
	name: string;
	/** Optional; a finite number when present. */
	level?: number;
	/** Optional; printed as authored. */
	class?: string;
	/** Optional; a string naming a palette. The theming layer resolves it — an
	 * unknown name is valid data here and falls back to neutral when rendered. */
	color?: string;

	// --- Provisional fields (defined and validated by later changes) ---
	abilities?: unknown;
	combat?: unknown;
	hitPoints?: unknown;
	pools?: unknown;
	sections?: unknown;

	/** Any other authored keys pass through unchanged this release. */
	[key: string]: unknown;
}
