// @ts-check

import { NeinthComponent } from 'neinth';

export default new NeinthComponent(async function () {
	const workerSignal = this.importWorker('neinth-src/neinth/core/test.worker.mjs');
	this.new$(async ({ onBefore$ }) => {
		const worker = workerSignal.value;
		if (!worker) {
			return;
		}
		const { stopContract, onFinishedJob, assignJob } = await worker.newContract(this.withCleanUp);
		onBefore$(stopContract);
		onFinishedJob(async ({ result, error }) => {
			if (error) {
				return;
			}
			console.log(`message: ${result}`);
		});
		assignJob('meeeep');
	});
});
