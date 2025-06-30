// @ts-check
/**
 * generated using:
 * @see {@link https://www.npmjs.com/package/@html_first/js_lib_template | @html_first/js_lib_template}
 * @copyright
 * build and distributed under MIT licencse
 * @description
 * ## neinth code manager
 * - is a simple code management library;
 * - it helps you generates code programatically;
 * - progressively update `neinthScritps` as you write and saves:
 * >- making it technically more efficient then using build in js `runtime` `--watch`, since `neinth` doesn't need to be interpreted again by `js` `runtime` when changes happens;
 * 
 * ## installing starter project
 * > you might need to stick to single package manager to run the binary, (such as `bun`/`bunx` or others):
 * ```shell
 * npm i neinth
 * npx neinth-starter -p your-package-name
 * ```
 * 
 * ## installing distributed `neinth script` project
 * > from symlinked using `link` api of your package manager,
 * 
 * > ⚠⚠⚠ the `i` flag are for fresh installation, and might overwrite same name file, suggested to rename the every other than `core` `dir` into something else; ⚠⚠⚠
 * - ⚠⚠⚠ installation ⚠⚠⚠:
 * ```shell
 * npm link your-package-name
 * npx neinth-package -p your-package-name -i
 * ```
 * - update:
 * ```shell
 * npx neinth-package -p your-package-name
 * ```
 * > distributed npm library:
 * - ⚠⚠⚠ installation ⚠⚠⚠:
 * ```shell
 * npm i your-package-name
 * npx neinth-package -p your-package-name -i
 * ```
 * - update:
 * ```shell
 * npm i your-package-name
 * npx neinth-package -p your-package-name
 * ```
 * 
 * ## running `neinth-src`
 * - refer to [NeinthComponent](#neinthcomponent) for handling your logic;
 * 
 * ```shell
 * npx neinth
 * ```
 * - neinth only support `.mjs` extention out of the box, but you can still use `.ts` or `.mts` by generating `.mjs` files inside the `neinth-src`
 * 
 * ## convenience for distributing `neinth script`
 * dir structure:
 * > `package root`
 * >- `neinth-src`
 * >>- `your-package-name`: must refer to valid distributed `package.json.name`, whether `symlinked` or through `npm`;
 * >>>- `core`: this path are not to be edited by user and are used for when updating distributed packages;
 * >>>- other then `core`: these dirs are to be able to be safely edited, and must not be needed to be auto overwrited when updating, any update that requires modification in any of these dirs must be documented for manual update;
 * 
 * ## further documentation and example
 * - use cases will be posted at [html-first/neinth](https://html-first.bss.design/);
 * 
 * ## .vscode snippets:
 * - `>>Neinth_Config`:
 * >- use to generate config class file, importable via options `listenToNeinth`;
 * >- can also be used for autodocumentation, via [@html_first/js_lib_template](https://www.npmjs.com/package/@html_first/js_lib_template);
 * - `>>Neinth_Module`:
 * >- to generate neinth instance for modules;
 * - `>>Neinth_Watcher`:
 * >- generate `reactive` chokidar watcher, fully managed via `neinthScript`;
 * >- auto-notify on `all` event to any `neinth module` importing it via `listenToNeinth`;
 * - `>>Neinth_UpdateValue`:
 * >- typehint helper for updating the value;
 * - `>>Neinth_UpdateValue$`:
 * >- typehint helper for updating the value;
 * >- also an `vivth.$`;
 * - `>>Neinth_Worker`:
 * >- generate worker defintion file string;
 * >- should be named `${fileName}.worker.mjs`;
 * - `>>Neinth_GetShared`:
 * >- generate typehelper for getSharedData;
 * - `>>Neinth_SetShared`:
 * >- generate typehelper for setSharedData;
 * ## version
 * - `-0.10.x`:
 * >- the `arg0` are `Effect`, therefore main function will rerun on listener/importers `autosubscribed` `Signals`;
 * - `0.11.x`:
 * >- class renames;
 * >- `Effects` are now callables via `this.new$` or `this.updateValue$`, for more granularity on `autoSubscribed` `Signals`;
 * >- this version is likely to be used as standards for future releases;
 * ## main class for instantition:
 * - [NeinthComponent](#neinthcomponent): as main logic;
 * - [NeinthWatcher](#neinthwatcher): as helper for watcher;
 * - [NeinthWorker](#neinthworker): as `workerThread` wrapper;
 * 
 */
export { Infos } from './src/helpers/Infos.mjs';
export { StdInHandler } from './src/helpers/StdInHandler.mjs';
export { NeinthComponent } from './src/neinth/NeinthComponent.mjs';
export { PassiveSignal } from './src/neinth/PassiveSignal.mjs';
export { SetOfFiles } from './src/neinth/SetOfFiles.mjs';
export { NeinthRuntime } from './src/NeinthRuntime.mjs';
export { NeinthWatcher } from './src/watcher/NeinthWatcher.mjs';
export { DataWorkers } from './src/worker/DataWorkers.mjs';
export { NeinthWorker } from './src/worker/NeinthWorker.mjs';
export { WorkerContract } from './src/worker/WorkerContract.mjs';
/**
 * @typedef {import('./src/neinth/list/NeinthList.mjs').NeinthList} NeinthList
 */
/**
 * @template {NeinthList} neinthPath
 * @typedef {import('./src/neinth/list/NeinthList.mjs').GetNeinth<neinthPath>} GetNeinth
 */
/**
 * @typedef {Object} writeFileType
 * @property {string} relativePathFromProjectRoot
 * @property {Object} template
 * @property {string} [template.string]
 * @property {{[globalMultilineRegexString:string]:string}} [template.modifier]
 * - globalMultilineRegexString are allready flagged with `gm`;
 * @property { BufferEncoding | null | undefined } [encoding]
 */
/**
 * @typedef {import('./src/worker/list/WorkersList.mjs').WorkersList} WorkersList
 */
/**
 * @template {WorkersList} workersPath
 * @typedef {import('./src/worker/list/WorkersList.mjs').GetWorker<workersPath>} GetWorker
 */