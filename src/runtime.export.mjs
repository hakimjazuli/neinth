// @ts-check

import chokidar from 'chokidar';
import { fileURLToPath } from 'url';
import {
	readdirSync,
	readFileSync,
	realpathSync,
	writeFileSync,
	existsSync,
	mkdirSync,
	statSync,
} from 'fs';
import { NewPingUnique, tryAsync, trySync } from 'vivth';
import { neinth } from './main/neinth.export.mjs';
import { join, dirname } from 'path';
import { infos } from './helpers/infos.export.mjs';

export class runtime {
	/**
	 * @typedef {import('neinth').neinthList} neinthPath
	 */
	/**
	 * @type {string}
	 */
	static projectRoot;
	/**
	 * @param {string} path_
	 * @returns {string}
	 */
	static relativeToProjectAbsolute = (path_) => {
		return runtime.normalizePath(join(runtime.projectRoot, path_).replace(/\\/g, '/'));
	};
	/**
	 * convert '\' to '/'
	 * @param {string} path_
	 * @returns {string}
	 */
	static normalizePath = (path_) => path_.replace(/\\/g, '/');
	/**
	 * @param {string} relativePathToProjectRoot
	 * @return {Promise<any>}
	 */
	static importModuleDefault = async (relativePathToProjectRoot) => {
		const importPath = runtime.normalizePath(join(runtime.projectRoot, relativePathToProjectRoot));
		if (!existsSync(importPath)) {
			console.error({ importPath, failed: "`importPath` doesn't exist", timeStamp: Date.now() });
			return;
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
			error,
			importedModule,
			path: relativePathToProjectRoot,
			message: {
				general: '`importedModule` is badly formed',
				default: 'have no exported `default`',
			},
			timeStamp: Date.now(),
		});
		return undefined;
	};
	/**
	 * @type {string}
	 */
	static corePath;
	static {
		runtime.projectRoot = runtime.normalizePath(join(process.env.INIT_CWD || process.cwd()));
		runtime.corePath = realpathSync(fileURLToPath(new URL('./', import.meta.url)));
	}
	constructor() {
		runtime.run();
	}
	/**
	 * @private
	 * @type {string}
	 */
	static folderPath = './neinth-src';
	/**
	 * @private
	 * @returns {Promise<void>}
	 */
	static run = async () => {
		let watchPath;
		let [_, error] = await tryAsync(async () => {
			watchPath = join(runtime.projectRoot, runtime.folderPath);
			chokidar
				.watch(runtime.folderPath)
				.on('unlink', runtime.onUnlink)
				.on('add', runtime.onAddOrChange)
				.on('change', runtime.onAddOrChange);
			console.info({
				watchPath,
				info: 'watching `watchPath`',
				timeStamp: Date.now(),
			});
		});
		if (error) {
			console.error({ error, watchPath, failed: 'to watch `watchPath`', timeStamp: Date.now() });
		}
	};
	/**
	 * @param {neinthPath} path_
	 * @param {import('fs').Stats} [_]
	 * @returns {void}
	 */
	static onAddOrChange = (path_, _) => {
		setTimeout(() => {
			NewPingUnique(path_, async () => {
				// @ts-expect-error
				path_ = runtime.normalizePath(path_);
				const importedModule = await runtime.importModuleDefault(path_);
				neinth.onAddOrChange(path_, importedModule);
			});
		}, 100);
	};
	/**
	 * @private
	 * @param {neinthPath} path_
	 * @param {import('fs').Stats} [_]
	 * @returns {void}
	 */
	static onUnlink = (path_, _) => {
		NewPingUnique(path_, async () => {
			// @ts-expect-error
			neinth.onUnLink(runtime.normalizePath(path_));
		});
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
			if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
			const writeToFile = () => {
				writeFileSync(filePath, content, { encoding });
				console.info({ filePath, success: 'write file to `filePath`', timeStamp: Date.now() });
			};
			if (!existsSync(filePath)) {
				writeToFile();
				return;
			}
			const stats = statSync(filePath);
			if (!stats.isFile()) {
				console.error({
					filePath,
					failed: stats.isDirectory() ? '`filePath` is a directory' : '`filePath` is not a file',
					timeStamp: Date.now(),
				});
				return;
			}
			if (readFileSync(filePath, { encoding }) === content) {
				// console.info({ filePath, skipped: 'content unchanged', timeStamp: Date.now() });
				return;
			}
			writeToFile();
		});
		if (error) {
			console.error({ error, filePath, failed: 'write file to `filePath`', timeStamp: Date.now() });
		}
	};
	/**
	 * @param {string} currentPath
	 * @param {{file:boolean, dir:boolean}} mode
	 * @param {BufferEncoding} [encoding]
	 * @param {Set<infos>} [result]
	 * @returns {Set<infos>}
	 */
	static getInfos = (currentPath, { file, dir }, encoding = 'utf8', result = new Set()) => {
		const [_, error] = trySync(() => {
			const entries = readdirSync(currentPath, { withFileTypes: true });
			for (const entry of entries) {
				const entryPath = join(currentPath, entry.name);
				if (entry.isDirectory()) {
					if (dir) {
						result.add(new infos(entry, encoding));
					}
					runtime.getInfos(entryPath, { file, dir }, encoding, result);
				}
				if (entry.isFile() && file) {
					result.add(new infos(entry, encoding));
				}
			}
		});
		if (error) {
			console.error({ error, currentPath, message: 'failed to `read` dir `currentPath`' });
		}
		return result;
	};
}
