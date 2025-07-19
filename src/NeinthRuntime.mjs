// @ts-check

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	realpathSync,
	statSync,
	writeFileSync,
} from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

import chokidar from 'chokidar';
import { NewPingFIFO, tryAsync, trySync } from 'vivth';

import { DataWorkers } from './worker/DataWorkers.mjs';
import { Infos } from './helpers/Infos.mjs';
import { NeinthComponent } from './neinth/NeinthComponent.mjs';

export class NeinthRuntime {
	/**
	 * @typedef {import('fs').PathLike} PathLike
	 */
	/**
	 * @param {PathLike} path_
	 * @returns {boolean}
	 */
	static isPathValidToImports = (path_) => !basename(path_.toString()).startsWith('-');
	/**
	 * @type {number}
	 */
	static debounceMSForUpdateList = undefined;
	/**
	 * @typedef {import('neinth').NeinthList} NeinthList
	 */
	/**
	 * @param {string} devDebounce
	 */
	constructor(devDebounce) {
		NeinthRuntime.debounceMSForUpdateList = devDebounce ? 300 : 0;
		NeinthRuntime.run();
	}
	/**
	 * @param {string} relativePath
	 * @param {NeinthList} sourcePath
	 */
	static throwIfPathIsNotExist = (relativePath, sourcePath) => {
		const absolutePath = NeinthRuntime.resolveProjectPath(relativePath);
		const [result, error] = trySync(() => statSync(absolutePath).isFile());
		if (result === true) {
			return;
		}
		if (error) {
			throw error;
		}
		throw Object.assign(
			new Error(`"${sourcePath}" tries to listen to non existent path "${absolutePath}"`),
			{ cause: error ?? undefined, absolutePath }
		);
	};

