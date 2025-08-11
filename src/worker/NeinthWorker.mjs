// @ts-check

import { parentPort } from 'node:worker_threads';

import { PingUnique, TryAsync } from 'vivth';

/**
 * @description
 * - instance constructor for `workerThread`;
 * - by creating `fileName.worker.mjs`, inside `neinth-src` you can generate worker definition file via `instantiation`;
 * >- can be used on `NeinthComponent` by calling `this.importWorker('workerPath')`;
 * >- the return value is a `PassiveSignal`, so you need to unwrap the `.value` `getter` inside `this.new$` then if result is to be used to change `NeinthComponentInstance` `value` you can use `this.updateValue`;
 */
/**
 * @template JobParameter
 * @template JobResult
 */
export class NeinthWorker {
	/**
	 * @param {(message:JobParameter)=>Promise<JobResult>} onMessage
	 */
	constructor(onMessage) {
		parentPort.on(
			'message',
			/**
			 * @type {(this: NeinthWorker, message: JobParameter) => Promise<any>}
			 */
			async function (message) {
				new PingUnique('neinthWorker', async () => {
					const [returnedVal, error] = await TryAsync(async () => {
						return await onMessage(message);
					});
					if (error) {
						parentPort.postMessage({ result: undefined, error });
						return;
					}
					parentPort.postMessage({ result: returnedVal, error: undefined });
				});
			}
		);
	}
	/**
	 * @type {(jobDetails:JobParameter)=>void}
	 */
	mainAssignJob;
	/**
	 * @type {(asyncCallback:(message:{result:JobResult|undefined, error:Error|undefined})=>Promise<void>)=>void}
	 */
	mainOnFinishedJob;
}
