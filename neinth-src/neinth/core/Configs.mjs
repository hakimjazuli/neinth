// @ts-check

import { neinth } from 'neinth';

/**
 * @description
 * for auto documentation purposes look for npm `@html_first/js_lib_template` documentation;
 * >- this is an neinth-script example,
 * >- you can generate this template by using ">>neinth_config" .vscode snippet,
 * >- for on developement DX it's recommended to wrap the export by returning it via neinth instance,
 * >- and imported using `importNeinth` signal,
 * >- as when `npx neinth` running, it will be automatically managed by `neinth`;
 */
export class Configs {
	/**
	 * @param {Object} param0
	 * @param {string} param0.watchPath
	 * - dir watcher
	 * @param {string} param0.testPath
	 * - direct write
	 */
	constructor({ watchPath, testPath }) {
		this.watchPath = watchPath;
		this.testPath = testPath;
	}
}

export default new neinth(async () => {
	return Configs;
});