	/**
	 * - convert '\' to '/'
	 * @param {string} path_
	 * @returns {string}
	 */
	static normalizePath = (path_) => {
		return path_.replace(/\\/g, '/');
	};
	/**
	 * @type {string}
	 */
	static projectRoot;
	/**
	 * @type {string}
	 */
	static corePath;
	/**
	 * @template S
	 * @param {Set<S>} set
	 * @param {(setMember:S)=>Promise<any>} callback
	 * @param {(error:Error)=>void} [logErrorCallback]
	 * @returns {Promise<void>}
	 */
	static forLoopSet = async (set, callback, logErrorCallback = undefined) => {
		for (const member of set) {
			try {
				await callback(member);
			} catch (error) {
				if (!logErrorCallback) {
					return;
				}
				logErrorCallback(error);
			}
		}
	};
	/**
	 * @type {Set<()=>void>}
	 */
	static #fallbackCallbacks = new Set();
	/**
	 * @param {()=>void} callback
	 * @returns {void}
	 */
	static onProcessFallbacks = (callback) => {
		NeinthRuntime.#fallbackCallbacks.add(async () => {
			await callback();
			NeinthRuntime.unRegisterProcessFallback(callback);
		});
	};
	/**
	 * @param {()=>void} callback
	 * @returns {void}
	 */
	static unRegisterProcessFallback = (callback) => {
		NeinthRuntime.#fallbackCallbacks.delete(callback);
	};

	static #hasProcessExited = false;
	static processFallback = async () => {
		if (NeinthRuntime.#hasProcessExited) {
			return;
		}
		NeinthRuntime.#hasProcessExited = true;
		await NeinthRuntime.forLoopSet(NeinthRuntime.#fallbackCallbacks, async (callback) => {
			await tryAsync(async () => {
				await callback();
			});
		});
		process.exit();
	};
	static #exitEvents = [
		'exit',
		'uncaughtException',
		'unhandledRejection',
		'beforeExit',
		'SIGHUP',
		'SIGQUIT',
	];
	/**
	 * @returns {void}
	 */
	static #registerExitEvents = () => {
		const exitEvents = NeinthRuntime.#exitEvents;
		const exitCallback = NeinthRuntime.processFallback;
		for (let i = 0; i < exitEvents.length; i++) {
			process.on(exitEvents[i], exitCallback);
		}
	};
	static {
		NeinthRuntime.projectRoot = NeinthRuntime.normalizePath(
			join(process.env.INIT_CWD || process.cwd())
		);
		NeinthRuntime.corePath = realpathSync(fileURLToPath(new URL('./', import.meta.url)));
		NeinthRuntime.#registerExitEvents();
	}
	/**
	 * @param {Object} arg0
	 * @param {string} arg0.string
	 * @param {string} [arg0.indent]
	 * - default : `\t`
	 * @returns {string}
	 */
	static indentedString = ({ string, indent = '\t' }) => string.replace(/^/gm, indent);
	/**
	 * @param {string} path_
	 * @returns {string}
	 * - fullPath
	 */
	static resolveProjectPath = (path_) => {
		return NeinthRuntime.normalizePath(join(NeinthRuntime.projectRoot, path_));
	};
	/**
	 * @param {string} relativePathToProjectRoot
	 * @return {Promise<any>}
	 */
	static importModuleDefault = async (relativePathToProjectRoot) => {
		if (!NeinthRuntime.isPathValidToImports(relativePathToProjectRoot)) {
			return undefined;
		}
		const importPath = NeinthRuntime.resolveProjectPath(relativePathToProjectRoot);
		if (!existsSync(importPath)) {
			console.error({
				importPath,
				failed: "`importPath` doesn't exist",
				timeStamp: Date.now(),
			});
			return undefined;
		}
		const dynamicPath = `${importPath}?${Date.now()}`;
		let [importedModule, error] = await tryAsync(async () => {
			return (await import(`file://${dynamicPath}`)).default;
		});
		if (!error) {
			return importedModule;
		}
		[importedModule, error] = await tryAsync(async () => {
			return (await import(dynamicPath)).default;
		});
		if (!error) {
			return importedModule;
		}
		console.error({
			error: NeinthRuntime.parseError(error),
			importedModule,
			path: relativePathToProjectRoot,
			dynamicPath,
			message2: {
				general: '`importedModule` is badly formed',
				default: 'have no exported `default`',
			},
			timeStamp: Date.now(),
		});
		return undefined;
	};
	/**
	 * @param {Error} error
	 * @returns {{name: string,   cause: unknown,   message: string,   stack: string,}}
	 */
	static parseError = (error) => {
		const { name, cause, message, stack } = error;
		return { name, cause, message, stack };
	};
	/**
	 * @private
	 * @param {string} filePath
	 * @param {string} content
	 * @param {BufferEncoding | null | undefined} [encoding]
	 * @returns {void}
	 */
	static writeToFile = (filePath, content, encoding) => {
		writeFileSync(filePath, content, { encoding });
		console.info({ filePath, success: 'write file to `filePath`', timeStamp: Date.now() });
	};
	/**
	 * @param {string} filePath
	 * @param {string} content
	 * @param {BufferEncoding | null | undefined} [encoding]
	 * @returns {void}
	 */
	static writeFileSafe = (filePath, content, encoding = 'utf8') => {
		let [_, error] = trySync(() => {
			const dir = dirname(filePath);
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
			if (!existsSync(filePath)) {
				NeinthRuntime.writeToFile(filePath, content, encoding);
				return;
			}
			const stats = statSync(filePath);
			if (!stats.isFile()) {
				console.error({
					error: NeinthRuntime.parseError(error),
					filePath,
					failed: stats.isDirectory() ? '`filePath` is a directory' : '`filePath` is not a file',
					timeStamp: Date.now(),
				});
				return;
			}
			if (NeinthRuntime.checkContent(filePath, encoding, content)) {
				// console.info({ filePath, skipped: 'content unchanged', timeStamp: Date.now() });
				return;
			}
			NeinthRuntime.writeToFile(filePath, content, encoding);
		});
		if (error) {
			console.error({
				error,
				filePath,
				failed: 'write file to `filePath`',
				timeStamp: Date.now(),
			});
		}
	};
	/**
	 * @private
	 * @param {string} str
	 * @returns {string}
	 */
	static normalizeContent = (str) => str.replace(/[\r\n]+|\s+$/g, '').trim();
	/**
	 * @private
	 * @param {string} path
	 * @param {BufferEncoding} encoding
	 * @param {string} currentContent
	 * @returns {boolean}
	 */
	static checkContent = (path, encoding, currentContent) => {
		const previouseString = NeinthRuntime.normalizeContent(readFileSync(path, { encoding }));
		currentContent = currentContent = NeinthRuntime.normalizeContent(currentContent);
		return previouseString === currentContent;
	};
	/**
	 * @param {string} currentPath
	 * @param {{file:boolean, dir:boolean}} mode
	 * @param {BufferEncoding} [encoding]
	 * @param {Set<Infos>} [result]
	 * @returns {Set<Infos>}
	 */
	static getInfos = (currentPath, { file, dir }, encoding = 'utf8', result = new Set()) => {
		const [_, error] = trySync(() => {
			if (statSync(currentPath).isFile()) {
				const entries = readdirSync(dirname(currentPath), { withFileTypes: true });
				const fileName = basename(currentPath);
				for (const entry of entries) {
					if (entry.name !== fileName) {
						continue;
					}
					result.add(new Infos(entry, encoding));
					return;
				}
			}
			const entries = readdirSync(currentPath, { withFileTypes: true });
			for (const entry of entries) {
				const entryPath = join(currentPath, entry.name);
				if (entry.isDirectory()) {
					if (dir) {
						result.add(new Infos(entry, encoding));
					}
					NeinthRuntime.getInfos(entryPath, { file, dir }, encoding, result);
				}
				if (entry.isFile() && file) {
					result.add(new Infos(entry, encoding));
				}
			}
		});
		if (error) {
			console.error({
				error: NeinthRuntime.parseError(error),
				currentPath,
				message: 'failed to `read` dir `currentPath`',
			});
		}
		return result;
	};
	/**
	 * @private
	 * @type {string}
	 */
	static folderPath = './neinth-src';
	/**
	 * @private
	 */
	static run = async () => {
		let watchPath;
		let [_, error] = await tryAsync(async () => {
			watchPath = join(NeinthRuntime.projectRoot, NeinthRuntime.folderPath);
			chokidar
				.watch(NeinthRuntime.folderPath)
				.on('unlink', NeinthRuntime.onUnlink)
				.on('add', NeinthRuntime.onAddOrChange)
				.on('change', NeinthRuntime.onAddOrChange);
			console.info({
				watchPath,
				info: 'watching `watchPath`',
				timeStamp: Date.now(),
			});
		});
		if (error) {
			console.error({
				error: NeinthRuntime.parseError(error),
				watchPath,
				failed: 'to watch `watchPath`',
				timeStamp: Date.now(),
			});
		}
	};
	/**
	 * @param {PathLike|NeinthList} path_
	 * @param {import('fs').Stats} [_]
	 * @returns {void}
	 */
	static onUnlink = (path_, _) =>
		NewPingFIFO(async () => {
			// @ts-expect-error
			path_ = NeinthRuntime.normalizePath(path_);
			// @ts-expect-error
			if (DataWorkers.isValidPath(path_)) {
				// @ts-expect-error
				DataWorkers.unlinkProxySignal(path_);
				return;
			}
			// @ts-expect-error
			NeinthComponent.unlinkProxySignal(path_);
		});

	/**
	 * @param {PathLike|NeinthList} path_
	 * @param {import('fs').Stats} [_]
	 * @returns {void}
	 */
	static onAddOrChange = (path_, _) =>
		NewPingFIFO(async () => {
			// @ts-expect-error
			path_ = NeinthRuntime.normalizePath(path_);
			// @ts-expect-error
			if (DataWorkers.isValidPath(path_)) {
				// @ts-expect-error
				DataWorkers.addProxySignal(path_);
				return;
			}
			const importedFile = await NeinthRuntime.importModuleDefault(path_);
			if (importedFile && importedFile instanceof NeinthComponent) {
				// @ts-expect-error
				await NeinthComponent.addProxySignal(path_, importedFile);
				return;
			}
			// @ts-expect-error
			NeinthComponent.unlinkProxySignal(path_);
		});
}
