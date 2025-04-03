// @ts-check

import { neinth } from 'neinth';
import { basename, dirname } from 'path';

/**
 * this is an neinth-script example
 */

const thisFile = import.meta.url;
const packageName = basename(dirname(dirname(thisFile)));

/**
 * this is an neinth-script example
 */
export default new neinth(async ({ importNeinth }) => {
	// @ts-expect-error
	const configs = importNeinth(`neinth-src/${packageName}/core/Configs.mjs`).value;
	if (!configs) {
		return;
	}
	return new configs({
		watchPath: 'neinth-watch',
		testPath: 'neinth-test',
	});
});
