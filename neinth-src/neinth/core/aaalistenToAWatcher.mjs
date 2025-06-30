// @ts-check

import { NeinthComponent } from 'neinth';

export default new NeinthComponent(async function () {
	const infos = this.listenToNeinth('neinth-src/neinth/core/awatcher.mjs');
	this.new$(async () => {
		const filesSet = new this.SetOfFiles();
		if (!infos) {
			return;
		}
		infos.value.forEach((info) => {
			filesSet.add({
				relativePathFromProjectRoot: info.path.relative.replace('neinth-watch', 'neinth-test'),
				template: {
					string: info.content.toString(),
				},
				encoding: 'utf-8',
			});
		});
		this.synchronizeFiles({ id: 1, SetOfFilesInstance: filesSet });
	});
});
