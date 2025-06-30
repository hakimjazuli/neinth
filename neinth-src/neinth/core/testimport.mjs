// @ts-check

import { NeinthComponent } from 'neinth';

/**
 * @type {NeinthComponent<
 * string,
 * null
 * >}
 */
const neinthInstance = new NeinthComponent(async function () {
	const a = this.listenToNeinth('neinth-src/neinth/core/Test.mjs');
	console.log('outer ', this.instancePath);
	return this.updateValue$({
		neinthInstance,
		mode: 'mostRecent',
		derived: async () => {
			const value = a.value;
			if (!value) {
				return;
			}
			console.log('inner ', this.instancePath);
			console.log({ value: value.hj });
			const test = `${value.hj}-hejarhekjah`;
			return test;
		},
	});
});

export default neinthInstance;
