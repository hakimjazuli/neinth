// @ts-check

import { neinth } from 'neinth';

export default new neinth(async ({ writeFile, getInfos }) => {
	const infos = getInfos('/neinth-watch/', { dir: false, file: true }, 'utf8').value;
	if (!infos) {
		return;
	}
	infos.forEach((a) => {
		writeFile({
			relativePathFromProjectRoot: `/neinth-test/reflect/${a.baseName.withExt}`,
			template: { string: a.content ?? '' },
		});
	});
});
