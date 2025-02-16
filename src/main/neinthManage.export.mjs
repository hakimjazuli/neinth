// @ts-check

/**
 * @description
 * - if you install it using `npm`, you can find the implementation in the `./neinth.config.mjs`;
 * - as of now we only read the config from `./neinth.config.mjs`, no other extention;
 * - you can manually create it and fill it with:
 * ```js
 * // @ts-check
 *
 *import { neinthManage } from 'neinth';
 *
 *export default new neinthManage({
 *		folderPath: './neinth',
 *});
 * ```
 * and inside
 */
export class neinthManage {
	/**
	 * @param {Object} a0
	 * @param {string} a0.folderPath
	 */
	constructor({ folderPath }) {
		this.folderPath = folderPath;
	}
}
