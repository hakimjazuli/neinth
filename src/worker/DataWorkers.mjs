// @ts-check

import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

import { NewPingUnique, trySync } from 'vivth';
import { NeinthRuntime } from '../NeinthRuntime.mjs';
import { PassiveSignal } from '../neinth/PassiveSignal.mjs';
import { WorkerContract } from './WorkerContract.mjs';

/**
 * @description
 * - placeholder for `Workers` management;
 */
export class DataWorkers {
	/**
	 * @typedef {import('./list/WorkersList.mjs').WorkersList} WorkerList
	 * - should be modified with List
	 */
	/**
	 * @param {WorkerList} workerList
	 * @returns {boolean}
	 */
	static isValidPath = (workerList) => workerList.endsWith('.worker.mjs');
	/**
	 * @private
	 * @type {Map<string, PassiveSignal<WorkerContract>>}
	 */
	static mapped = new Map();
	/**
	 * @param {WorkerList} path_
	 */
	static unlinkProxySignal = (path_) => {
		if (!DataWorkers.mapped.has(path_)) {
			return;
		}
		const signal = DataWorkers.getProxySignal(path_);
		signal.unRef();
		DataWorkers.mapped.delete(path_);
		DataWorkers.updateList();
	};
	/**
	 * @param {WorkerList} workerList
	 */
	static addProxySignal = (workerList) => {
		const signal = DataWorkers.getProxySignal(workerList);
		/**
		 * @description
		 * - `bypassed` for `PassiveSignal`;
		 */
		// @ts-expect-error
		signal.value = new WorkerContract(workerList);
		DataWorkers.updateList();
	};
	/**
	 * @param {WorkerList} workerList
	 * should return value and function to be call;
	 */
	static getProxySignal = (workerList) => {
		const workers = DataWorkers.mapped;
		if (!workers.has(workerList)) {
			workers.set(workerList, new PassiveSignal(undefined));
		}
		return workers.get(workerList);
	};
	/**
	 * @returns {void}
	 */
	static updateList = () =>
		NewPingUnique(
			`dataWorkers.updateList`,
			async () => {
				const { corePath, normalizePath, resolveProjectPath } = NeinthRuntime;
				const listPath = join(corePath, 'worker', 'list', 'WorkersList.mjs');
				let [_, error] = trySync(async () => {
					const workersNames_ = [];
					const types_ = [];
					const setOfPath = DataWorkers.mapped;
					setOfPath.forEach((_, path_) => {
						path_ = normalizePath(path_);
						workersNames_.push(path_);
						types_.push(`WorkerPath extends'${path_}'?import('${resolveProjectPath(path_)}')`);
					});
					const workersNames = workersNames_.join("'|'");
					types_.push('void');
					const types = types_.join(':');
					/**
					 * @type {BufferEncoding}
					 */
					const encoding = 'utf8';
					const content = `// @ts-check
/**
 * @typedef {'${workersNames}'} WorkersList
 */
/**
 * @template {WorkersList} WorkerPath
 * @typedef {${types}} GetWorker;
 */
`;
					if (readFileSync(listPath, { encoding }) === content) {
						// console.info({
						// 	listPath,
						// 	skipped: "workersList's content unchanged",
						// 	timeStamp: Date.now(),
						// });
						return;
					}
					writeFileSync(listPath, content, { encoding });
					console.info({
						listPath,
						success: 'to write `typehint` `workersPath` at `listPath`',
						timeStamp: Date.now(),
					});
					console.log({ error });

					if (!error) {
						return;
					}
					console.error({
						error: NeinthRuntime.parseError(error),
						listPath,
						failed: 'to write `workersList` at `listPath`',
						timeStamp: Date.now(),
					});
				});
			},
			NeinthRuntime.debounceMSForUpdateList
		);
}
