// @ts-check

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { $, PingFIFO, PingUnique, Signal, TryAsync, TrySync } from 'vivth';
import { NeinthRuntime } from '../NeinthRuntime.mjs';
import { StdInHandler } from '../helpers/StdInHandler.mjs';
import { PassiveSignal } from './PassiveSignal.mjs';
import { SetOfFiles } from './SetOfFiles.mjs';
import { DataWorkers } from '../worker/DataWorkers.mjs';
import { WorkerContract } from '../worker/WorkerContract.mjs';

/**
 * @description
 * - is an extended Signal `PassiveSignal`;
 * ```js
 * /**
 *  * @template returnedValue
 *  * @template sharedType
 *  * @extends {PassiveSignal<returnedValue>}
 *  *[blank]/
 * ```
 * - can be autoSubcribed by `Effect`/;
 * - constructor no longer get `handlers` as parameters:
 * >- `handlers` can be accessed via `this` inside `constructor` `arg0`;
 * >>- `runInstanceFallback`: `fallback` to be called when `error` occures by some implementation(eg. server crash);
 * >>- `instancePath`: `getter` for `relativePath` of current `NeinthComponent` to `projectRoot`;
 * >>- `newSignal`: local state management, for two way communication;
 * >>- `updateValue`: notify changes to all `NeinthComponentInstance` subscribers, one way communication;
 * >>- `updateValue$`: `vivth.$` to unwrap listeners `.value` `getter`, uses returned value to notify changes to all `NeinthComponentInstance` subscribers, one way communication, is to be used as return value;
 * >>- `new$`: `vivth.$` to unwrap listeners `.value` `getter` return void;
 * >>- `SetOfFiles`: `Set` instance generator to be used by `synchronizeFiles`;
 * >>- `synchronizeFiles`: neinth provide no individual fileWritter as you might need to manage write and unlink upon cleanup, and it can be quickly unmanageable if the file is then be written again anyway.
 * >>- `listenToNeinth`: get `proxy` `PassiveSignal` for `NeinthComponent`;
 * >>- `listenToStdIn`: `PassiveSignal<Buffer>` listened from `StdIn`;
 * >>- `generateWatcher`: generate `NeinthWatcher` to same dir same basename with `.watcher.mjs` `extention`;
 * >>- `listenToGeneratedWatcher`: call `listenToNeinth` targetting `generateWatcher` generated `NeinthWatcher` of the same `NeinthComponent`;
 * >>- `indentedString`: add indentation on each line;
 * >>- `bufferToStrings`: convert `Buffer` to `Array<string>`;
 * >>- `bufferToCLIStrings`: the same as `bufferToStrings` however with `CLI` `abstraction` helpers;
 * >>- `normalizePath`: convert string `\` to `/`;
 * >>- `resolveProjectPath`: relative project path to machine absolute;
 * >>- `importWorker`: for non blocking `process`, or just any long `process` requiring it's own thread, implemented with typehinting, trycatched into `{result, error}` object for consistency and types;
 * >>- `getSharedData`: `get` previous data on `shared`, usefull for handling through NeinthComponent lifecycle, or on `vivth.$`;
 * >>- `setSharedData`: `set` `shared` object, usefull for handling through NeinthComponent lifecycle, or on `vivth.$`;
 * >>- `withCleanUp`: `NeinthComponentInstance` lifecycle management, for setting up cleanup callbacks;
 * >>- `safeUniquePing`: wrap callback in `vivth.PingUnique` and `vivth.TryAsync`, to safely run them and debounce it's call:
 * >>>- don't unwrap `SignalInstance.value` inside this `callback` as it will be out of scope;
 * - further documentation on [html-first/neinth](https://html-first.bss.design/)
 */
