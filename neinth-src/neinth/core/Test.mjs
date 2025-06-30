// @ts-check

import { NeinthComponent } from 'Neinth';

/**
 * @description
 *
 */
export class Test {
	static hj = 'aerkjakerj';
}

/**
 * @type {NeinthComponent<
 * typeof Test,
 * number
 * >}
 */
const neinthInstance = new NeinthComponent(async function () {
	this.setSharedData(neinthInstance, 4);
	const a = this.getSharedData(neinthInstance);
	console.log({ a });
	return Test;
});

export default neinthInstance;
