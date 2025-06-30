// @ts-check

import { Signal } from 'vivth';

/**
 * @description
 * ```js
 * /**
 *  * @template V
 *  * @extends Signal<V>
 *  *[blank]/
 * ```
 * - deliberate jsdoc lock for `value` assignment, require to be bypassed with `// @ts-expect-error`, if necessary;
 */
export class PassiveSignal extends Signal {
	/**
	 * @param {V} value
	 */
	constructor(value) {
		super(value);
	}
	/**
	 * @protected
	 * @param {V} newValue
	 */
	set value(newValue) {
		super.value = newValue;
	}
	get value() {
		return super.value;
	}
}
