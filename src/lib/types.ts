/**
 * A loaded character definition.
 *
 * The identity fields (`id`, `name`, `level`, `class`, `color`) are the stable
 * contract this release relies on and validates. Everything else is carried through
 * unresolved: each field's own resolver module owns its semantics — abilities,
 * combat metrics, hit points, pools, and sections — so those stay typed loosely
 * here and are validated in the layer that gives them meaning.
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

	// --- Fields resolved by their own modules, not by the provider ---
	abilities?: unknown;
	combat?: unknown;
	hitPoints?: unknown;
	pools?: unknown;

	/**
	 * Ordered `{ title, color?, rows }` groups, each row `{ title?, color?, body }`
	 * with rich-text markup in `body`. Stays `unknown` here because the provider
	 * validates identity only; `resolveSections` in `character/sections.ts` owns
	 * this shape and silently drops any entry that does not match it.
	 */
	sections?: unknown;

	/** Any other authored keys pass through unchanged this release. */
	[key: string]: unknown;
}
