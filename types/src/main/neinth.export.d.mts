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
export class neinth<P extends string> {
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
    static loop: <T extends string>({ targetPaths, contentCallback }: {
        targetPaths: Array<T>;
        contentCallback: (arg0: {
            path: T;
            fullPath: string;
            import_: (path: string) => Promise<any>;
        }) => Promise<string>;
    }) => Set<neinth<any>>;
    /**
     * @param {P} path
     * - relative to active root path
     * @param {(arg0:{path:P, fullPath:string, import_:(path:string)=>Promise<any>})=>Promise<string>} contentCallback
     * - path: path, the same with inputed first argument string;
     * - fullPath: absolute path of path;
     * - import_: managed import by neinth for reactive developement;
     */
    constructor(path: P, contentCallback: (arg0: {
        path: P;
        fullPath: string;
        import_: (path: string) => Promise<any>;
    }) => Promise<string>);
    /**
     * @type {P}
     */
    path: P;
    /**
     * @type {string}
     */
    fullPath: string;
    contentCallback: (arg0: {
        path: P;
        fullPath: string;
        import_: (path: string) => Promise<any>;
    }) => Promise<string>;
    /**
     * @type {Set<string>}
     */
    uniqueSet: Set<string>;
}
