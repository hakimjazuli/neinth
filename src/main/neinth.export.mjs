// @ts-check

import chokidar, { FSWatcher } from 'chokidar';
import {
	existsSync,
	readdirSync,
	readFileSync,
	rmdirSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'fs';
import { dirname, join } from 'path';
import { New$, NewPingUnique, NewSignal, Signal, trySync } from 'vivth';
import { runtime } from '../runtime.mjs';
import { $ } from 'vivth';
import { infos } from 'neinth';

/**
 * @description
 * - export `neinth` instance as default on your `neinthConfig` `folderPath` (only supports `.mjs` file extention);
 * ```js
 * // @ts-check
 * import { neinth } from 'neinth';
 *
 * export default new neinth ( async ({ ...options }) => {
 * 	// your code;
 * 	// might return anything,
 * 	// which then can be listened to
 * 	// from other `neinth` instance
 * 	// by using `importNeinth`;
 * })
 * ```
 * - `options` are collections of `functions` that are essential and integrated to the `neinth` functionalities such as it's auto `cleanUp`:
 * >- `writeFile`: safely write files and monitor it's produced filepath, if the name changed for any reason, the old one will be removed;
 * >- `stringWithIndent`: replace all new line with given `indent`, usefull to generate code that written to the language where indentation dictates the interpreter/compiler direction (eg. python);
 * >- `normalizePath`: replace path back-slash '\\' to forward-slash '/';
 * >- `relativeToProjectAbsolute`: as it is named, and also auto process the string with `normalizePath`;
 * >- `importNeinth`: generate `Signal` of returned value of the imported neinth callback, at first the value is set to be `false`;
 * >- `getInfos`: generate `Signal<Set<infos>>`, at first the value is set to be `false`;
 * >- `onCleanUp`: add callback to `neinth` `cleanUp` event;
 * - `cleanUp` event are called during changes of `neinth` instance file, including `add`, `change` and `unlink`;
 * - `neinth` callback argument is basically an effect (vivth $), that will autosubscribe to the `SignalInstance.value` `getter` you access inside it;
 * - further documentation and example of use cases will be posted at [html-first/neinth](https://html-first.bss.design/)
 */
/**
 * @template DataType
 * @type {Signal<false|DataType>}
 */
export class neinth extends Signal {
	/**
	 * @typedef {import('neinth').neinthList} neinthPath
	 */
	/**
	 * @param {(neinthInstance:neinth["options"])=>Promise<DataType>} handler
	 */
	constructor(handler) {
		super(false);
		/**
		 * @private
		 * @type {$}
		 */
		this.effects.add(
			New$(async () => {
				this.currentWritten.clear();
				this.value = await handler(this.options);
				this.cleanUpWritenFiles();
				this.prevWritten = new Set(this.currentWritten);
			})
		);
	}
	get options() {
		const this_ = this;
		return {
			/**
			 * @param {Object} options
			 * @param {string} options.relativePathFromProjectRoot
			 * @param {Object} options.content
			 * @param {string} options.content.string
			 * @param {{[key:string]:string}} [options.content.modifier]
			 * @param { BufferEncoding | null | undefined } [options.encoding]
			 * @returns {void}
			 */
			writeFile: ({ relativePathFromProjectRoot, content, encoding = 'utf8' }) => {
				this_.currentWritten.add(relativePathFromProjectRoot);
				const fullPath = join(runtime.projectRoot, relativePathFromProjectRoot);
				const contentModifier = content.modifier ?? {};
				let content_ = content.string;
				if (contentModifier) {
					for (const oldString in contentModifier) {
						const newString = contentModifier[oldString];
						content_ = content_.replace(new RegExp(oldString, 'gm'), newString);
					}
				}
				runtime.writeFileSafe(fullPath, content_, encoding);
			},
			/**
			 * @param {string} string
			 * @param {string} indent
			 * @returns {string}
			 */
			stringWithIndent: (string, indent) => string.replace(/^/g, indent),
			normalizePath: runtime.normalizePath,
			relativeToProjectAbsolute: runtime.relativeToProjectAbsolute,
			/**
			 * @template {neinthPath} neinthPath
			 * @param {neinthPath} neinthPath
			 * @return {Signal<false|import('neinth').getNeinth<neinthPath>>}
			 */
			importNeinth: (neinthPath) => {
				if (!neinth.mappedSignals.has(neinthPath)) {
					neinth.mappedSignals.set(neinthPath, NewSignal(false));
				}
				const signal = neinth.mappedSignals.get(neinthPath);
				// @ts-expect-error
				return signal;
			},
			/**
			 * @param {string} relativePathFromProjectRoot
			 * @param {{file:boolean, dir:boolean}} mode
			 * @param {BufferEncoding} [encoding]
			 * @returns {Signal<false|Set<infos>>}
			 */
			getInfos: (relativePathFromProjectRoot, { file, dir }, encoding = 'utf8') => {
				if (neinth.mappedInfos.has(relativePathFromProjectRoot)) {
					return neinth.mappedInfos.get(relativePathFromProjectRoot);
				}
				const absolutePath = join(runtime.projectRoot, relativePathFromProjectRoot);
				/**
				 * @type {Signal<false|Set<infos>>}
				 */
				const signal = NewSignal(false);
				neinth.mappedInfos.set(relativePathFromProjectRoot, signal);
				this_.signals.add(signal);
				const watcher = chokidar.watch(absolutePath);
				neinth.watchers.set(relativePathFromProjectRoot, watcher);
				watcher.on('all', () => {
					NewPingUnique(`neinth.getInfos${relativePathFromProjectRoot}`, async () => {
						signal.value = runtime.getInfos(absolutePath, { file, dir }, encoding);
					});
				});
				this_.cleanUps.add(() => {
					watcher.removeAllListeners();
					watcher.unwatch(relativePathFromProjectRoot);
					neinth.watchers.delete(relativePathFromProjectRoot);
				});
				return signal;
			},
			/**
			 * @param {()=>void} callback
			 */
			onCleanUp: (callback) => {
				this_.cleanUps.add(callback);
			},
		};
	}
	/**
	 * @private
	 * @type {Map<string, Signal<false|Set<infos>>>}
	 */
	static mappedInfos = new Map();
	/**
	 * @private
	 * @type {Set<()=>void>}
	 */
	cleanUps = new Set();
	/**
	 * have no value, only for typehinting;
	 * @type {DataType}
	 */
	DataType;
	/**
	 * @private
	 * @type {Set<Signal>}
	 */
	signals = new Set();
	/**
	 * @private
	 * @type {Map<import('fs').PathLike, FSWatcher>}
	 */
	static watchers = new Map();
	/**
	 * @private
	 * @type {Set<$>}
	 */
	effects = new Set();
	/**
	 * @private
	 * @type {Map<neinthPath, neinth>}
	 */
	static mappedInstance = new Map();
	/**
	 * @private
	 * @type {()=>void}
	 */
	static updateNeinthList = () => {
		NewPingUnique('updateNeinthList', async () => {
			const corePath = runtime.corePath;
			const projectRoot = runtime.projectRoot;
			const listPath = join(corePath, 'list', 'neinthList.mjs');
			let [_, error] = trySync(() => {
				const neinthNames_ = [];
				const types_ = [];
				neinth.mappedInstance.forEach((_, path) => {
					neinthNames_.push(path);
					types_.push(
						`neinthPath extends'${path}'?import('${runtime.normalizePath(
							join(projectRoot, path)
						)}')['default']['DataType']`
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
 * @typedef {'${neinthNames}'} neinthList
 */
/**
 * @template {neinthList} neinthPath
 * @typedef {${types}} getNeinth;
 */
`;
				if (readFileSync(listPath, { encoding }) === content) {
					// console.info({
					// 	listPath,
					// 	skipped: "neinthList's content unchanged",
					// 	timeStamp: Date.now(),
					// });
					return;
				}
				writeFileSync(listPath, content, { encoding });
				console.info({
					listPath,
					success: 'to write `typehint` `neinthPath` at `listPath`',
					timeStamp: Date.now(),
				});
			});
			if (!error) {
				return;
			}
			console.error({
				error,
				listPath,
				failed: 'to write `neinthList` at `listPath`',
				timeStamp: Date.now(),
			});
		});
	};
	/**
	 * @type {Map<neinthPath, Signal<false|import('neinth').getNeinth<neinthPath>>>}
	 */
	static mappedSignals = new Map();

	/**
	 * @private
	 * @param {neinthPath} neinthPath
	 * @return {neinth|undefined}
	 */
	static getPrevInstance = (neinthPath) => neinth.mappedInstance.get(neinthPath);
	/**
	 * @private
	 * @type {Set<import('fs').PathLike>}
	 */
	prevWritten = new Set();
	/**
	 * @private
	 * @type {Set<import('fs').PathLike>}
	 */
	currentWritten = new Set();
	/**
	 * @private
	 * @param {boolean} clearAll
	 * @returns {void}
	 */
	cleanUpWritenFiles = (clearAll = false) => {
		this.prevWritten.forEach((path_) => {
			// @ts-expect-error
			const fullPath = join(runtime.projectRoot, path_);
			const isFileExist = existsSync(fullPath) && statSync(fullPath).isFile();
			if (!isFileExist) {
				this.prevWritten.delete(path_);
				return;
			}
			if (!clearAll && this.currentWritten.has(path_)) {
				return;
			}
			try {
				rmSync(fullPath);
				console.info({ fullPath, success: 'remove `fullPath`', timeStamp: Date.now() });
				this.prevWritten.delete(path_);
				neinth.deleteEmptyDir(dirname(fullPath));
			} catch (error) {
				console.error({ error, fullPath, failed: 'remove `fullPath`', timeStamp: Date.now() });
			}
		});
	};
	/**
	 * @param {string} dirPath
	 */
	static deleteEmptyDir = (dirPath) => {
		trySync(() => {
			const files = readdirSync(dirPath);
			if (files.length === 0) {
				rmdirSync(dirPath);
				neinth.deleteEmptyDir(dirname(dirPath));
			}
		});
		// if (error) {
		// 	// ignore Error
		// }
	};
	/**
	 * @private
	 * @param {neinth} prevInstance
	 * @returns {void}
	 */
	static unref = (prevInstance) => {
		prevInstance.unRef();
		prevInstance.cleanUps.forEach((cleanUp) => {
			cleanUp();
		});
		prevInstance.signals.forEach((signal) => {
			signal.unRef();
		});
		prevInstance.effects.forEach((effect) => {
			effect.remove$();
		});
	};
	/**
	 * @private
	 * @param {neinthPath} neinthPath
	 * @param {neinth} currentInstance
	 * @returns {void}
	 */
	static remap = (neinthPath, currentInstance) => {
		currentInstance.effects.add(
			New$(async () => {
				currentInstance.options.importNeinth(neinthPath).value = currentInstance.value;
			})
		);
		currentInstance.cleanUpWritenFiles();
		neinth.mappedInstance.set(neinthPath, currentInstance);
	};
	/**
	 * @param {neinthPath} neinthPath
	 * @param {neinth|false} currentInstance
	 * @returns {Promise<void>}
	 */
	static onAddOrChange = async (neinthPath, currentInstance) => {
		const prevInstance = neinth.getPrevInstance(neinthPath);
		const isPrevNeinth = prevInstance instanceof neinth;
		const isCurrentNeinth = currentInstance instanceof neinth;
		if (isPrevNeinth !== isCurrentNeinth) {
			neinth.updateNeinthList();
			if (isPrevNeinth && !isCurrentNeinth) {
				neinth.unref(prevInstance);
				neinth.mappedInstance.delete(neinthPath);
			} else if (!isPrevNeinth && isCurrentNeinth) {
				neinth.remap(neinthPath, currentInstance);
			}
		} else {
			if (isPrevNeinth && isCurrentNeinth) {
				currentInstance.prevWritten = new Set([
					...currentInstance.prevWritten,
					...prevInstance.currentWritten,
				]);
				neinth.unref(prevInstance);
				neinth.remap(neinthPath, currentInstance);
			} else if (!isPrevNeinth && !isCurrentNeinth) {
			}
		}
	};
	/**
	 * @param {neinthPath} neinthPath
	 * @returns {Promise<void>}
	 */
	static onUnLink = async (neinthPath) => {
		const prevInstance = neinth.getPrevInstance(neinthPath);
		if (!(prevInstance instanceof neinth)) {
			return;
		}
		neinth.updateNeinthList();
		neinth.unref(prevInstance);
	};
}
