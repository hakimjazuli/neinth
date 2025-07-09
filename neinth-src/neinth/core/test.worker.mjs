// @ts-check

import { NeinthWorker } from 'neinth';

/**
 * @type {NeinthWorker<
 * string,
 * string
 * >}
 */
export default new NeinthWorker(async (message) => {
	return message.toUpperCase();
});
