// @ts-check

import { NeinthWorker } from 'neinth';

/**
 * @type {NeinthWorker<
 * string,
 * string
 * >}
 */
new NeinthWorker(async (message) => {
	return message.toUpperCase();
});
