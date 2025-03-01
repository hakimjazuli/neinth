// @ts-check

/**
 * @description
 * - class helper to setup config on the `projectRoot`, instantiate at `neinth.config.mjs`;
 * - it should be automatically added to your `projectRoot` if you are using `npm` to `install`:
 * ```shell
 * npm i neinth
 * ```
 * - includes
 * >- ./neinth.config.mjs
 * >- ./neinth/
 * >- ./neinth-watch/
 * - if by some chance, it's not generated (or you insall it using other than `npm` and the `postinstall` script of `neinth` is not executed for security reason), you can download it from the `npm` file and dirs above;
 */
export class neinthConfig {
	constructor({ folderPath }) {
		this.folderPath = folderPath;
	}
}
