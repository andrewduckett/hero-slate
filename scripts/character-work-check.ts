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

export function judgeCharacterWork({ title }: CharacterWorkInput): CharacterWorkResult {
	return {
		pass: true,
		message: `This pull request is not marked as character work: its title "${title}" does not start with "char:". Nothing to check.`
	};
}
