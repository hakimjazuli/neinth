// @ts-check

import { NeinthComponent, NeinthWatcher } from 'Neinth';

/**
 * @type {NeinthComponent<
 * NeinthWatcher["value"]|undefined,
 * undefined
 * >}
 */
const neinthInstance = new NeinthComponent(async function () {
	this.generateWatcher({
		relativePath: '/dev/',
		addDirToSet: true,
		addFileToSet: true,
		encoding: 'utf-8',
	});
	const watcher_ = this.listenToGeneratedWatcher();
	return this.updateValue$({
		neinthInstance,
		mode: 'mostRecent',
		derived: async () => {
			return watcher_?.value;
		},
	});
});
export default neinthInstance;
