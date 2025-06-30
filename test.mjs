// @ts-check

import { NeinthComponent } from 'Neinth';

/**
 * @type {NeinthComponent<
 * string,
 * string
 * >}
 */
const neinthInstance = new NeinthComponent(async function () {
	const a = this.handlers.getSharedData(neinthInstance);
	const watcher = this.listenToNeinth('neinth-src/neinth/core/awatcher.mjs');
	this.new$(async () => {
		const watcher = this.watcher.value;
		if (!watcher) {
			return;
		}
	});
	return '';
});
export default neinthInstance;
