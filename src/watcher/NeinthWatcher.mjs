// @ts-check

import chokidar from 'chokidar';
import { NeinthComponent } from '../neinth/NeinthComponent.mjs';
import { NeinthRuntime } from '../NeinthRuntime.mjs';
import { NewPingUnique } from 'vivth';
import { Infos } from '../helpers/Infos.mjs';

/**
 * @description
 * ```js
 * /**
 *  * @typedef {Object} NeinthWatcherOptions
 *  * @property {string} relativePath
 *  * @property {boolean} addFileToSet
 *  * @property {boolean} addDirToSet
 *  * @property {BufferEncoding} [encoding]
 *  *[blank]/
 * /**
 *  * @extends NeinthComponent<{watcherOptions:NeinthWatcherOptions, infos:Set<Infos>}>
 *  *[blank]/
 * ```
 * - export `NeinthWatcherInstance` as default on `neitnh-src/**[blank]/*` to be used as `directory/file` watcher;
 * - `neinthWatcher` uses `chokidar` under the hood;
 * - this is a simplified helper for `FSwatcher`, you can always implement your own extended `NeinthComponent`, however once your class works as you intended recomended to export outside `neinth-src`, so it's not treated as dynamic module;
 */
export class NeinthWatcher extends NeinthComponent {
	/**
	 * @param {Object} a0
	 * @param {string} a0.relativePath
	 * - relative path(from project root) to be watch;
	 * @param {boolean} a0.addFileToSet
	 * - add file to `Set`;
	 * @param {boolean} a0.addDirToSet
	 * - add dir to `Set`;
	 * @param {BufferEncoding} [a0.encoding]
	 * - file encoding;
	 * - be consistent when using `neinth` `options` `writeFile` and this;
	 */
	constructor({ relativePath, addDirToSet, addFileToSet, encoding = 'utf-8' }) {
		super(async function () {
			const truePath = this.resolveProjectPath(relativePath);
			const listener = async () =>
				NewPingUnique(`neinthWatcher.constructor const listener:"${truePath}"`, async () => {
					const value = {
						watcherOptions: { relativePath, addDirToSet, addFileToSet, encoding },
						infos: NeinthRuntime.getInfos(
							truePath,
							{ file: addFileToSet, dir: addDirToSet },
							encoding
						),
					};
					// @ts-expect-error
					this.updateValue({ value, mode: 'mostRecent' });
				});
			this.withCleanUp(async () => {
				const watcher = chokidar.watch(truePath).on('all', listener);
				return {
					onCleanUp: async () => {
						watcher.removeListener('all', listener);
						watcher.removeAllListeners();
					},
				};
			});
			/**
			 * @type {{watcherOptions:NeinthWatcherOptions, infos:Set<Infos>}}
			 */
			const returnValue = {
				watcherOptions: { relativePath, addDirToSet, addFileToSet, encoding },
				infos: new Set(),
			};
			return returnValue;
		});
	}
}
