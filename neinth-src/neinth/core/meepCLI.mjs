// @ts-check

import { TrySync } from 'vivth';
import { NeinthComponent } from 'neinth';

export default new NeinthComponent(async function () {
	const meepCLi = {
		/**
		 * @param {string[]} a
		 */
		test: (...a) => {
			if (!a.length) {
				console.error('arg.length = 0;');
				return;
			}
			console.log({
				from: 'neinth-src/neinth/core/meepCLI.mjs:16',
				says: `hello ${a.join('-').toUpperCase()}`,
			});
		},
	};
	console.log({
		exampleCLI: 'try to run on the console command bellow',
		command: 'meep test ruben',
	});

	const stdIn = this.listenToStdIn();
	return this.updateValue$({
		mode: 'mostRecent',
		derived: async () => {
			const value = stdIn.value;
			const listC = this.bufferToCLIStrings(value, {
				namespace: 'meep',
				encoding: 'utf-8',
			});

			if (!listC) {
				return undefined;
			}
			const [_, error] = TrySync(() => {
				const command = listC[0];
				listC.shift();
				return meepCLi[command](...listC);
			});
			if (error) {
				return undefined;
			}
			return _;
		},
	});
});