export class NeinthComponent extends PassiveSignal {
	/**
	 * @type {returnedValue}
	 */
	returnedValue;
	/**
	 * @template {NeinthList} P
	 * @typedef {import('./list/NeinthList.mjs').GetNeinth<P>} getNeinth
	 */
	/**
	 * @typedef {import('../watcher/NeinthWatcher.mjs').NeinthWatcher} NeinthWatcher
	 * @typedef {import('./list/NeinthList.mjs').NeinthList} NeinthList
	 * @typedef {import('../worker/list/WorkersList.mjs').WorkersList} WorkersList
	 * @typedef {'fifo'|'mostRecent'} $mode
	 */
	/**
	 * @private
	 * @type {Map<NeinthList, any>}
	 */
	static shared = new Map();
	/**
	 * @private
	 * @param {NeinthList} path_
	 * @returns {any}
	 */
	static getShared = (path_) => {
		const { shared } = NeinthComponent;
		if (!shared.has(path_)) {
			shared.set(path_, undefined);
		}
		return shared.get(path_);
	};
	/**
	 * @private
	 * @param {NeinthList} path_
	 * @param {any} newValue
	 * @returns {void}
	 */
	static setShared = (path_, newValue) => {
		NeinthComponent.shared.set(path_, newValue);
	};
	/**
	 * @type {sharedType}
	 */
	sharedType;
	/**
	 * @private
	 * @type {Map<NeinthList, PassiveSignal>}
	 */
	static mappedSignal = new Map();
	/**
	 * @private
	 * @type {Map<NeinthList, NeinthComponent["unLink"]>}
	 */
	static unLinkMap = new Map();
	/**
	 * @private
	 * @type {Map<NeinthList, NeinthComponent["cleanUp"]>}
	 */
	static cleanUpMap = new Map();
	/**
	 * @param {NeinthList} path_
	 * @returns {PassiveSignal}
	 */
	static getProxySignal = (path_) => {
		if (!NeinthComponent.mappedSignal.has(path_)) {
			NeinthComponent.mappedSignal.set(path_, new PassiveSignal(undefined));
		}
		return NeinthComponent.mappedSignal.get(path_);
	};
	/**
	 * @param {NeinthList} path_
	 * @param {NeinthComponent} neinthInstance
	 * @returns {Promise<void>}
	 */
	static addProxySignal = async (path_, neinthInstance) => {
		NeinthComponent.cleanUp(path_);
		/**
		 * - no need for assignment here.
		 * - already assigned by `neinthInstance.value`'s `setter`;
		 */
		await neinthInstance.init(path_);
		NeinthComponent.updateNeinth();
	};
	/**
	 * @param {NeinthList} NeinthList
	 * @returns {Promise<void>}
	 */
	static unlinkProxySignal = (NeinthList) => {
		if (!NeinthComponent.mappedSignal.has(NeinthList)) {
			return;
		}
		NeinthComponent.cleanUp(NeinthList);
		NeinthComponent.unLink(NeinthList);
		SetOfFiles.unlink(NeinthList);
		NeinthComponent.getProxySignal(NeinthList).unRef();
		NeinthComponent.mappedSignal.delete(NeinthList);
		NeinthComponent.updateNeinth();
	};
	/**
	 * @private
	 * @param {NeinthList} NeinthList
	 * @returns {void}
	 */
	static cleanUp = (NeinthList) => {
		if (!NeinthComponent.cleanUpMap.has(NeinthList)) {
			return;
		}
		NeinthComponent.cleanUpMap.get(NeinthList)();
		NeinthComponent.cleanUpMap.delete(NeinthList);
	};
	/**
	 * @private
	 * @param {NeinthList} NeinthList
	 * @returns {void}
	 */
	static unLink = (NeinthList) => {
		if (!NeinthComponent.unLinkMap.has(NeinthList)) {
			return;
		}
		NeinthComponent.unLinkMap.get(NeinthList)();
		NeinthComponent.unLinkMap.delete(NeinthList);
	};
	/**
	 * @param {boolean} check
	 * @returns {Promise<void>}
	 */
	static updateNeinth = (check = false) => {
		if (check === false) {
			setTimeout(async () => {
				NeinthComponent.updateNeinth(true);
			}, 1000);
			return;
		}
		new PingUnique(
			'neinth.updateNeinth',
			async () => {
				const { corePath, normalizePath, resolveProjectPath } = NeinthRuntime;
				const listPath = join(corePath, 'neinth', 'list', 'NeinthList.mjs');
				let [_, error] = TrySync(async () => {
					const neinthNames_ = [];
					const types_ = [];
					const mappedNeinth = NeinthComponent.mappedSignal;
					mappedNeinth.forEach((_, path_) => {
						// @ts-expect-error
						path_ = normalizePath(path_);
						neinthNames_.push(path_);
						types_.push(
							`NeinthPath extends'${path_}'?import('${resolveProjectPath(
								path_
							)}')['default']['value']`
						);
					});
					const neinthNames = neinthNames_.join("'|'");
					types_.push('void');
					const types = types_.join(':');
					/**
					 * @type {BufferEncoding}
					 */
					const encoding = 'utf8';
					const content = `// @ts-check
/**
 * @typedef {'${neinthNames}'} NeinthList
 */
/**
 * @template {NeinthList} NeinthPath
 * @typedef {${types}} GetNeinth;
 */
`;
					if (readFileSync(listPath, { encoding }) === content) {
						// console.info({
						// 	listPath,
						// 	skipped: "NeinthList's content unchanged",
						// 	timeStamp: Date.now(),
						// });
						return;
					}
					writeFileSync(listPath, content, { encoding });
					console.info({
						listPath,
						success: 'to write `typehint` `NeinthPath` at `listPath`',
						timeStamp: Date.now(),
					});
				});
				if (!error) {
					return;
				}
				console.error({
					error: NeinthRuntime.parseError(error),
					listPath,
					failed: 'to write `NeinthList` at `listPath`',
					timeStamp: Date.now(),
				});
			},
			NeinthRuntime.debounceMSForUpdateList
		);
	};

