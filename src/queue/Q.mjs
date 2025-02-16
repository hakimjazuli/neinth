// @ts-check

/**
 * @typedef {{}|null|number|string|boolean|symbol|bigint|function} anyButUndefined
 */
export class Q {
	/**
	 * @private
	 * @type {Promise<void>}
	 */
	static fifo_ = Promise.resolve();
	/**
	 * Blocks execution for subsequent calls until the current one finishes.
	 * @returns {Promise<{resume:()=>void}>} Resolves when it's safe to proceed, returning a cleanup function
	 */
	static fifo = async () => {
		let resolveFn;
		const next = new Promise((resolve) => {
			resolveFn = resolve;
		});
		const prev = Q.fifo_;
		Q.fifo_ = next;
		await prev;
		return {
			resume: () => {
				resolveFn(); // Resolve the current task
			},
		};
	};
	/**
	 * @type {Map<any, Promise<any>>}
	 */
	static uniqueQ = new Map();
	/**
	 * Ensures that each id has only one task running at a time.
	 * Calls with the same id will wait for the previous call to finish.
	 * @param {anyButUndefined} id
	 * @returns {Promise<{resume:()=>void}>} Resolves when it's safe to proceed for the given id, returning a cleanup function
	 */
	static unique = async (id) => {
		if (!Q.uniqueQ.has(id)) {
			Q.uniqueQ.set(id, Promise.resolve());
			let resolveFn;
			const next = new Promise((resolve) => {
				resolveFn = resolve;
			});
			const prev = Q.uniqueQ.get(id);
			Q.uniqueQ.set(id, next);
			await prev;
			return {
				resume: () => {
					resolveFn();
					Q.uniqueQ.delete(id);
				},
			};
		} else {
			const prev = Q.uniqueQ.get(id);
			await prev;
			return await Q.unique(id);
		}
	};
}
