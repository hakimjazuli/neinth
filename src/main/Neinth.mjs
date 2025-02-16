// @ts-check

import chokidar from 'chokidar';
import { dirname, join } from 'path';
import { rmSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { neinthManage } from './neinthManage.export.mjs';
import { _Queue, _QueueObject } from '@html_first/simple_queue';
import { neinth } from './neinth.export.mjs';
import { Q } from '../queue/Q.mjs';

export class Neinth {
	/**
	 * @type {Neinth}
	 */
	static __;
	constructor() {
		if (Neinth.__ instanceof Neinth) {
			console.warn({
				singleton: 'this class is a singleton',
				returns: 'first generated instance of Neinth',
			});
			return this;
		}
		Neinth.__ = this;
		this.run();
	}
	/**
	 * @private
	 * @type {string}
	 */
	basePath_;
	/**
	 * @type {string}
	 */
	get basePath() {
		if (!this.basePath_) {
			this.basePath_ = process.env.INIT_CWD || process.cwd();
		}
		return this.basePath_;
	}
	/**
	 * @private
	 * @type {string}
	 */
	configName = 'neinth.config.mjs';
	/**
	 * @type {Map<string, Set<()=>Promise<void>>>}
	 */
	static sideEffects = new Map();
	/**
	 * @param {string} path
	 * @param {neinth} neinthInstance
	 * @param {string} mainFilePath
	 * @returns {Promise<any>}
	 */
	static import = async (path, neinthInstance, mainFilePath) => {
		const { resume } = await Q.unique(path);
		let ret_;
		try {
			ret_ = (await import(`file://${path}?${Date.now()}`)).default;
		} catch (error) {
			try {
				ret_ = (await import(`${path}?${Date.now()}`)).default;
			} catch (error) {
				console.error({ error, message: 'unable to import with `nonCachedImport`' });
				resume();
				return;
			}
		}
		if (!Neinth.sideEffects.has(path)) {
			Neinth.sideEffects.set(path, new Set());
		}
		Neinth.sideEffects.get(path).add(async () => {
			Neinth.runContentCallback(neinthInstance, mainFilePath);
		});
		resume();
		return ret_;
	};
	run = async () => {
		const path_ = this.basePath;
		const fileConfig = join(path_, this.configName);
		if (!existsSync(fileConfig)) {
			console.error({ fileConfig, error: 'fileConfig not exist' });
			return;
		}
		/**
		 * @type {neinthManage|false}
		 */
		let configFile;
		let error_ = false;
		try {
			configFile = (await import(`file://${fileConfig}`)).default;
		} catch (error) {
			try {
				configFile = (await import(fileConfig)).default;
			} catch (error) {
				error_ = error;
			}
		}
		if (error_ !== false || !(configFile instanceof neinthManage)) {
			console.error({
				error: error_,
				configFile,
				message: 'configFile is badly formed;',
				solution: 'configFile must export default instance of neinthManage;',
			});
			return;
		}
		if (!configFile) {
			return;
		}
		const { folderPath } = configFile;
		Neinth.sourcePath = join(this.basePath, folderPath);
		chokidar
			.watch(Neinth.sourcePath)
			.on('add', Neinth.onCreateOrChanges)
			.on('change', Neinth.onCreateOrChanges)
			.on('unlink', Neinth.onDelete);
	};
	/**
	 * @type {string}
	 */
	static sourcePath;
	/**
	 * @private
	 * Compare two sets and return added and deleted items.
	 * @param {Set<neinth>} prevSet
	 * @param {Set<neinth>} nextSet
	 * @returns {{ added: Set<neinth>, deleted: Set<neinth> }}
	 */
	static compareSets = (prevSet, nextSet) => {
		const added = new Set();
		const deleted = new Set();
		const prevMap = new Map([...prevSet].map((item) => [item.path, item]));
		const nextMap = new Map([...nextSet].map((item) => [item.path, item]));
		for (const [path, item] of prevMap) {
			if (!nextMap.has(path)) {
				deleted.add(item);
			}
		}
		for (const [path, item] of nextMap) {
			if (!prevMap.has(path)) {
				added.add(item);
			}
		}
		return { added, deleted };
	};
	/**
	 * @private
	 * @param {string} path_
	 * @param {import('fs').Stats} _
	 */
	static onCreateOrChanges = async (path_, _) => {
		const { resume } = await Q.unique(path_);
		if (Neinth.sideEffects.has(path_)) {
			const sideEffects = Neinth.sideEffects.get(path_);
			sideEffects.forEach((sideEffect) => {
				sideEffect();
			});
			resume();
			return;
		}
		/**
		 * @type {neinth|Set<neinth>|false}
		 */
		let prevMapped = false;
		if (Neinth.mapped.has(path_)) {
			prevMapped = Neinth.mapped.get(path_);
		}
		/**
		 * @type {neinth|Set<neinth>}
		 */
		let neinthInstances;
		try {
			neinthInstances = (await import(`file://${path_}?${Date.now()}`)).default;
		} catch (error) {
			try {
				neinthInstances = (await import(`${path_}?${Date.now()}`)).default;
			} catch (error) {
				console.error({
					path: path_,
					neinthInstances,
					message: "there's nothing exported at deafult",
				});
				resume();
				return;
			}
		}
		if (neinthInstances instanceof neinth) {
			Neinth.runContentCallback(neinthInstances, path_);
			Neinth.mapped.set(path_, neinthInstances);
		} else if (neinthInstances instanceof Set && neinthInstances.entries()[0] instanceof neinth) {
			/**
			 * @type {{added: Set<neinth<any>>,deleted: Set<neinth<any>>}}
			 */
			let compared = { added: new Set(), deleted: new Set() };
			if (prevMapped instanceof Set && prevMapped.entries()[0] instanceof neinth) {
				compared = Neinth.compareSets(prevMapped, neinthInstances);
			}
			const { added, deleted } = compared;
			deleted.forEach((neinthInstance) => {
				Neinth.deleteHandler(neinthInstance);
			});
			added.forEach((neinthInstance) => {
				Neinth.runContentCallback(neinthInstance, path_);
			});
			Neinth.mapped.set(path_, neinthInstances);
		}
		resume();
	};
	/**
	 * @private
	 * @param {string} path_
	 * @param {import('fs').Stats} _
	 * @returns {Promise<void>}
	 */
	static onDelete = async (path_, _) => {
		const { resume } = await Q.unique(path_);
		if (Neinth.sideEffects.has(path_)) {
			Neinth.sideEffects.delete(path_);
			resume();
			return;
		}
		if (!Neinth.mapped.has(path_)) {
			resume();
			return;
		}
		const neinthInstances = Neinth.mapped.get(path_);
		if (neinthInstances instanceof neinth) {
			Neinth.deleteHandler(neinthInstances);
			Neinth.mapped.delete(path_);
		} else if (neinthInstances instanceof Set && neinthInstances.entries()[0] instanceof neinth) {
			neinthInstances.forEach((neinthInstance) => {
				Neinth.deleteHandler(neinthInstance);
			});
			Neinth.mapped.delete(path_);
		}
		resume();
	};
	/**
	 * @private
	 * @param {neinth} neinthInstance
	 */
	static deleteHandler = async (neinthInstance) => {
		if (!(neinthInstance instanceof neinth)) {
			return;
		}
		const { fullPath } = neinthInstance;
		console.log({ success: 'successfully delete `fullPath`', fullPath });
		rmSync(fullPath);
	};
	/**
	 * @type {Map<string, neinth|Set<neinth>>}
	 */
	static mapped = new Map();
	static neinthRun = () => {};
	/**
	 * @private
	 * @param {string} filePath
	 * @param {string} data
	 */
	static safeWriteFile = (filePath, data) => {
		const dir = dirname(filePath);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		writeFileSync(filePath, data);
	};
	/**
	 * @private
	 * @type {_Queue["assign"]}
	 */
	static Q;
	static {
		Neinth.Q = new _Queue().assign;
	}
	/**
	 * @private
	 * @param {neinth} neinthInstance
	 * @param {string} mainFilePath
	 * @returns {void}
	 */
	static runContentCallback = (neinthInstance, mainFilePath) => {
		Neinth.Q(
			new _QueueObject(mainFilePath, async () => {
				const { path, fullPath, contentCallback } = neinthInstance;
				Neinth.safeWriteFile(
					fullPath,
					await contentCallback({
						path: path,
						fullPath: fullPath,
						import_: async (path__) =>
							await Neinth.import(
								join(dirname(mainFilePath), path__),
								neinthInstance,
								mainFilePath
							),
					})
				);
				console.log({
					fullPath,
					message: 'successfully handle fullPath',
				});
			})
		);
	};
}
