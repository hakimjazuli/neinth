/**
 * @typedef {{}|null|number|string|boolean|symbol|bigint|function} anyButUndefined
 */
export class Q {
    /**
     * @private
     * @type {Promise<void>}
     */
    private static fifo_;
    /**
     * Blocks execution for subsequent calls until the current one finishes.
     * @returns {Promise<{resume:()=>void}>} Resolves when it's safe to proceed, returning a cleanup function
     */
    static fifo: () => Promise<{
        resume: () => void;
    }>;
    /**
     * @type {Map<any, Promise<any>>}
     */
    static uniqueQ: Map<any, Promise<any>>;
    /**
     * Ensures that each id has only one task running at a time.
     * Calls with the same id will wait for the previous call to finish.
     * @param {anyButUndefined} id
     * @returns {Promise<{resume:()=>void}>} Resolves when it's safe to proceed for the given id, returning a cleanup function
     */
    static unique: (id: anyButUndefined) => Promise<{
        resume: () => void;
    }>;
}
export type anyButUndefined = {} | null | number | string | boolean | symbol | bigint | Function;
