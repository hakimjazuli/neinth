// @ts-check

import { neinth } from 'neinth';
import { trySync } from 'vivth';
import { basename, dirname } from 'path';

/**
 * this is an neinth-script example
 */

const thisFile = import.meta.url;
const packageName = basename(dirname(dirname(thisFile)));

export default new neinth(async ({ importNeinth, getInfos }) => {
	// @ts-expect-error
	const config = importNeinth(`neinth-src/${packageName}/config/configs.mjs`).value;
	/**
	 * for example purpose only, use staticly generated path when running `bunx neinth` for smoother experience
	 */
	const [infos, error] = trySync(() => {
		return getInfos(config.watchPath ?? '', { file: true, dir: false }, 'utf-8');
	});
	if (!config || error) {
		return;
	}
	return { infos: infos.value };
});
