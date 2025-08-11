// @ts-check

import { NeinthRuntime } from '../NeinthRuntime.mjs';
import { Dirent, statSync, readFileSync, Stats } from 'fs';
import { basename, join, relative, extname, dirname } from 'path';
import { TrySync } from 'vivth';

/**
 * @description
 * - class typeHelper for file infos using [neinthWatcher](#neinthwatcher);
 * - containts `Dirent` and additional usefull property for the returned `file/dir`;
 */
export class Infos {
	/**
	 * @param {Dirent} dirent
	 * @param {BufferEncoding} [encoding]
	 */
	constructor(dirent, encoding = 'utf-8') {
		this.dirent = dirent;
		/**
		 * @private
		 */
		this._fullPath = join(dirent.parentPath, dirent.name);
		/**
		 * @private
		 */
		this._relativePath = relative(NeinthRuntime.projectRoot, this._fullPath);
		/**
		 * @private
		 */
		this._encoding = encoding;
	}
	/**
	 * @boolean
	 */
	get isFile() {
		return this.stats.isFile();
	}
	/**
	 * @boolean
	 */
	get isDirectory() {
		return this.stats.isDirectory();
	}
	get baseName() {
		const this_ = this;
		return {
			/**
			 * @type {string}
			 */
			get withExt() {
				return basename(this_._fullPath);
			},
			/**
			 * @type {string}
			 */
			get noExt() {
				return basename(this_._fullPath, extname(this_._fullPath));
			},
		};
	}
	get path() {
		const this_ = this;
		return {
			/**
			 * @type {string}
			 */
			get relative() {
				return this_._relativePath;
			},
			/**
			 * @type {string}
			 */
			get full() {
				return this_._fullPath;
			},
		};
	}
	get dirName() {
		const this_ = this;
		return {
			/**
			 * @type {string}
			 */
			get relative() {
				return relative(process.cwd(), dirname(this_._fullPath));
			},
			/**
			 * @type {string}
			 */
			get full() {
				return dirname(this_._fullPath);
			},
		};
	}
	get ext() {
		const this_ = this;
		return {
			/**
			 * @type {string|undefined}
			 */
			get withDot() {
				if (this_.isDirectory && !this_.isFile) {
					return undefined;
				}
				return extname(this_._fullPath);
			},
			/**
			 * @type {string|undefined}
			 */
			get noDot() {
				if (this_.isDirectory && !this_.isFile) {
					return undefined;
				}
				return extname(this_._fullPath).replace(/^\./, '');
			},
		};
	}
	/**
	 * @private
	 * @type {Stats}
	 */
	_stats;
	/**
	 * @private
	 * @returns {Stats}
	 */
	get stats() {
		if (!this._stats) {
			this._stats = statSync(this._fullPath);
		}
		return this._stats;
	}
	get timeStamp() {
		const this_ = this;
		return {
			/**
			 * @type {number}
			 */
			get lastModified() {
				return this_.stats.mtimeMs;
			},
			/**
			 * @type {number}
			 */
			get createdAt() {
				return this_.stats.birthtimeMs;
			},
		};
	}
	/**
	 * @private
	 * @type {string}
	 */
	_rawContent;
	/**
	 * @type {string|undefined}
	 */
	get content() {
		if (this.isDirectory && !this.isFile) {
			return undefined;
		}
		const [raw, error] = TrySync(() => {
			return readFileSync(this._fullPath, this._encoding);
		});
		if (!error) {
			this._rawContent = raw;
			return this._rawContent;
		}
		console.error({
			error: NeinthRuntime.parseError(error),
			fullPath: this._fullPath,
			message2: 'failed to read fullPath',
		});
		return undefined;
	}
	/**
	 * @type {undefined|Promise<any>}
	 */
	get importAsModuleJS() {
		const realTimePath = `${this._fullPath}?${Date.now()}`;
		let [importedModule, error] = TrySync(async () => {
			return import(`file://${realTimePath}`);
		});
		if (!error) {
			return importedModule;
		}
		[importedModule, error] = TrySync(() => {
			return import(realTimePath);
		});
		if (!error) {
			return importedModule;
		}
		console.error({ error: NeinthRuntime.parseError(error), timeStamp: Date.now() });
		return undefined;
	}
}
