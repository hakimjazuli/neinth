// @ts-check

import { NeinthComponent } from 'Neinth';

/**
 * @type {NeinthComponent<
 * void,
 * undefined
 * >}
 */
const neinthInstance = new NeinthComponent(async function () {
	const watcher_ = this.listenToNeinth('neinth-src/neinth/core/testWatchSingleFile.mjs');
	this.new$(async () => {
		const watcher = watcher_.value;
		if (!watcher) {
			return;
		}
		watcher.infos.forEach((info) => {
			console.log({ now: Date.now(), singleFileWatcher: info.path.full });
		});
	});
});
export default neinthInstance;
