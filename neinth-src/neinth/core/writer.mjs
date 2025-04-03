// @ts-check

import { infos, neinth } from 'neinth';
import { basename, dirname } from 'path';

/**
 * this is an neinth-script example
 */

const thisFile = import.meta.url;
const packageName = basename(dirname(dirname(thisFile)));

export default new neinth(async ({ writeFile, importNeinth }) => {
	// @ts-expect-error
	const watcher = importNeinth(`neinth-src/${packageName}/core/watcher.mjs`).value;
	/**
	 * for example purpose only, use staticly generated path when running `bunx neinth` for smoother experience
	 */
	// @ts-expect-error
	const config = importNeinth(`neinth-src/${packageName}/config/configs.mjs`).value;
	/**
	 * for example purpose only, use staticly generated path when running `bunx neinth` for smoother experience
	 */
	if (!config || !watcher) {
		return;
	}
	watcher.infos?.forEach(
		/**
		 *
		 * @param {infos} info
		 */
		(info) => {
			writeFile({
				relativePathFromProjectRoot: info.path.relative.replace(
					config.watchPath,
					`${config.testPath}/reflect`
				),
				template: { string: info.content },
				encoding: 'utf-8',
			});
		}
	);
	const testBatch = ['testA', 'testB'];
	for (let i = 0; i < testBatch.length; i++) {
		const testSingular = testBatch[i];
		writeFile({
			relativePathFromProjectRoot: `${config.testPath}/testBatch/${testSingular}.txt`,
			template: { string: `text content of "NAMENAME"`, modifier: { NAMENAME: testSingular } },
			encoding: 'utf-8',
		});
	}
});
