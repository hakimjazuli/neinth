// @ts-check

import { NeinthComponent } from 'Neinth';

/**
 * @type {NeinthComponent<
 * void,
 * undefined
 * >}
 */
const neinthInstance = new NeinthComponent(async function () {
	const watcher_ = this.listenToNeinth('neinth-src/neinth/core/autocreatewatcher.mjs');
	this.new$(async () => {
		console.log(watcher_.value);
	});
});
export default neinthInstance;
