export class Neinth {
    /**
     * @type {Neinth}
     */
    static __: Neinth;
    /**
     * @type {Map<string, Set<()=>Promise<void>>>}
     */
    static sideEffects: Map<string, Set<() => Promise<void>>>;
    /**
     * @param {string} path
     * @param {neinth} neinthInstance
     * @param {string} mainFilePath
     * @returns {Promise<any>}
     */
    static import: (path: string, neinthInstance: neinth<any>, mainFilePath: string) => Promise<any>;
    /**
     * @type {string}
     */
    static sourcePath: string;
    /**
     * @private
     * Compare two sets and return added and deleted items.
     * @param {Set<neinth>} prevSet
     * @param {Set<neinth>} nextSet
     * @returns {{ added: Set<neinth>, deleted: Set<neinth> }}
     */
    private static compareSets;
    /**
     * @private
     * @param {string} path_
     * @param {import('fs').Stats} _
     */
    private static onCreateOrChanges;
    /**
     * @private
     * @param {string} path_
     * @param {import('fs').Stats} _
     * @returns {Promise<void>}
     */
    private static onDelete;
    /**
     * @private
     * @param {neinth} neinthInstance
     */
    private static deleteHandler;
    /**
     * @type {Map<string, neinth|Set<neinth>>}
     */
    static mapped: Map<string, neinth<any> | Set<neinth<any>>>;
    static neinthRun: () => void;
    /**
     * @private
     * @param {string} filePath
     * @param {string} data
     */
    private static safeWriteFile;
    /**
     * @private
     * @type {_Queue["assign"]}
     */
    private static Q;
    /**
     * @private
     * @param {neinth} neinthInstance
     * @param {string} mainFilePath
     * @returns {void}
     */
    private static runContentCallback;
    /**
     * @private
     * @type {string}
     */
    private basePath_;
    /**
     * @type {string}
     */
    get basePath(): string;
    /**
     * @private
     * @type {string}
     */
    private configName;
    run: () => Promise<void>;
}
import { neinth } from 'neinth';
