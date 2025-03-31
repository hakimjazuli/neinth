// @ts-check

/**
 * @description
 * - class helper to setup config on the `projectRoot`, instantiate at `neinth.config.mjs`;
 * - includes
 * >- ./neinth.config.mjs
 * >- ./neinth/
 * >- ./neinth-watch/
 */
export class neinthConfig {
	/**
	 * @param {Object} options
	 * @param {string} options.folderPath
	 */
	constructor({ folderPath }) {
		this.folderPath = folderPath;
	}
}
