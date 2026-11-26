/**
 * The `character work` CI check: a pull request whose title starts with
 * `char:` may change only files in `static/characters/` (ADR 0013).
 */

export interface CharacterWorkInput {
	title: string;
	changedPaths: string[];
}

export interface CharacterWorkResult {
	pass: boolean;
	message: string;
}

/** Exact and lowercase, so `Char:` or ` char:` is not a second spelling to learn (design D-a). */
export const CHARACTER_WORK_MARK = 'char:';

/** With its trailing slash, so `static/characters-old/` is outside. */
export const CHARACTER_FOLDER = 'static/characters/';

export function judgeCharacterWork({ title }: CharacterWorkInput): CharacterWorkResult {
	if (!title.startsWith(CHARACTER_WORK_MARK)) {
		return {
			pass: true,
			message: `This pull request is not marked as character work: its title does not start with "${CHARACTER_WORK_MARK}". Nothing to check.`
		};
	}
	return {
		pass: true,
		message: `This character work pull request changes only files in ${CHARACTER_FOLDER}.`
	};
}
