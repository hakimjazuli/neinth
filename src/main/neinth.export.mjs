// @ts-check

import { join } from 'path';
import { _QueueFIFO, _QueueObjectFIFO } from '@html_first/simple_queue';
import { Neinth } from './Neinth.mjs';

/**
 * @description
 * - inside the `folderPath` inputed in the [neinthManage](#neinthmanage) create file handlers by exporting default of this class instance;
 * ```js
 * // @ts-check
 *
 * import { neinth } from 'neinth';
 * export [blank]default new neinth({...options});
 * // or
 *
 * export [blank]default neinth.loop({...options});
 * ```
 * - options is typehinted;
 */
/**
 * @template {string} P
 */
export class neinth {
	/**
	 * @param {P} path
	 * - relative to active root path
	 * @param {(arg0:{path:P, fullPath:string, import_:(path:string)=>Promise<any>})=>Promise<string>} contentCallback
	 * - path: path, the same with inputed first argument string;
	 * - fullPath: absolute path of path;
	 * - import_: managed import by neinth for reactive developement;
	 */
	constructor(path, contentCallback) {
		this.path = path;
		this.fullPath = join(Neinth.__.basePath, path);
		this.contentCallback = contentCallback;
	}
	contentCallback;
	/**
	 * @type {P}
	 */
	path;
	/**
	 * @type {string}
	 */
	fullPath;
	/**
	 * @type {Set<string>}
	 */
	uniqueSet = new Set();
	/**
	 * @template {string} T
	 * @param {object} a0
	 * @param {Array<T>} a0.targetPaths
	 * - relative to active root path
	 * @param {(arg0:{path:T, fullPath:string, import_:(path:string)=>Promise<any>})=>Promise<string>} a0.contentCallback
	 * - path: path, the same with inputed first argument string;
	 * - fullPath: absolute path of path;
	 * - import_: managed import by neinth for reactive developement;
	 * @returns {Set<neinth>}
	 */
	static loop = ({ targetPaths, contentCallback }) => {
		const ret_ = new Set();
		for (let i = 0; i < targetPaths.length; i++) {
			const path = targetPaths[i];
			ret_.add(new neinth(path, contentCallback));
		}
		return ret_;
	};
}
