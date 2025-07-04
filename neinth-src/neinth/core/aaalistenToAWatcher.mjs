// @ts-check

import { NeinthComponent } from 'neinth';

export default new NeinthComponent(async function () {
	const watcher_ = this.listenToNeinth('neinth-src/neinth/core/awatcher.mjs');
	this.new$(async () => {
		const info = watcher_.value;
		if (!info) {
			return;
		}
		const filesSet = new this.SetOfFiles();
		const { infos } = info;
		infos.forEach((info) => {
			filesSet.add({
				relativePathFromProjectRoot: info.path.relative.replace('neinth-watch', 'neinth-test'),
				template: {
					string: info.content.toString(),
				},
				encoding: 'utf-8',
			});
		});
		this.synchronizeFiles({ id: 'writeFile', SetOfFilesInstance: filesSet });
	});
});