	/**
	 * @param {neinthDefinitionType} definition
	 */
	constructor(definition) {
		super(undefined);
		this.definition = definition;
		return;
		// const {
		// 	generateWatcher,
		// 	listenToGeneratedWatcher,
		// 	safeUniquePing,
		// 	getSharedData, // shared data for
		// 	setSharedData, // shared data for
		// 	runInstanceFallback, // fallback to be called when error occures by some implementation, like server crash or something;
		// 	instancePath,
		// 	normalizePath, // convert string '\' to '/';
		// 	resolveProjectPath, // relative project path to absolute;
		// 	newSignal, // local state management, two way communication;
		// 	updateValue, // notify changes to all neinthInstance subscribers, one way communication;
		// 	updateValue$, // Effect uses returned value to notify changes to all neinthInstance subscribers, one way communication;
		// 	new$, // Effect return void;
		// 	withCleanUp, // neinthInstance lifecycle management;
		// 	SetOfFiles, // Set instance generator to be used by `synchronizeFiles`;
		// 	synchronizeFiles, // neinth provide no individual fileWritter as you might need to manage write and unlink upon cleanup, and it can be quickly unmanageable if the file is then be written again anyway.
		// 	listenToNeinth, // upadated for clear intention of passively listen;
		// 	listenToStdIn, // return PassiveSignal<Buffer>;
		// 	indentedString, // clear intention, to create indented string;
		// 	bufferToStrings, // convert Buffer to Array<string>;
		// 	bufferToCLIStrings, // the same as `bufferToStrings` however with clear purpose of usability for CLI;
		// 	importWorker, // for non blocking process, or just any long process requiring it's own thread, implemented with typehinting, trycatched into {result, error} object for consistency and types;
		// } = this.handlers;
	}
	/**
	 * @type {NeinthList}
	 */
	get watcherPath() {
		// @ts-expect-error
		return this.instancePath.replace('.mjs', '.watcher.mjs');
	}
	/**
	 * @protected
	 * @type {neinthDefinitionType}
	 */
	definition;
	/**
	 * @type {NeinthList}
	 */
	instancePath = undefined;
	/**
	 * @param {NeinthList} path_
	 * @returns {Promise<void>}
	 */
	init = async (path_) => {
		this.instancePath = path_;
		await this.withCleanUp(async () => {
			this.value = await this.definition.call(this.handlers);
			return {
				onCleanUp: async () => {
					this.unRef();
				},
			};
		});
		NeinthComponent.cleanUpMap.set(path_, this.cleanUp);
		NeinthComponent.unLinkMap.set(path_, this.unLink);
	};
	get value() {
		return super.value;
	}
	/**
	 * @private
	 * @type {returnedValue}
	 */
	set value(newValue) {
		super.value = newValue;
		if (!this.instancePath) {
			return;
		}
		/**
		 * bypassing `PassiveSignal` assignment IDE;
		 */
		// @ts-expect-error
		NeinthComponent.getProxySignal(this.instancePath).value = newValue;
	}
	/**
	 * @private
	 * @type {Set<()=>Promise<void>>}
	 */
	unLinks = new Set();
	/**
	 * @private
	 * add cleanUp callback to be called onCleanUp event
	 * @param {(()=>Promise<void>)[]} callbacks
	 */
	onUnLink = (...callbacks) => {
		this.unLinks = this.unLinks.union(new Set(callbacks));
		for (let i = 0; i < callbacks.length; i++) {
			NeinthRuntime.onProcessFallbacks(callbacks[i]);
		}
	};
	/**
	 * @private
	 * @returns {void}
	 */
	unLink = () => {
		new PingUnique(`neinth.unLink:"${this.instancePath}"`, async () => {
			await NeinthRuntime.forLoopSet(this.unLinks, async (callback) => {
				await callback();
				NeinthRuntime.unRegisterProcessFallback(callback);
			});
		});
	};

