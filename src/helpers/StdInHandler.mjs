// @ts-check

import { PassiveSignal } from '../neinth/PassiveSignal.mjs';

/**
 * @description
 * - class wrapper for several statics, mainly for handling `stdInput`;
 * - provides `listenToStdIn` functionality;
 * - exported for more concise IDE for `bufferToStrings` static method;
 */
export class StdInHandler {
	/**
	 * - convert Buffer into `Array<string>`
	 * @param {Buffer} buffer
	 * @param {Object} [options]
	 * @param {BufferEncoding} [options.encoding]
	 * @param {string} [options.delimiter]
	 * @returns {false|Array<string>}
	 */
	static bufferToStrings = (buffer, { encoding = 'utf8', delimiter = ' ' } = {}) => {
		const ret_ = buffer?.toString(encoding).replace(/\s+/g, ' ').trim().split(delimiter);
		if (!Array.isArray(ret_)) {
			return false;
		}
		return ret_;
	};
	/**
	 * - convert Buffer into `Array<string>`, with id as validation;
	 * @param {Buffer} buffer
	 * @param {Object} options
	 * @param {string} options.namespace
	 * - used for `namespacing` cli by validating the first string;
	 * @param {BufferEncoding} [options.encoding]
	 * @param {string} [options.delimiter]
	 * @returns {false|Array<string>}
	 * - false: if first string is not the same with `namespace`;
	 * - Array<string>: if first string is validated, the `returnedArray` doesn't include the first string;
	 */
	static bufferToCLIStrings = (buffer, { namespace, encoding, delimiter }) => {
		const strings = StdInHandler.bufferToStrings(buffer, { encoding, delimiter });
		if (strings == false || strings[0] !== namespace) {
			return false;
		}
		strings.shift();
		return strings;
	};
	/**
	 * @type {PassiveSignal<Buffer>}
	 */
	static signal = new PassiveSignal(undefined);
	/**
	 * @private
	 * @type {boolean}
	 */
	static isLitening = false;
	/**
	 * @returns {void}
	 */
	static listen = () => {
		if (StdInHandler.isLitening) {
			return;
		}
		StdInHandler.isLitening = true;
		const signal = StdInHandler.signal;
		let exited = false;
		/**
		 * @param {Buffer} chunk
		 * @returns {void}
		 */
		const onData = (chunk) => {
			/**
			 * bypassing `PassiveSignal` assignment IDE;
			 */
			// @ts-expect-error
			signal.value = chunk;
		};
		process.stdin.resume();
		process.stdin.on('data', onData);
		const processExits = () => {
			if (exited) {
				return;
			}
			exited = true;
			process.stdin.removeListener('data', onData);
			process.stdin.pause();
			process.exit();
		};
		process.on('SIGINT', () => {
			console.log('Received SIGINT (e.g., Ctrl+C)');
			processExits();
		});
		process.on('SIGTERM', () => {
			console.log('Received SIGTERM');
			processExits();
		});
	};
	/**
	 * - single signal listener;
	 * @returns {PassiveSignal<Buffer>}
	 * - the `PassiveSignalInstance.value` is a Buffer, so you need to transform it with `neinthInstance.bufferToStrings` or `neinthInstance.bufferToCLIStrings`;
	 * - the `PassiveSignalInstance.value` `getter` can be unwrapped inside `Effect` `callback` to be listened to;
	 */
	static listenToStdIn = () => {
		StdInHandler.listen();
		return StdInHandler.signal;
	};
}
