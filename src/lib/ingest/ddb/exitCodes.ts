/**
 * The ingest tools' exit codes, from the spec's table.
 *
 * | Code | Meaning                                                          | Tools           |
 * |------|-------------------------------------------------------------------|-----------------|
 * | 0    | Success                                                          | all             |
 * | 1    | The draft has at least one error                                 | preview, write  |
 * | 2    | The character is private, or the service refused access          | digest          |
 * | 3    | The target character file already exists                         | preview, write  |
 * | 4    | The character reference is unreadable, or the character does not | digest          |
 * |      | exist                                                             |                 |
 * | 5    | A network failure, or a response the digest tool cannot read     | digest          |
 */
export const EXIT_CODES = {
	success: 0,
	draftHasErrors: 1,
	characterPrivate: 2,
	targetExists: 3,
	referenceUnreadable: 4,
	fetchFailed: 5
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