	/**
	 * @private
	 * @type {Set<()=>Promise<void>>}
	 */
	cleanUps = new Set();
	/**
	 * @private
	 * add cleanUp callback to be called onCleanUp event
	 * @param {(()=>Promise<void>)[]} callbacks
	 */
	onCleanUp = (...callbacks) => {
		this.cleanUps = this.cleanUps.union(new Set(callbacks));
		for (let i = 0; i < callbacks.length; i++) {
			NeinthRuntime.onProcessFallbacks(callbacks[i]);
		}
	};
	/**
	 * @private
	 * trigger cleanUp event
	 * @returns {void}
	 */
	cleanUp = () => {
		new PingUnique(`neinth.cleanUp:"${this.instancePath}"`, async () => {
			await NeinthRuntime.forLoopSet(this.cleanUps, async (callback) => {
				await callback();
				NeinthRuntime.unRegisterProcessFallback(callback);
			});
		});
	};
	/**
	 * @private
	 * @template {returnedValue} returnedValue
	 * @param {()=>Promise<void|{value?:returnedValue, onCleanUp?:(()=>Promise<void>), onUnlink?:(()=>Promise<void>)}>} callback
	 * @returns {Promise<returnedValue>}
	 */
	withCleanUp = async (callback) => {
		const [result = {}, error] = await TryAsync(async () => {
			return await callback();
		});
		if (error) {
			console.error({ ...NeinthRuntime.parseError(error) });
			return undefined;
		}
		const { value = undefined, onCleanUp = undefined, onUnlink = undefined } = result;
		if (onCleanUp) {
			this.onCleanUp(async () => {
				const [_, error] = await TryAsync(onCleanUp);
				if (!error) {
					return;
				}
				console.error({ ...NeinthRuntime.parseError(error) });
			});
		}
		if (onUnlink) {
			this.onUnLink(async () => {
				const [_, error] = await TryAsync(onUnlink);
				if (!error) {
					return;
				}
				console.error({ ...NeinthRuntime.parseError(error) });
			});
		}
		return value;
	};
	/**
	 * - listen to `neinthInstance` `value` `changes`;
	 * @template {NeinthList} NeinthList
	 * @param {NeinthList} neintPath
	 * @param {NeinthList} thisPath
	 * @returns {PassiveSignal<getNeinth<NeinthList>>}
	 * - `PassiveSignal` can be listened by `Effect` by unwrapping `.value` `getter` inside `Effect` `callback`;
	 */
	static listenToNeinth = (neintPath, thisPath) => {
		NeinthRuntime.throwIfPathIsNotExist(neintPath, thisPath);
		return NeinthComponent.getProxySignal(neintPath);
	};
	/**
	 * @param {WorkersList} workersPath
	 * @param {NeinthList} thisPath
	 */
	static importWorker = (workersPath, thisPath) => {
		NeinthRuntime.throwIfPathIsNotExist(workersPath, thisPath);
		return DataWorkers.getProxySignal(workersPath);
	};
	/**
	 * @typedef {(this: NeinthComponent["handlers"])=>Promise<returnedValue>} neinthDefinitionType
	 */
	get handlers() {
		const this_ = this;
		const { withCleanUp } = this;
		const { normalizePath, resolveProjectPath, indentedString } = NeinthRuntime;
		return {
			/**
			 * - use as fallback when `error` occures, such as:
			 * >- `ChildProcess` `exited` due to some `error`;
			 * >- server instance `error`;
			 * >- `error` happens in a `tryCatch block`;
			 * - `neinth` will `reinstantiate` the current `neinthInstance` with all of it's functionality freshly cleanedup;
			 */
			runInstanceFallback: () => {
				NeinthRuntime.onAddOrChange(this_.instancePath);
			},
			/**
			 * @description
			 * - starts all line of multiline input with `indent`;
			 */
			indentedString,
			/**
			 * @description
			 * - replace `\` with `/`
			 */
			normalizePath,
			/**
			 * @description
			 * - generate `absolutePath` from `projectRoot` `relativePath`;
			 */
			resolveProjectPath,
			/**
			 * @description
			 * - file relative path from `projectRoot`;
			 */
			get instancePath() {
				return this_.instancePath;
			},
			/**
			 * - listen to `neinthInstance` `value` `changes`;
			 * @template {NeinthList} NeinthList
			 * @param {NeinthList} path_
			 * @returns {PassiveSignal<getNeinth<NeinthList>>}
			 * - `PassiveSignal` can be listened by `Effect` by unwrapping `.value` `getter` inside `Effect` `callback`;
			 */
			listenToNeinth: (path_) => NeinthComponent.listenToNeinth(path_, this.instancePath),
			/**
			 * @param {Object} a0
			 * @param {string} a0.relativePath
			 * - relative path(from project root) to be watch;
			 * @param {boolean} a0.addFileToSet
			 * - add file to `Set`;
			 * @param {boolean} a0.addDirToSet
			 * - add dir to `Set`;
			 * @param {BufferEncoding} [a0.encoding]
			 * - file encoding;
			 * - be consistent when using `neinth` `options` `synchronizeFiles` and this;
			 * @returns {void}
			 */
			generateWatcher: ({ relativePath, addDirToSet, addFileToSet, encoding = 'utf-8' }) => {
				const tempPath = this_.watcherPath;
				this.handlers.synchronizeFiles({
					id: `watcher:${relativePath}`,
					SetOfFilesInstance: new SetOfFiles({
						relativePathFromProjectRoot: tempPath,
						template: {
							string: `// @ts-check

import { NeinthWatcher } from 'neinth';

export default new NeinthWatcher({
  relativePath: '${relativePath}',
  addDirToSet: ${addDirToSet},
  addFileToSet: ${addFileToSet},
  encoding: '${encoding}',
});
`,
						},
						encoding: 'utf-8',
					}),
				});
			},
			/**
			 * @returns {PassiveSignal<NeinthWatcher["value"]>}
			 */
			listenToGeneratedWatcher: () => this_.handlers.listenToNeinth(this.watcherPath),
			/**
			 * - usefull for creating functional scope for long running process that might need to be cleaned up when file changes and saved in the developement;
			 * @template {returnedValue} returnedValue
			 * @param {()=>Promise<{value?:returnedValue, onCleanUp?:(()=>Promise<void>), onUnlink?:(()=>Promise<void>)}>} callback
			 * - `onCleanUp` callback will be `called` when:
			 * >- file `changes`;
			 * >- file `unlink`ed;
			 * >- file no longer export `neinthInstance` as `default`;
			 * - optional `onUnlink` callback will be `called` when:
			 * >- file `unlink`ed;
			 * >- file no longer export `neinthInstance` as `default`;
			 * @returns {Promise<returnedValue>}
			 */
			withCleanUp: async (callback) => await withCleanUp(callback),
			/**
			 * - create a local `Signal`;
			 * >- two way communication with `.value` `setter` and `getter`;
			 * - can be `autoSubscribed` when `SignalInstance.value` `getter` is unwrapped inside an `Effect` callback;
			 * @template V
			 * @param {V} value
			 * @returns {Signal<V>}
			 */
			newSignal: (value) => {
				const signal = new Signal(value);
				this_.onCleanUp(async () => {
					signal.unRef();
				});
				return signal;
			},
			/**
			 * - it is an `Effect`;
			 * - safely regenerate `Effect` refference when `unlink` or `changes` event is triggered;
			 * @param {(options:{onBefore$:(cleanerCallback:()=>Promise<void>)=>void})=>Promise<void>} callback
			 * - subscribes any unwrapped Signal refered inside the callback;
			 * - `options`:
			 * >- `onBefore$`: use this to register cleaner callback, it will be fired before `Effect` responding to any subscribed signal changes;
			 * >- useFull for simple unwrapper for `importWorker`, so when the worker file changes, you can use this as `cleanup` for previous `worker` definition by passing `importWorker.value.workerCleaner`;
			 * @returns {void}
			 */
			new$: (callback) => {
				/**
				 * @type {()=>Promise<void>}
				 */
				let cleanUp = undefined;
				/**
				 * @param {()=>Promise<void>} cleanerCallback
				 * @returns {void}
				 */
				const onBefore$ = (cleanerCallback) => {
					cleanUp = cleanerCallback;
				};
				withCleanUp(async () => {
					const effect = new $(async () => {
						if (cleanUp) {
							await cleanUp();
						}
						await callback({ onBefore$ });
					});
					return {
						onCleanUp: async () => {
							effect.remove$();
						},
					};
				});
			},
			/**
			 * - is an `Effect`;
			 * @template {returnedValue} returnedValue
			 * @template {NeinthComponent} neinthInstance
			 * @param {Object} options
			 * @param {$mode} options.mode
			 * - `default` `mostRecent`:
			 * >- only react to `last call`, doesn't cancel already `running call`;
			 * - `fifo`:
			 * >- react to all `call` with `First In First Out` approach;
			 * @param {(options:{onBefore$:(cleanerCallback:()=>Promise<void>)=>void})=>Promise<neinthInstance["returnedValue"]>} options.derived
			 * - `options`:
			 * >- `onBefore$`: use this to register cleaner callback, it will be fired before `Effect` responding to any subscribed signal changes;
			 * - unwrapped `SignalInstance.value` `getter` inside the `value` will be `autoSubscribed`;
			 * - returned value will notify all of this `neinthInstance`'s `subscribers`;
			 * @param {neinthInstance} [options.neinthInstance]
			 * - purely for `typehinting` for updating `returnedValue`;
			 * @returns {neinthInstance["returnedValue"]}
			 * - returned value should be used as `neinth.asyncHandler` `return` `returnedValue`;
			 */
			updateValue$: ({ derived, mode = 'mostRecent' }) => {
				const { new$, updateValue } = this_.handlers;
				new$(async (options) => {
					updateValue({
						value: await derived(options),
						mode,
						neinthInstance: this_,
					});
				});
				return NeinthComponent.getProxySignal(this_.instancePath).nonReactiveValue;
			},
			/**
			 * - `notify` all `neitnhInstance` subscriber with new value;
			 * @template {NeinthComponent} neinthInstance
			 * @param  {Object} options
			 * @param  {neinthInstance["returnedValue"]} options.value
			 * @param {$mode} options.mode
			 * - `default` `mostRecent`:
			 * >- only `notify` changes to `last call`, doesn't cancel already `running call`;
			 * - `fifo`:
			 * >- `notify` changes to all `call` with `First In First Out` approach;
			 * @param {neinthInstance} options.neinthInstance
			 * - purely for `typehinting` for updating `returnedValue`;
			 */
			updateValue: ({ value, mode }) => {
				const handler = async () => {
					this_.value = value;
				};
				switch (mode) {
					case 'fifo':
						new PingFIFO(handler);
						break;
					case 'mostRecent':
					default:
						new PingUnique(`neinth.updateValue:"${this_.instancePath}"`, handler);
						break;
				}
			},
			/**
			 * - constructor helper for `synchronizeFiles` `SetOfFilesInstance`;
			 */
			SetOfFiles,
			/**
			 * - dynamically `synchronize`(`generate` and `unlink`) `files`;
			 * -neinth provide no individual fileWritter as you might need to manage write and unlink upon cleanup, and it can be quickly unmanageable if the file is then be written again anyway;
			 * @param {Object} arg0
			 * @param {string} arg0.id
			 * - should be hard coded and static to be correctly managed.
			 * - must be unique inside the `neinth.asyncHandler`;
			 * @param {SetOfFiles} arg0.SetOfFilesInstance
			 * - use `SetOfFiles` to generate the `SetInstance`
			 * @returns {void}
			 */
			synchronizeFiles: ({ id, SetOfFilesInstance }) => {
				SetOfFiles.synchronizeFiles(this_.instancePath, withCleanUp, id, SetOfFilesInstance);
			},
			/**
			 * - listen to `StdIn`;
			 */
			listenToStdIn: () => StdInHandler.listenToStdIn(),
			/**
			 * - run `vivth` queue using `NewUniquePing`, `errors` on `callback` will be safely escaped;
			 * @param {string} id
			 * - id are global, if you want to scope it inside this `NeinthComponent`, you can prefix it by using `this.instancePath`;
			 * @param {()=>Promise<void>} callback
			 * - don't unwrapp `SignalInstance.value` inside this `callback`, as it will be out of scope;
			 * @param {number} [debounceMS]
			 */
			safeUniquePing: (id, callback, debounceMS = 0) => {
				new PingUnique(
					id,
					async () => {
						const [_, error] = await TryAsync(callback);
						if (!error) {
							return;
						}
						console.error({ ...NeinthRuntime.parseError(error) });
					},
					debounceMS
				);
			},
			/**
			 * - convert `Buffer` to `Array<string>`
			 */
			bufferToStrings: StdInHandler.bufferToStrings,
			/**
			 * - convert Buffer into `Array<string>`, with `namespace` as validation;
			 */
			bufferToCLIStrings: StdInHandler.bufferToCLIStrings,
			/**
			 * - get `shared` data for current file;
			 * - can be used to get previous `shared` `value`;
			 * - is not reactive, should only be used as:
			 * >- manual shared data between `changes`, or `unlink`;
			 * >- manual `withCleanUp` should be setted up for both `event`s;
			 * @template {NeinthComponent} instance
			 * @param {instance} _
			 * - purely for `typehinting` for hadnling `sharedData`;
			 * @returns {instance["sharedType"]}
			 */
			getSharedData: (_) => {
				return NeinthComponent.getShared(this.instancePath);
			},
			/**
			 * - set `shared` data for current file;
			 * - can be sent to next `shared` `getter`;
			 * - is not reactive, should only be used as:
			 * >- manual shared data between `changes`, or `unlink`;
			 * >- manual `withCleanUp` should be setted up for both `event`s;
			 * @template {NeinthComponent} instance
			 * @param {instance} _
			 * - purely for `typehinting` for hadnling `sharedData`;
			 * @param {instance["sharedType"]} newValue
			 * @returns {void}
			 */
			setSharedData: (_, newValue) => {
				NeinthComponent.setShared(this_.instancePath, newValue);
			},
			/**
			 * @param {WorkersList} workersPath
			 * @returns {PassiveSignal<WorkerContract>}
			 * - it is a `Signal`, you need to unwrap the `.value` `getter` on `new$` or `updateValue$` `callback` to get `WorkerContract` instance;
			 */
			importWorker: (workersPath) => NeinthComponent.importWorker(workersPath, this_.instancePath),
		};
	}
}
