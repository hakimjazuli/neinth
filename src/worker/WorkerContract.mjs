// @ts-check

import { pathToFileURL } from 'url';
import { Worker } from 'node:worker_threads';

import { NeinthRuntime } from '../NeinthRuntime.mjs';
import { trySync } from 'vivth';

/**
 * @description
 * - placeholder for `Workers` `typehints` on `mainThread`;
 */
/**
 * @typedef {import('./list/WorkersList.mjs').WorkersList} WorkerList
 * @typedef {import('../neinth/NeinthComponent.mjs').NeinthComponent} NeinthComponent
 */
/**
 * @template {WorkerList} WorkerPath
 */
export class WorkerContract {
	/**
	 * @private
	 * @type {Set<Worker>}
	 */
	static workerSet = new Set();
	/**
	 * @param {WorkerPath} workerPath
	 */
	constructor(workerPath) {
		this.WorkerPath = workerPath;
		if (WorkerContract.#isInitialized) {
			return;
		}
		WorkerContract.#registerFallback();
	}
	/**
	 * @type {WorkerPath}
	 */
	WorkerPath;
	/**
	 * @param {NeinthComponent["withCleanUp"]} neinthWithCleanup
	 * - pass `this.withCleanUp` from `Neinth` `asyncCallback` as `neinthWithCleanup`;
	 */
	newContract = async (neinthWithCleanup) =>
		await neinthWithCleanup(async () => {
			let workerPath = NeinthRuntime.resolveProjectPath(this.WorkerPath).toString();
			let [workerInstance, error] = trySync(() => {
				return new Worker(workerPath);
			});
			if (error) {
				[workerInstance, error] = trySync(() => {
					// @ts-expect-error
					workerPath = pathToFileURL(workerPath);
					return new Worker(workerPath);
				});
			}
			if (error) {
				console.error({
					error,
					message: `unable to create \`CustomWorker\` from "${workerPath.toString()}"`,
				});
				return;
			}
			WorkerContract.workerSet.add(workerInstance);
			const stopContract = async () => {
				workerInstance.unref();
				await workerInstance.terminate();
			};
			return {
				onCleanUp: stopContract,
				value: {
					/**
					 * @type {Worker}
					 */
					workerInstance,
					/**
					 * @template {WorkerList} WorkerList
					 * @type {import('neinth').GetWorker<WorkerList>["default"]["mainAssignJob"]}
					 */
					assignJob: (message) => {
						workerInstance.postMessage(message);
					},
					/**
					 * @template {WorkerList} WorkerList
					 * @type {import('neinth').GetWorker<WorkerList>["default"]["mainOnFinishedJob"]}
					 */
					onFinishedJob: (asyncCallback) => {
						workerInstance.on('message', asyncCallback);
					},
					/**
					 * - pass this as `on$CleanUp`'s `$` `optionsArgument` argument;
					 * - this function stops the `workerThread` from `listening` for any further `jobs`;
					 */
					stopContract,
				},
			};
		});

	static #isInitialized = false;
	static #registerFallback = () =>
		NeinthRuntime.onProcessFallbacks(async () => {
			if (WorkerContract.workerSet.size) {
				await NeinthRuntime.forLoopSet(WorkerContract.workerSet, async (worker) => {
					worker.unref();
					await worker.terminate();
				});
			}
		});
}
